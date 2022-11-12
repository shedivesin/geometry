"use strict";


function gcd(a, b) {
  while(b) {
    const t = b;
    b = a % b;
    a = t;
  }

  return a;
}


class ConstructibleNumber {
  valueOf() {
    throw new RangeError(this.constructor.name + "#valueOf() is not supported");
  }

  toString() {
    throw new RangeError(this.constructor.name + "#toString() is not supported");
  }

  plus(that) {
    if(that instanceof Literal && that.value === 0) { return this; }
    throw new RangeError(this.constructor.name + "+" + that.constructor.name + " is not supported");
  }

  minus(that) { return this.plus(that.negate()); }

  times(that) {
    if(that instanceof Literal && that.value === 0) { return Literal.ZERO; }
    if(that instanceof Literal && that.value === 1) { return this; }
    throw new RangeError(this.constructor.name + "*" + that.constructor.name + " is not supported");
  }

  dividedBy(that) {
    if(this.equals(that)) { return Literal.ONE; }
    return new Fraction(this, that);
  }

  negate() { return this.times(Literal.NEGATIVE_ONE); }

  squared() { return this.times(this); }

  squareRoot() { return new SquareRoot(this); }

  lessThan(that) {
    throw new RangeError(this.constructor.name + "<" + that.constructor.name + " is not supported");
  }

  equals(that) {
    throw new RangeError(this.constructor.name + "=" + that.constructor.name + " is not supported");
  }

  greaterThan(that) {
    throw new RangeError(this.constructor.name + ">" + that.constructor.name + " is not supported");
  }
}


class Literal extends ConstructibleNumber {
  constructor(value) { super(); this.value = value; }

  valueOf() { return this.value; }

  toString() { return this.value.toString(); }

  plus(that) {
    if(that instanceof Literal && that.value === 0) { return this; }
    if(that instanceof Literal) { return new Literal(this.value + that.value); }
    return super.plus(this);
  }

  minus(that) {
    if(that instanceof Literal && that.value === 0) { return this; }
    if(that instanceof Literal) { return new Literal(this.value - that.value); }
    return super.minus(that);
  }

  times(that) {
    if(this.value === 0) { return Literal.ZERO; }
    if(this.value === 1) { return that; }
    if(that instanceof Literal) { return new Literal(this.value * that.value); }
    if(that instanceof Fraction) { return this.times(that.num).dividedBy(that.den); }
    if(that instanceof SquareRoot) { return this.squared().times(that.expr).squareRoot(); }
    return super.times(that);
  }

  dividedBy(that) {
    if(this.value === 0) { return Literal.ZERO; }

    if(that instanceof Literal) {
      if(that.value === 0) { throw new RangeError("Cannot divide by zero"); }
      if(that.value === 1) { return this; }
      if(that.value === this.value) { return Literal.ONE; }

      const d = gcd(this.value, that.value);
      if(d === that.value) { return new Literal(this.value / d); }
      if(d !== 1) {
        return new Fraction(
          new Literal(this.value / d),
          new Literal(that.value / d),
        );
      }
    }

    if(that instanceof Fraction) {
      return this.times(that.den).dividedBy(that.num);
    }

    return super.dividedBy(that);
  }

  squareRoot() {
    const sqrt_value = Math.sqrt(this.value);
    if(Number.isInteger(sqrt_value)) { return new Literal(sqrt_value); }

    return super.squareRoot();
  }

  lessThan(that) {
    if(that instanceof Literal) { return this.value < that.value; }
    if(that instanceof Fraction) { return this.times(that.den).lessThan(that.num); }
    if(that instanceof SquareRoot) { return this.squared().lessThan(that.expr); }
    return super.lessThan(that);
  }

  equals(that) { return that instanceof Literal && this.value === that.value; }

  greaterThan(that) {
    if(that instanceof Literal) { return this.value > that.value; }
    if(that instanceof Fraction) { return this.times(that.den).greaterThan(that.num); }
    if(that instanceof SquareRoot) { return this.squared().greaterThan(that.expr); }
    return super.greaterThan(that);
  }
}


class Fraction extends ConstructibleNumber {
  constructor(num, den) { super(); this.num = num; this.den = den; }

  valueOf() { return this.num.valueOf() / this.den.valueOf(); }

  toString() { return this.num.toString() + "/" + this.den.toString(); }

  times(that) {
    if(that instanceof Fraction) { return this.num.times(that.num).dividedBy(this.den.times(that.den)); }
    return this.num.times(that).dividedBy(this.den);
  }

  dividedBy(that) {
    if(that instanceof Fraction) { return this.num.times(that.den).dividedBy(this.den.times(that.num)); }
    return this.num.dividedBy(this.den.times(that));
  }

  squared() { return this.num.squared().dividedBy(this.den.squared()); }

  squareRoot() { return this.num.squareRoot().dividedBy(this.den.squareRoot()); }

  lessThan(that) { return this.num.lessThan(this.den.times(that)); }

  equals(that) {
    return that instanceof Fraction &&
      this.num.equals(that.num) &&
      this.den.equals(that.den);
  }

  greaterThan(that) { return this.num.greaterThan(this.den.times(that)); }
}


class SquareRoot extends ConstructibleNumber {
  constructor(expr) { super(); this.expr = expr; }

  valueOf() { return Math.sqrt(this.expr.valueOf()); }

  toString() { return "√" + this.expr.toString(); }

  times(that) { return this.expr.times(that.squared()).squareRoot(); }

  squared() { return this.expr; }

  lessThan(that) { return this.expr.lessThan(that.squared()); }

  equals(that) { return that instanceof SquareRoot && this.expr.equals(that.expr); }

  greaterThan(that) { return this.expr.greaterThan(that.squared()); }
}


Literal.NEGATIVE_ONE = Object.freeze(new Literal(-1));
Literal.ZERO = Object.freeze(new Literal(0));
Literal.ONE = Object.freeze(new Literal(1));
Literal.TWO = Object.freeze(new Literal(2));
Literal.THREE = Object.freeze(new Literal(3));

Fraction.ONE_HALF = Object.freeze(Literal.ONE.dividedBy(Literal.TWO));

SquareRoot.ROOT_TWO = Object.freeze(Literal.TWO.squareRoot());
SquareRoot.ROOT_THREE = Object.freeze(Literal.THREE.squareRoot());

Fraction.ONE_OVER_ROOT_TWO = Object.freeze(Literal.ONE.dividedBy(SquareRoot.ROOT_TWO));
Fraction.ROOT_TWO_OVER_TWO = Object.freeze(SquareRoot.ROOT_TWO.dividedBy(Literal.TWO));
Fraction.ROOT_THREE_OVER_TWO = Object.freeze(SquareRoot.ROOT_THREE.dividedBy(Literal.TWO));
