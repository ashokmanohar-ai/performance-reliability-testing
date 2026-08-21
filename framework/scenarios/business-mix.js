import { businessMix } from '../config/workload-models.js';
import { weightedChoice } from '../utils/random.js';
import { browse, checkout, search } from './commerce-journey.js';

export function executeBusinessMix(config) {
  const choice = weightedChoice(businessMix);
  if (choice === 'browseProducts' || choice === 'viewProduct') return browse(config);
  if (choice === 'searchProducts') return search(config);
  if (choice === 'createCart' || choice === 'checkout') return checkout(config);
  return browse(config);
}
