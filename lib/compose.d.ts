import { Promise } from "./promise";

export declare type ComposableFunction<C1, I1 extends any[], R1, E1> =
  ((this: C1, ...args: I1) => Promise<R1, E1>);

/**
 * If you see this error message when building your code, it's likely that
 * you're adding a function to a composition that is destined to fail.
 */
export type UnreachableFunctionWarning = "Your function will never be run";

/**
 *
 */
export declare type UnaryComposableFunction<C1, R1, R2, E1> =
  [R1] extends [never] ? UnreachableFunctionWarning : ComposableFunction<C1, [R1], R2, E1>;

/**
 *
 */
export interface Composition<C1, I1 extends any[], R1, E1> extends ComposableFunction<C1, I1, R1, E1> {
  then<R2, __, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, R1, R2, never>):
    Composition<C2, I1, R2, E1>;

  then<R2, E2, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, R1, R2, E2>):
    Composition<C2, I1, R2, E1 | E2>;

  catch<__, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, E1, R1, never>):
    Composition<C2, I1, R1, never>;

  catch<E2, C2 extends C1 = C1>(fn: UnaryComposableFunction<C2, E1, R1, E2>):
    Composition<C2, I1, R1, E2>;
}

/**
 *
 * @param fn
 */
export declare function compose<C1, I1 extends any[], R1, E1 = unknown>(fn: ComposableFunction<C1, I1, R1, E1>):
  Composition<C1, I1, R1, E1>;

export declare function resolve<T>(val: T): Promise<T, never>;
export declare function resolve(): Promise<void, never>;

export declare function reject<T>(val: T): Promise<never, T>;
export declare function reject(): Promise<never, void>;
