/**
 * A composition factory that glues strongly typed Promises together in a
 * functional manner.
 * 
 * @type {C1} The context or scope that the chain runs under
 */
export class Chain<C1, E1, V1, V2> {
  constructor(private fn: (this: C1, val: V1) => V2 | Promise<V2, E1>) {}

  /**
   * @param context - The scope to be passed to the function chain
   * @param val - The initial value passed to the first function
   */
  public run(context: C1, val: V1): Promise<V2, E1> {
    return Promise.resolve<V2, E1>(this.fn.call(context, val!));
  }

  /**
   * @returns A new chain that includes the function provided 
   */
  public then<V3, E2>(fn: (this: C1, val: V2) => V3 | Promise<V3, E2>): Chain<C1, E1 | E2, V1, V3> {
    const run = this.run.bind(this);

    return new Chain(function (this: C1, val: V1): Promise<V3, E1 | E2> {
      return run(this, val).then<V3, E2>((val) => fn.call(this, val));
    });
  }

  /**
   * @returns A new chain that includes the function provided 
   */
  public recover<E2>(fn: (this: C1, val: E1) => V2 | Promise<V2, E2>): Chain<C1, E2, V1, V2> {
    const run = this.run.bind(this);
    
    return new Chain(function (this: C1, val: V1): Promise<V2, E2> {
      return run(this, val).catch<V2, E2>((val: any) => fn.call(this, val));
    });
  }
}

export function chain<C, E, V1 = null, V2 = unknown>(fn: (this: C, val: V1) => V2 | Promise<V2, E>): Chain<C, E, V1, V2> {
  return new Chain(fn);
}
