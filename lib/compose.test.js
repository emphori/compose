"use strict";

// /**
//  * @typedef {import('@emphori/promise').Promise<T1, T2>} Promise
//  * @template T1, T2
//  */

/**
 * @typedef {import('./compose.js').Composition<C1, I1, R1, E1>} Composition
 * @template C1, I1, R1, E1
 */

/**
 * @typedef {import('./compose.js').ComposableFunction<C1, I1, R1, E1>} ComposableFunction
 * @template C1, I1, R1, E1
 */

/**
 * @typedef {import('./compose.js').UnaryComposableFunction<C1, R1, R2, E1>} UnaryComposableFunction
 * @template C1, R1, R2, E1
 */

/**
 * @typedef {import('./compose.js').UnreachableFunctionWarning} UnreachableFunctionWarning
 */

import assert from 'node:assert';
import test from 'node:test';
import { compose, resolve, reject } from './compose.js';
import { Promise } from '@emphori/promise';

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

  /** @return {Composition<any, [string, string], string, never>} */
  // @ts-expect-error
  () => composition2;

  /** @type {Composition<any, [string, string], number, string>} */
  const composition3 = composition2.then(unsafeIdentity);

  /** @return {Composition<any, [string, string], number, number>} */
  // @ts-expect-error
  () => composition3;

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
 *
 */
{
  /** @type {Composition<string, [string, string], string, never>} */
  const composition = compose(scopedTarget);

  test('Scoped compositions', async () => {
    await composition.call('prefix', 'pizza', 'tomato').then((val) => {
      assert.equal(val, 'prefixpizzatomato');
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
  const composition = compose(safeTarget);

  /** @return {(fn: UnaryComposableFunction<any, string, any, any>) => any} */
  () => composition.then;

  /** @return {(fn: UnreachableFunctionWarning) => any} */
  () => composition.catch;
}

/**
 * Unreachable happy path compositions.
 *
 * Although this sort of composition is highly undesireable, the below tests
 * ensure that "fail only" compositions are possible.
 */
{
  /** @type {Composition<any, [string, string], never, string>} */
  const composition = compose(brokenTarget);

  /** @return {(fn: UnreachableFunctionWarning) => any} */
  () => composition.then;

  /** @return {(fn: UnaryComposableFunction<any, string, never, any>) => any} */
  () => composition.catch;
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
 * @this string
 *
 * @param {string} input1
 * @param {string} input2
 * @returns {Promise<string, never>}
 */
function scopedTarget(input1, input2) {
  return resolve(this + input1 + input2);
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
