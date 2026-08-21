import { readFile } from 'node:fs/promises';
import { compareResults } from '../quality/regression-detector.js';

const baselinePath = process.argv[2] ?? 'results/history/demo-baseline.json';
const currentPath = process.argv[3] ?? 'results/current/summary.json';
const [baseline, current] = await Promise.all([
  readFile(baselinePath, 'utf8').then(JSON.parse),
  readFile(currentPath, 'utf8').then(JSON.parse)
]);
console.table(compareResults(current, baseline).metrics);
