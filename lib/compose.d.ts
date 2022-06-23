export declare type ComposableTarget<C1, I1 extends any[], R1, E1> =
  CallableFunction & ((this: C1, ...args: I1) => Promise<R1, E1>);

export type UnreachableFunctionWarning = "Your function will never be run";

export declare type ComposableSafeFunction<C1, R1, R2> =
  [R1] extends [never] ? UnreachableFunctionWarning : ((this: C1, val: R1) => R2 | Promise<R2, never>)

export declare type ComposableUnsafeFunction<C1, R1, R2, E1 = unknown> =
  [R1] extends [never] ? UnreachableFunctionWarning : ((this: C1, val: R1) => Promise<R2, E1>)

export interface SafeComposable<C1, I1 extends any[], R1> extends ComposableTarget<C1, I1, R1, never> {
  then<R2, E1, C2 extends C1 = C1>(fn: ComposableUnsafeFunction<C2, R1, R2, E1>):
    [E1] extends [never] ? never : UnsafeComposable<C2, I1, R2, E1>;

  then<R2, __, C2 extends C1 = C1>(fn: ComposableSafeFunction<C2, R1, R2>):
    SafeComposable<C2, I1, R2>;

  catch: never;
}

export interface UnsafeComposable<C1, I1 extends any[], R1, E1> extends ComposableTarget<C1, I1, R1, never> {
  __ErrorTypeCheck__: [E1] extends [never] ? 'Please use a "SafeComposable"' : E1;

  then<R2, E2, C2 extends C1 = C1>(fn: ComposableUnsafeFunction<C2, R1, R2, E2>):
    UnsafeComposable<C2, I1, R2, E1 | E2>;

  then<R2, __, C2 extends C1 = C1>(fn: ComposableSafeFunction<C2, R1, R2>):
    UnsafeComposable<C2, I1, R2, E1>;

  catch<E2, C2 extends C1 = C1>(fn: ComposableUnsafeFunction<C2, E1, R1, E2>):
    [E2] extends [never] ? never : UnsafeComposable<C2, I1, R1, E2>;

  catch<__, C2 extends C1 = C1>(fn: ComposableSafeFunction<C2, E1, R1>):
    SafeComposable<C2, I1, R1>;
}

export declare function compose<C1, I1 extends any[], V1, E1 = never>(fn: ComposableTarget<C1, I1, V1, E1>):
  [E1] extends [never]
    ? SafeComposable<C1, I1, V1>
    : UnsafeComposable<C1, I1, V1, E1>;
