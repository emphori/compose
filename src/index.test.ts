import { Chain, Promise } from './index';

// @ts-ignore
type TestTypes =
  | AssertExtends<Promise<string, number>, Promise<string>>
  | AssertType<typeof Promise.resolve, <T>(val?: T) => Promise<T, never>>
  | AssertType<typeof Promise.reject, <T>(val: T) => Promise<never, T>>

function foo(this: string): Promise<number> {
  return Promise.resolve(1);
}

function bar(this: string, val: number): Promise<string, string> {
  return Promise.reject('bar' + val);
}

function baz(this: string, val: string): Promise<string> {
  return new Promise((resolve, _) => {
    return resolve('baz' + val + this);
  })
}

const chain = Chain.from(foo).then(bar).recover((err) => {
  return Promise.resolve(err + 'caught')
}).then(baz);

chain.run('foo').then((result: any) => {
  (globalThis as any).console.log('Result: ', result);
}, (error: any) => {
  (globalThis as any).console.log('Error: ', error);
});

(globalThis as any).console.log('End')
