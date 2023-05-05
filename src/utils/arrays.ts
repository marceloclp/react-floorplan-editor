export function replaceAt<T>(arr: T[], index: number, value: T): T[]
export function replaceAt<T>(arr: T[], index: number, reducer: (value: T) => T): T[]
export function replaceAt<T>(arr: T[], index: number, reducer: ((value: T) => T) | T): T[] {
  return arr.map((value, j) => {
    if (index === j)
      return typeof reducer === 'function' ? reducer(value) : reducer;
    return value;
  });
};

export function insertAt<T>(arr: T[], index: number, value: T): T[] {
  return [
    ...arr.slice(0, index),
    value,
    ...arr.slice(index),
  ];
};

export function deleteAt<T>(arr: T[], index: number): T[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};
