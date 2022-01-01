import { chain } from './index';

// @ts-ignore
type TestTypes =
  | AssertExtends<Promise<string>, Promise<string, never>>

  | AssertType<typeof Promise.resolve, <T>(val?: T) => Promise<T, never>>
  | AssertType<typeof Promise.reject, <T>(val?: T) => Promise<never, T>>

async function foo(this: string, int: number): Promise<number, never> {
  return int
}

function bar(this: string, val: number): Promise<string, string> {
  return Promise.reject('bar' + val);
}

function baz(this: string, val: string): Promise<string, number> {
  return new Promise((resolve, reject) => {
    if (this.length > 100) {
      return reject(1);
    }
    return resolve('baz' + val + this);
  })
}


const composition = chain(foo).then(bar).recover((err) => {
  return Promise.resolve(err + 'caught')
}).then(baz);

composition.run('foo', 1).then((result: any) => {
  (globalThis as any).console.log('Result: ', result);
}).catch((error: any) => {
  (globalThis as any).console.log('Error: ', error);
});
