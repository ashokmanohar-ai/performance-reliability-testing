import { tags } from '../metrics/tags.js';
import { request } from './base-client.js';

export function listProducts(baseUrl, token, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request('GET', `${baseUrl}/api/products${query}`, undefined, token, tags.products);
}

export function getProduct(baseUrl, token, id) {
  return request('GET', `${baseUrl}/api/products/${id}`, undefined, token, tags.product);
}
