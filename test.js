"use strict";

module("Expression", () => {
  test("should add literals", () => {
    assert_equal(new Literal(2).plus(new Literal(2)), 4);
  });

  test("should subtract literals", () => {
    assert_equal(new Literal(100).minus(new Literal(87)), 13);
  });

  test("should multiply literals", () => {
    assert_equal(new Literal(6).times(new Literal(7)), 42);
  });

  test("should return a literal when dividing by one", () => {
    assert_equal(new Literal(42).dividedBy(new Literal(1)), 42);
  });

  test("should reduce a literal when it is divisible", () => {
    assert_equal(new Literal(42).dividedBy(new Literal(6)), 7);
  });

  test("should reduce a literal to lowest terms", () => {
    assert_equal(new Literal(12).dividedBy(new Literal(8)), "3/2");
  });

  test("it should square a literal", () => {
    assert_equal(new Literal(12).squared(), 144);
  });

  test("it should simplify the square root of a square literal", () => {
    assert_equal(new Literal(25).squareRoot(), 5);
  });

  test("it should not simplify the square root of a prime", () => {
    assert_equal(new Literal(65537).squareRoot(), "√65537");
  });
});
