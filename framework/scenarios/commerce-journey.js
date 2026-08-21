import { check, group } from 'k6';
import { businessTransactions, activeJourney } from '../metrics/custom-metrics.js';
import { login } from '../clients/auth-client.js';
import { addCartItem, createCart, createOrder } from '../clients/order-client.js';
import { pay } from '../clients/payment-client.js';
import { getProduct, listProducts } from '../clients/product-client.js';
import { idempotencyKey, productForIteration, userForVu } from '../data/generators.js';
import { userThinkTime } from '../utils/sleep-strategy.js';

let token;

export function ensureToken(config) {
  if (!token) {
    const user = userForVu();
    token = login(config.baseUrl, user.username, user.password);
  }
  return token;
}

export function browse(config) {
  const auth = ensureToken(config);
  activeJourney.add(1);
  group('browse products', () => {
    const list = listProducts(config.baseUrl, auth);
    check(list, { 'product list succeeds': (response) => response.status === 200 });
    userThinkTime(1, 2);
    const detail = getProduct(config.baseUrl, auth, productForIteration());
    check(detail, { 'product detail succeeds': (response) => response.status === 200 });
  });
  businessTransactions.add(1, { type: 'browse' });
  activeJourney.add(0);
}

export function search(config) {
  const response = listProducts(config.baseUrl, ensureToken(config), 'Product');
  check(response, {
    'search succeeds': (value) => value.status === 200 && value.json('count') > 0
  });
  businessTransactions.add(1, { type: 'search' });
  userThinkTime(1, 2);
}

export function checkout(config, includePayment = true) {
  const auth = ensureToken(config);
  let order;
  group('checkout journey', () => {
    const cart = createCart(config.baseUrl, auth);
    const cartId = cart.json('id');
    check(cart, { 'cart created': (response) => response.status === 200 && Boolean(cartId) });
    const item = addCartItem(config.baseUrl, auth, cartId, productForIteration());
    check(item, { 'item added': (response) => response.status === 200 });
    userThinkTime(1, 2);
    order = createOrder(config.baseUrl, auth, cartId);
    check(order, { 'order created': (response) => response.status === 201 });
    if (includePayment && order.status === 201) {
      const payment = pay(
        config.baseUrl,
        auth,
        order.json('id'),
        order.json('totalCents'),
        idempotencyKey()
      );
      check(payment, { 'payment completes': (response) => response.status === 201 });
    }
  });
  businessTransactions.add(1, { type: 'checkout' });
  return order;
}
