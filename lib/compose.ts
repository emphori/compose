import { Promise } from "@emphori/promise";

export declare type ComposableFunction<C1, I1 extends any[], R1, E1> =
  (this: C1, ...args: I1) => Promise<R1, E1>;

/**
 * If you see this error message when building your code, it's likely that
 * you're adding a function to a composition that is destined to fail.
 */
export type UnreachableFunctionWarning = "Your function will never be run";

/**
 * @todo Document the "UnaryComposableFunction" type
 */
export declare type UnaryComposableFunction<C1, R1, R2, E1> =
  [R1] extends [never] ? UnreachableFunctionWarning : ComposableFunction<C1, [R1], R2, E1>;

/**
 * @todo Document the "Composition" interface
 */
export interface Composition<C1, I1 extends any[], R1, E1> extends ComposableFunction<C1, I1, R1, E1> {
  then<R2, __, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, R1, R2, never>):
    Composition<C2, I1, R2, E1>;

  then<R2, E2, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, R1, R2, E2>):
    Composition<C2, I1, R2, E2 | E1>;

  catch<__, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, E1, R1, never>):
    Composition<C2, I1, R1, never>;

  catch<E2, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, E1, R1, E2>):
    Composition<C2, I1, R1, E2>;
}

/**
 * A composition factory that chains Promises together in a functional manner.
 *
 * @param fn - The function to compose
 */
export function compose<C1, I1 extends any[], R1, E1 = unknown>(fn: ComposableFunction<C1, I1, R1, E1>): Composition<C1, I1, R1, E1> {
  return Object.setPrototypeOf(function (this: C1) {
    return fn.apply(this, arguments as any as I1);
  }, composable);
}

function composable () {}

composable.then = function (this: any, fn: any): any {
  const run = this;
  return compose(function () {
    return run.apply(this, arguments).then((val: any) => fn.call(this, val));
  });
}

composable.catch = function (this: any, fn: any): any {
  const run = this;
  return compose(function () {
    return run.apply(this, arguments).catch((val: any) => fn.call(this, val));
  });
}

// export const resolve: typeof Promise.resolve = Promise.resolve.bind(Promise);
// export const reject: typeof Promise.reject = Promise.reject.bind(Promise);

// export const resolve = <T>(_: T) => Promise.resolve<T>(_);
// export const reject = <T>(_: T) => Promise.reject<T>(_);

export function resolve<T>(_: T) { return Promise.resolve<T>(_) }
export function reject<T>(_: T) { return Promise.reject<T>(_) }

export function tap<C1, I1, E1>(fn: ComposableFunction<C1, [I1], any, E1>) {
  return function (this: C1, val: I1) {
    return fn.call(this, val).then(() => val);
  }
}
