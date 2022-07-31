// @ts-check
"use strict";

/**
 * @typedef {import('./compose').ComposableFunction<C1, I1, R1, E1>} ComposableFunction
 * @template C1, I1, R1, E1
 */

/**
 * @typedef {import('./compose').UnaryComposableFunction<C1, R1, R2, E1>} UnaryComposableFunction
 * @template C1, R1, R2, E1
 */

/**
 * @typedef {import('./compose').Composition<C1, R1, R2, E1>} Composition
 * @template C1, R1, R2, E1
 */

/**
 * @typedef {import('./compose').UnreachableFunctionWarning} UnreachableFunctionWarning
 */

import assert from 'node:assert';
import test from 'node:test';
import { compose, resolve, reject } from './compose.js';
import { Promise } from './promise.js';

/**
 * Maintaining safe compositions.
 */
{
  /** @type {Composition<any, [string, string], string, never>} */
  const composition1 = compose(safeTarget);

  /** @type {Composition<any, [string, string], [string], never>} */
  const composition2 = composition1.then(safeWrapArray);

  /** @type {Composition<any, [string, string], string, never>} */
  const composition3 = composition2.then(safeUnwrapArray);

  /** @type {Composition<any, [string, string], number, never>} */
  const composition4 = composition3.then(safeStringLength);

  test('Maintaining safe compositions', async () => {
    await composition4('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });

    await composition4('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });

    await composition4('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
}

/**
 * Adding errors to originally safe compositions.
 */
{
  /** @type {Composition<any, [string, string], string, never>} */
  const composition1 = compose(safeTarget);

  /** @type {Composition<any, [string, string], number, never>} */
  const composition2 = composition1.then(safeStringLength);

  /** @type {Composition<any, [string, string], number, string>} */
  const composition3 = composition2.then(unsafeIdentity);

  test('Adding errors to originally safe compositions', async () => {
    await composition3('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });

    await composition3('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });

    await composition3('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
}

/**
 * Keeping track of errors in originally unsafe compositions.
 */
{
  /** @type {Composition<any, [string, string], string, string>} */
  const composition1 = compose(unsafeTarget);

  /** @type {Composition<any, [string, string], [string], string>} */
  const composition2 = composition1.then(safeWrapArray);

  /** @type {Composition<any, [string, string], string, string>} */
  const composition3 = composition2.then(safeUnwrapArray);

  /** @type {Composition<any, [string, string], number, string>} */
  const composition4 = composition3.then(safeStringLength);

  test('Keeping track of errors in originally unsafe compositions', async () => {
    await composition4('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });

    await composition4('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });

    await composition4('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
}

/**
 * Discarding errors in originally unsafe compositions.
 */
{
  /** @type {Composition<any, [string, string], string, string>} */
  const composition1 = compose(unsafeTarget);

  /** @type {Composition<any, [string, string], number, string>} */
  const composition2 = composition1.then(safeStringLength);

  /** @type {Composition<any, [string, string], number, never>} */
  const composition3 = composition2.catch(resolveErrors);

  test('Keeping track of errors in originally unsafe compositions', async () => {
    await composition3('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });

    await composition3('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });

    await composition3('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
}

/**
 * Stacking compositions
 */
{
  /** @type {Composition<any, [string, string], string, never>} */
  const composition1 = compose(safeTarget);

  /** @type {Composition<any, [string], [string], never>} */
  const composition2 = compose(safeWrapArray);

  /** @type {Composition<any, [[string]], string, never>} */
  const composition3 = compose(safeUnwrapArray);

  /** @type {Composition<any, [string, string], string, never>} */
  const composition4 = composition1.then(composition2).then(composition3);

  test('Stacking compositions', async () => {
    await composition4('pizza', 'tomato').then((val) => {
      assert.equal(val, 'pizzatomato');
    });

    await composition4('cheese', 'spinach').then((val) => {
      assert.equal(val, 'cheesespinach');
    });

    await composition4('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 'mushroompineapple');
    });
  });
}

/**
 * Unreachable error path compositions.
 *
 * The below tests confirm that compositions that will never fail are properly
 * typed.
 */
{
  /** @type {Composition<void, [string, string], string, never>} */
  const composition1 = compose(safeTarget);

  /** @type {(fn: UnaryComposableFunction<any, string, any, any>) => any} */
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
  /** @type {Composition<any, [string, string], never, string>} */
  const composition1 = compose(brokenTarget);

  /** @type {(fn: UnreachableFunctionWarning) => any} */
  const _ = composition1.then

  /** @type {(fn: UnaryComposableFunction<any, string, never, any>) => any} */
  const __ = composition1.catch
}

/**
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<string, never>}
 */
function safeTarget(input1, input2) {
  return resolve(input1 + input2);
}

/**
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<string, string>}
 */
function unsafeTarget(input1, input2) {
  return resolve(input1 + input2);
}

/**
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<never, string>}
 */
function brokenTarget(input1, input2) {
  return reject(input1 + input2);
}

/**
 * @param {string} input
 * @returns {Promise<[string], never>}
 */
function safeWrapArray(input) {
  return resolve([input]);
}

/**
 * @param {[string]} input
 * @returns {Promise<string, never>}
 */
function safeUnwrapArray([input]) {
  return resolve(input);
}

/**
 * @param {string} input
 * @returns {Promise<number, never>}
 */
function safeStringLength(input) {
  return resolve(input.length);
}

/**
 * @template T
 * @param {T} input
 * @returns {Promise<T, string>}
 */
function unsafeIdentity(input) {
  return resolve(input);
}

/**
 * @template T
 * @returns {Promise<T, never>}
 */
function resolveErrors() {
  // @ts-ignore
  return Promise.resolve();
}
