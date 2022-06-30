import { Promise } from "./promise";

export declare type ComposableFunction<C1, I1 extends any[], R1, E1> =
  ((this: C1, ...args: I1) => Promise<R1, E1>);

/**
 * If you see this error message when building your code, it's likely that
 * you're adding a function to a composition that is destined to fail.
 */
export type UnreachableFunctionWarning = "Your function will never be run";

export declare type SafeComposableFunction<C1, R1, R2> =
  [R1] extends [never]
    ? UnreachableFunctionWarning
    : ComposableFunction<C1, [R1], R2, never>;

export declare type UnsafeComposableFunction<C1, R1, R2, E1> =
  [R1] extends [never]
    ? UnreachableFunctionWarning
    : ComposableFunction<C1, [R1], R2, E1>;

/**
 *
 */
export interface SafeComposition<C1, I1 extends any[], R1> extends ComposableFunction<C1, I1, R1, never> {
  then<R2, __, C2 extends C1 = C1>(fn: SafeComposableFunction<C2, R1, R2>):
    SafeComposition<C2, I1, R2>;

  then<R2, E1, C2 extends C1 = C1>(fn: UnsafeComposableFunction<C2, R1, R2, E1>):
    UnsafeComposition<C2, I1, R2, E1>;

  catch<__, C2 extends C1 = C1>(fn: SafeComposableFunction<C2, never, R1>): never;
}

/**
 *
 */
export interface UnsafeComposition<C1, I1 extends any[], R1, E1> extends ComposableFunction<C1, I1, R1, E1> {
  then<R2, __, C2 extends C1 = C1>(fn: SafeComposableFunction<C2, R1, R2>):
    UnsafeComposition<C2, I1, R2, E1>;

  then<R2, E2, C2 extends C1 = C1>(fn: UnsafeComposableFunction<C2, R1, R2, E2>):
    UnsafeComposition<C2, I1, R2, E1 | E2>;

  catch<__, C2 extends C1 = C1>(fn: SafeComposableFunction<C2, E1, R1>):
    SafeComposition<C2, I1, R1>;

  catch<E2, C2 extends C1 = C1>(fn: UnsafeComposableFunction<C2, E1, R1, E2>):
    UnsafeComposition<C2, I1, R1, E2>;
}

export declare function resolve<T>(val: T): Promise<T, never>;
export declare function resolve(): Promise<void, never>;

export declare function reject<T>(val: T): Promise<never, T>;
export declare function reject(): Promise<never, void>;

export declare function compose<C1, I1 extends any[], R1, E1>(fn: ComposableFunction<C1, I1, R1, E1>):
  [E1] extends [never]
    ? SafeComposition<C1, I1, R1>
    : UnsafeComposition<C1, I1, R1, E1>;
