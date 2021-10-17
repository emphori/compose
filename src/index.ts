/**
 * A composition factory that glues strongly typed Promises together in a
 * functional manner.
 */
export class Chain<C1, E1, V1, V2> {
  constructor(private fn: (this: C1, _: V1) => Promise<V2, E1>) {}

  run(context: C1, value?: V1): Promise<V2, E1> {
    return this.fn.call(context, value!)
  }

  then<V3, E2>(fn: (this: C1, _: V2) => Promise<V3, E2>): Chain<C1, E1 | E2, V1, V3> {
    const run = this.run.bind(this);
    return new Chain(function (this: C1, value: V1): Promise<V3, E1> {
      return run(this, value).then(fn.bind(this), Promise.reject);
    });
  }

  recover<E2>(fn: (this: C1, _: E1) => Promise<V2, E2>): Chain<C1, E2, V1, V2> {
    const run = this.run.bind(this);
    return new Chain(function (this: C1, value: V1): Promise<V2, E2> {
      return run(this, value).then(Promise.resolve, fn.bind(this));
    });
  }

  static from<C, E, V1, V2>(fn: (this: C, _: V1) => Promise<V2, E>): Chain<C, E, V1, V2> {
    return new Chain(fn);
  }
}

/**
 * A more strongly typed Promise interface that allows type assertions on both
 * the resolved and rejected values.
 */
export interface Promise<T1, T2 = never> extends globalThis.Promise<T1> {
  then<R1 = T1, R2 = T2>(
    resolve: ((_: T1) => R1 | Promise<R1, R2 | T2>) | unknown,
    reject: ((_: T2) => R2 | Promise<T1, R2 | T2>) | unknown,
  ): Promise<R1, R2>;
}

/**
 * @see {Promise}
 * 
 * @todo Add type interfaces for the remaing static methods found on a Promise
 */
interface PromiseConstructor extends globalThis.PromiseConstructor {
  new <T1, T2>(fn: (
    resolve: (_: T1 | Promise<T1, never>) => void,
    reject: (_: T2 | Promise<never, T2>) => void,
  ) => void): Promise<T1, T2>;

  /**
   * @todo Document the "resolve" method on the "PromiseConstructor"
   */
  resolve<T>(val: T | Promise<T, never>): Promise<T, never>;

  /**
   * @todo Document the empty "resolve" method on the "PromiseConstructor"
   */
  resolve(): Promise<void, never>;

  /**
   * @todo Document the "reject" method on the "PromiseConstructor"
   */
  reject<T>(val: T): Promise<never, T>;
}

export const Promise: PromiseConstructor = globalThis.Promise as any;
