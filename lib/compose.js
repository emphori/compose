// @ts-nocheck
"use strict";

/**
 * A composition factory that chains Promises together in a functional manner.
 *
 * @param fn - The function to compose
 */
function compose(fn) {
  return Object.setPrototypeOf(function (...args) {
    return fn.apply(this, args);
  }, compose);
}

compose.then = function (fn) {
  const run = this;
  return compose(function (...args) {
    return run.apply(this, args).then((val) => fn.call(this, val));
  });
};

compose.catch = function (fn) {
  const run = this;
  return compose(function (...args) {
    return run.apply(this, args).catch((val) => fn.call(this, val));
  });
}

exports.compose = compose;
