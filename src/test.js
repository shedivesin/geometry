"use strict";

function assert(test, message) {
  if(!test) {
    throw new Error(message);
  }
}

function assert_equal(actual, expected) {
  assert(
    actual.toString() === expected.toString(),
    "Expected " + actual.toString() + "=" + expected.toString(),
  );
}

function test(name, fn) {
  if(fn === undefined) {
    document.write("<dd class=tbd>" + name + " TBD</dd>");
    return;
  }

  try {
    fn();
    document.write("<dd class=ok>" + name + " OK</dd>");
  }
  catch(err) {
    document.write("<dd class=fail>" + name + " FAILED: " + err.message + "</dd>");
  }
}

function module(name, fn) {
  document.write("<dt>" + name + "</dt>");

  try {
    fn();
  }
  catch(err) {
    document.write("<dd class=fail>" + name + " FAILED: " + err.message + "</dd>");
  }
}
