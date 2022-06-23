// @ts-check
"use strict";

/**
 * @typedef {import('./compose').SafeComposable<C1, R1, R2>} SafeComposable
 * @template C1, R1, R2
 */

/**
 * @typedef {import('./compose').UnsafeComposable<C1, R1, R2, E1>} UnsafeComposable
 * @template C1, R1, R2, E1
 */

/**
 * @typedef {import('./compose').UnreachableFunctionWarning} UnreachableFunctionWarning
 */

/**
 * @typedef {import('./compose').ComposableSafeFunction<C1, R1, R2>} ComposableSafeFunction
 * @template C1, R1, R2
 */

/**
 * @typedef {import('./compose').ComposableUnsafeFunction<C1, R1, R2, E1>} ComposableUnsafeFunction
 * @template C1, R1, R2, E1
 */

const { compose } = require('./compose');

/**
 * Maintaining safe compositions.
 */
{
  /** @type {SafeComposable<any, [string, string], string>} */
  const composition1 = compose(safeTarget);

  /** @type {SafeComposable<any, [string, string], [string]>} */
  const composition2 = composition1.then(safeWrapArray);

  /** @type {SafeComposable<any, [string, string], string>} */
  const composition3 = composition2.then(safeUnwrapArray);

  /** @type {SafeComposable<any, [string, string], number>} */
  const composition4 = composition3.then(safeStringLength);
}

/**
 * Adding errors to originally safe compositions.
 */
{
  /** @type {SafeComposable<any, [string, string], string>} */
  const composition1 = compose(safeTarget);

  /** @type {SafeComposable<any, [string, string], number>} */
  const composition2 = composition1.then(safeStringLength);

  /** @type {UnsafeComposable<any, [string, string], number, string>} */
  const composition3 = composition2.then(unsafeGeneric);
}

/**
 * Keeping track of errors in originally unsafe compositions.
 */
{
  /** @type {UnsafeComposable<any, [string, string], string, string>} */
  const composition1 = compose(unsafeTarget);

  /** @type {UnsafeComposable<any, [string, string], [string], string>} */
  const composition2 = composition1.then(safeWrapArray);

  /** @type {UnsafeComposable<any, [string, string], string, string>} */
  const composition3 = composition2.then(safeUnwrapArray);

  /** @type {UnsafeComposable<any, [string, string], number, string>} */
  const composition4 = composition3.then(safeStringLength);
}

/**
 * Discarding errors in originally unsafe compositions.
 */
{
  /** @type {UnsafeComposable<any, [string, string], string, string>} */
  const composition1 = compose(unsafeTarget);

  /** @type {UnsafeComposable<any, [string, string], number, string>} */
  const composition2 = composition1.then(safeStringLength);

  /** @type {SafeComposable<any, [string, string], number>} */
  const composition3 = composition2.catch(resolveErrors);
}

/**
 * Unreachable error path compositions.
 *
 * The below tests confirm that compositions that will never fail are properly
 * typed.
 */
{
  /** @type {SafeComposable<any, [string, string], string>} */
  const composition1 = compose(safeTarget);

  /** @type {(fn: ComposableSafeFunction<any, string, any>) => any} */
  const _ = composition1.then

  /** @type {(fn: UnreachableFunctionWarning) => any} */
  const __ = composition1.catch
}

/**
 * Unreachable happy path compositions.
 *
 * Although this sort of composition is highly undesireable, the below tests
 * ensure that "fail only" compositions are possible.
 */
{
  /** @type {UnsafeComposable<any, [string, string], never, string>} */
  const composition1 = compose(brokenTarget);

  /** @type {(fn: UnreachableFunctionWarning) => any} */
  const _ = composition1.then

  /** @type {(fn: ComposableUnsafeFunction<any, string, never, any>) => any} */
  const __ = composition1.catch
}

/**
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<string, never>}
 */
function safeTarget(input1, input2) {
  return Promise.resolve(input1 + input2);
}

/**
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<string, string>}
 */
function unsafeTarget(input1, input2) {
  return Promise.resolve(input1 + input2);
}

/**
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<never, string>}
 */
function brokenTarget(input1, input2) {
  return Promise.reject(input1 + input2);
}

/**
 * @param {string} input
 * @returns {Promise<[string], never>}
 */
function safeWrapArray(input) {
  return Promise.resolve([input]);
}

/**
 * @param {[string]} input
 * @returns {Promise<string, never>}
 */
function safeUnwrapArray([input]) {
  return Promise.resolve(input);
}

/**
 * @param {string} input
 * @returns {Promise<number, never>}
 */
function safeStringLength(input) {
  return Promise.resolve(input.length);
}

/**
 * @template T
 * @param {T} input
 * @returns {Promise<T, string>}
 */
function unsafeGeneric(input) {
  return Promise.resolve(input);
}

/**
 * @template T
 * @returns {Promise<T, never>}
 */
function resolveErrors() {
  // @ts-ignore
  return Promise.resolve();
}
