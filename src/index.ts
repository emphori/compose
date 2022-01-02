/**
 * A composition factory that glues strongly typed Promises together in a
 * functional manner.
 * 
 * @type {C1} The context or scope that the Composition runs under
 */
export function compose<C1, V1, V2, E1>(fn: (this: C1, val: V1) => Promise<V2, E1>): Composition<C1, V1, V2, E1> {
  return new Composition(fn);
}

export class Composition<C1, V1, V2, E1> {
  constructor(private fn: (this: C1, val: V1) => Promise<V2, E1>) {}

  /**
   * @param context - The scope to be passed to the composition
   * @param val - The initial value passed to the first function
   */
  public run(context: C1, val: V1): Promise<V2, E1> {
    return this.fn.call(context, val!);
  }

  /**
   * @returns A new composition that includes the function provided 
   */
  public then<V3, E2>(fn: (this: C1, val: V2) => V3 | Promise<V3, E2>): Composition<C1, V1, V3, E1 | E2> {
    const run = this.fn;

    return new Composition(function (this: C1, val: V1): Promise<V3, E1 | E2> {
      return run.call(this, val).then<V3, E2>((val) => fn.call(this, val));
    });
  }

  /**
   * @returns A new composition that includes the function provided 
   */
  public catch<E2>(fn: (this: C1, val: E1) => V2 | Promise<V2, E2>): Composition<C1, V1, V2, E2> {
    const run = this.fn;
    
    return new Composition(function (this: C1, val: V1): Promise<V2, E2> {
      return run.call(this, val).catch<V2, E2>((val: any) => fn.call(this, val));
    });
  }
}
