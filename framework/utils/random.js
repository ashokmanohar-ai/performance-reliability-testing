export function randomBetween(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function weightedChoice(weights) {
  const roll = Math.random() * 100;
  let accumulated = 0;
  for (const [name, weight] of Object.entries(weights)) {
    accumulated += weight;
    if (roll < accumulated) return name;
  }
  return Object.keys(weights)[0];
}
