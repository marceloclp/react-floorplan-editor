type SufixedDict<S extends string, O> = {
  [K in keyof O as K extends string ? `${K}${S}` : never]: O[K];
};

export function sufixObj<S extends string, O extends Record<string, any>>(sufix: S, object: O): SufixedDict<S, O> {
  return Object.keys(object).reduce(
    (obj, key) => ({ ...obj, [`${key}${sufix}`]: object[key] }),
    {} as SufixedDict<S, O>
  );
};
