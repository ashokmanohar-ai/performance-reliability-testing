import { checkoutDuration, orderCreationDuration } from '../metrics/custom-metrics.js';
import { tags } from '../metrics/tags.js';
import { request } from './base-client.js';

export function createCart(baseUrl, token) {
  return request('POST', `${baseUrl}/api/cart`, {}, token, tags.cart);
}

export function addCartItem(baseUrl, token, cartId, productId, quantity = 1) {
  return request(
    'POST',
    `${baseUrl}/api/cart/items`,
    { cartId, productId, quantity },
    token,
    tags.cart
  );
}

export function createOrder(baseUrl, token, cartId) {
  const started = Date.now();
  const response = request('POST', `${baseUrl}/api/orders`, { cartId }, token, tags.checkout);
  const elapsed = Date.now() - started;
  checkoutDuration.add(elapsed);
  orderCreationDuration.add(elapsed);
  return response;
}

export function getOrders(baseUrl, token, userId) {
  return request('GET', `${baseUrl}/api/customers/${userId}/orders`, undefined, token, tags.orders);
}
