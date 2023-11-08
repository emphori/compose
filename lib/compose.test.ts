"use strict";

import { Promise } from '@emphori/promise';
import assert from 'node:assert';
import test from 'node:test';
import { Composition, UnaryComposableFunction, UnreachableFunctionWarning, compose, reject, resolve } from './compose.js';

/**
 * Maintaining safe compositions.
 */
{
  const composition1: Composition<any, [string, string], string, never> =
    compose(safeTarget);

  const composition2: Composition<any, [string, string], [string], never> =
    composition1.then(safeWrapArray);

  const composition3: Composition<any, [string, string], string, never> =
    composition2.then(safeUnwrapArray);

  const composition4: Composition<any, [string, string], number, never> =
    composition3.then(safeStringLength);

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
  const composition1: Composition<any, [string, string], string, never> =
    compose(safeTarget);

  const composition2: Composition<any, [string, string], number, never> =
    composition1.then(safeStringLength);

  // @ts-expect-error
  (): Composition<any, [string, string], string, never> => composition2;

  const composition3: Composition<any, [string, string], number, string> =
    composition2.then(unsafeIdentity);

  // @ts-expect-error
  (): Composition<any, [string, string], number, number> => composition3;

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
  const composition1: Composition<any, [string, string], string, string> =
    compose(unsafeTarget);

  const composition2: Composition<any, [string, string], [string], string> =
    composition1.then(safeWrapArray);

  const composition3: Composition<any, [string, string], string, string> =
    composition2.then(safeUnwrapArray);

  const composition4: Composition<any, [string, string], number, string> =
    composition3.then(safeStringLength);

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
  const composition1: Composition<any, [string, string], string, string> =
    compose(unsafeTarget);

  const composition2: Composition<any, [string, string], number, string> =
    composition1.then(safeStringLength);

  const composition3: Composition<any, [string, string], number, never> =
    composition2.catch(resolveErrors);

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
  const composition1: Composition<any, [string, string], string, never> =
    compose(safeTarget);

  const composition2: Composition<any, [string], [string], never> =
    compose(safeWrapArray);

  const composition3: Composition<any, [[string]], string, never> =
    compose(safeUnwrapArray);

  const composition4: Composition<any, [string, string], string, never> =
    composition1.then(composition2).then(composition3);

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
  const composition: Composition<string, [string, string], string, never> =
    compose(scopedTarget);

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
  const composition: Composition<void, [string, string], string, never> =
    compose(safeTarget);

  (): (fn: UnaryComposableFunction<any, string, any, any>) => any =>
    composition.then;

  (): (fn: UnreachableFunctionWarning) => any =>
    composition.catch;
}

/**
 * Unreachable happy path compositions.
 *
 * Although this sort of composition is highly undesireable, the below tests
 * ensure that "fail only" compositions are possible.
 */
{
  const composition: Composition<any, [string, string], never, string> =
    compose(brokenTarget);

  (): (fn: UnreachableFunctionWarning) => any =>
    composition.then;

  (): (fn: UnaryComposableFunction<any, string, never, any>) => any =>
    composition.catch;
}

function safeTarget(input1: string, input2: string): Promise<string, never> {
  return resolve(input1 + input2);
}

function unsafeTarget(input1: string, input2: string): Promise<string, string> {
  return resolve(input1 + input2);
}

function brokenTarget(input1: string, input2: string): Promise<never, string> {
  return reject(input1 + input2);
}

function scopedTarget(this: string, input1: string, input2: string): Promise<string, never> {
  return resolve(this + input1 + input2);
}

function safeWrapArray(input: string): Promise<[string], never> {
  return resolve([input]);
}

function safeUnwrapArray([input]: [string]): Promise<string, never> {
  return resolve(input);
}

function safeStringLength(input: string): Promise<number, never> {
  return resolve(input.length);
}

function unsafeIdentity<T>(input: T): Promise<T, string> {
  return Promise.resolve(input);
}

function resolveErrors<T>(): Promise<T, never> {
  // @ts-ignore
  return Promise.resolve();
}
