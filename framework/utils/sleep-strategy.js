import { sleep } from 'k6';
import { randomBetween } from './random.js';

export function userThinkTime(minimumSeconds = 1, maximumSeconds = 3) {
  sleep(randomBetween(minimumSeconds * 10, maximumSeconds * 10) / 10);
}
