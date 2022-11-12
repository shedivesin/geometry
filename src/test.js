"use strict";

function assert(test, message) {
  if(!test) {
    throw new Error(message);
  }
}

function assert_equal(actual, expected) {
  return assert(
    actual.toString() === expected.toString(),
    "Expected " + actual.toString() + "=" + expected.toString(),
  );
}

function assert_throws(fn, message) {
  try { fn(); }
  catch(err) { return assert_equal(err.message, message); }

  throw new Error("Expected an Error to be thrown");
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
    document.write("<dd class=fail>" + name + " FAILED<br>" + err.name + ": " + err.message + "<br>" + err.stack.replace(/\n/g, "<br>") + "</dd>");
  }
}

function module(name, fn) {
  document.write("<dt>" + name + "</dt>");

  try {
    fn();
  }
  catch(err) {
    document.write("<dd class=fail>" + name + " FAILED<br>" + err.name + ": " + err.message + "<br>" + err.stack.replace(/\n/g, "<br>") + "</dd>");
  }
}
