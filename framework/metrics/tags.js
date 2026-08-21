export const tags = {
  login: { endpoint: 'login', transaction: 'authentication' },
  products: { endpoint: 'products', transaction: 'browse' },
  product: { endpoint: 'product', transaction: 'browse' },
  cart: { endpoint: 'cart', transaction: 'checkout' },
  checkout: { endpoint: 'checkout', transaction: 'checkout' },
  payment: { endpoint: 'payment', transaction: 'checkout' },
  orders: { endpoint: 'orders', transaction: 'order_lookup' }
};
