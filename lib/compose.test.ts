import { Promise } from '@emphori/promise';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Composition, UnaryComposableFunction, UnreachableFunctionWarning, compose, reject, resolve } from './compose.js';

describe('Maintaining safe compositions', () => {
  const composition1: Composition<any, [string, string], string, never> =
    compose(safeTarget);

  const composition2: Composition<any, [string, string], [string], never> =
    composition1.then(safeWrapArray);

  const composition3: Composition<any, [string, string], string, never> =
    composition2.then(safeUnwrapArray);

  const composition4: Composition<any, [string, string], number, never> =
    composition3.then(safeStringLength);

  it('should maintain a safe composition (1)', () => {
    return composition4('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });
  });

  it('should maintain a safe composition (1)', () => {
    return composition4('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });
  });

  it('should maintain a safe composition (1)', () => {
    return composition4('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
});

describe('Adding errors to originally safe compositions', () => {
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

  it('should add errors to an originally safe composition (1)', () => {
    return composition3('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });
  });

  it('should add errors to an originally safe composition (2)', () => {
    return composition3('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });
  });

  it('should add errors to originally safe composition (3)', () => {
    return composition3('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
});

describe('Keeping track of errors in originally unsafe compositions', () => {
  const composition1: Composition<any, [string, string], string, string> =
    compose(unsafeTarget);

  const composition2: Composition<any, [string, string], [string], string> =
    composition1.then(safeWrapArray);

  const composition3: Composition<any, [string, string], string, string> =
    composition2.then(safeUnwrapArray);

  const composition4: Composition<any, [string, string], number, string> =
    composition3.then(safeStringLength);

  it('should keep track of errors in an originally unsafe composition (1)', () => {
    return composition4('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });
  });

  it('should keep track of errors in an originally unsafe composition (2)', () => {
    return composition4('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });
  });

  it('should keep track of errors in an originally unsafe composition (3)', () => {
    return composition4('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
});

describe('Discarding errors in originally unsafe compositions', () => {
  const composition1: Composition<any, [string, string], string, string> =
    compose(unsafeTarget);

  const composition2: Composition<any, [string, string], number, string> =
    composition1.then(safeStringLength);

  const composition3: Composition<any, [string, string], number, never> =
    composition2.catch(resolveErrors);

  it('should discard errors from an originally unsafe composition (1)', () => {
    return composition3('pizza', 'tomato').then((val) => {
      assert.equal(val, 11);
    });
  });

  it('should discard errors from an originally unsafe composition (2)', () => {
    return composition3('cheese', 'spinach').then((val) => {
      assert.equal(val, 13);
    });
  });

  it('should discard errors from an originally unsafe composition (3)', () => {
    return composition3('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 17);
    });
  });
});

describe('Stacking compositions', () => {
  const composition1: Composition<any, [string, string], string, never> =
    compose(safeTarget);

  const composition2: Composition<any, [string], [string], never> =
    compose(safeWrapArray);

  const composition3: Composition<any, [[string]], string, never> =
    compose(safeUnwrapArray);

  const composition4: Composition<any, [string, string], string, never> =
    composition1.then(composition2).then(composition3);

  it('should execute stacked compositions correctly (1)', () => {
    return composition4('pizza', 'tomato').then((val) => {
      assert.equal(val, 'pizzatomato');
    });
  });

  it('should execute stacked compositions correctly (2)', () => {
    return composition4('cheese', 'spinach').then((val) => {
      assert.equal(val, 'cheesespinach');
    });
  });

  it('should execute stacked compositions correctly (3)', () => {
    return composition4('mushroom', 'pineapple').then((val) => {
      assert.equal(val, 'mushroompineapple');
    });
  });
});

describe('Scoping compositions', () => {
  const composition: Composition<string, [string, string], string, never> =
    compose(scopedTarget);

  it('should run the composition with the given scope', () => {
    return composition.call('prefix', 'pizza', 'tomato').then((val) => {
      assert.equal(val, 'prefixpizzatomato');
    });
  });
});

/**
 * The block below confirms that compositions that will never fail are properly
 * typed.
 */
{
  const composition: Composition<void, [string, string], string, never> =
    compose(safeTarget);

  (): (fn: UnaryComposableFunction<any, string, any, any>) => any =>
    composition.then;

  (): (fn: UnreachableFunctionWarning) => any =>
    composition.catch;
};

/**
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
