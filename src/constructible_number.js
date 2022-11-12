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
    throw new RangeError(`Unsupported: ${this.constructor.name}#valueOf()`);
  }

  toString() {
    throw new RangeError(`Unsupported: ${this.constructor.name}#toString()`);
  }

  plus(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}+${that.constructor.name}`);
  }

  minus(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}-${that.constructor.name}`);
  }

  times(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}*${that.constructor.name}`);
  }

  dividedBy(that) { return new Fraction(this, that); }

  squared() { return this.times(this); }

  squareRoot() { return new SquareRoot(this); }

  lessThan(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}<${that.constructor.name}`);
  }

  equals(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}=${that.constructor.name}`);
  }

  greaterThan(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}>${that.constructor.name}`);
  }
}


class Literal extends ConstructibleNumber {
  constructor(value) { super(); this.value = value; }

  valueOf() { return this.value; }

  toString() { return this.value.toString(); }

  plus(that) {
    if(that instanceof Literal) { return new Literal(this.value + that.value); }
    return super.plus(this);
  }

  minus(that) {
    if(that instanceof Literal) { return new Literal(this.value - that.value); }
    return super.minus(that);
  }

  times(that) {
    if(that instanceof Literal) { return new Literal(this.value * that.value); }
    if(that instanceof Fraction) { return this.times(that.num).dividedBy(that.den); }
    if(that instanceof SquareRoot) { return this.squared().times(that.expr).squareRoot(); }
    return super.times(that);
  }

  dividedBy(that) {
    if(that instanceof Literal) {
      if(that.value === 0) { throw new RangeError("Cannot divide by zero"); }
      if(that.value === 1) { return this; }

      const d = gcd(this.value, that.value);
      if(d === that.value) { return new Literal(this.value / d); }
      if(d !== 1) {
        return new Fraction(
          new Literal(this.value / d),
          new Literal(that.value / d),
        );
      }
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

Literal.ZERO = Object.freeze(new Literal(0));
Literal.ONE = Object.freeze(new Literal(1));
Literal.TWO = Object.freeze(new Literal(2));
Literal.THREE = Object.freeze(new Literal(3));


class Fraction extends ConstructibleNumber {
  constructor(num, den) { super(); this.num = num; this.den = den; }

  valueOf() { return this.num.valueOf() / this.den.valueOf(); }

  toString() { return this.num.toString() + "/" + this.den.toString(); }

  squared() { return this.num.squared().dividedBy(this.den.squared()); }

  squareRoot() { return this.num.squareRoot().dividedBy(this.den.squareRoot()); }

  equals(that) {
    return that instanceof Fraction &&
      this.num.equals(that.num) &&
      this.den.equals(that.den);
  }
}

Fraction.ONE_HALF = Object.freeze(Literal.ONE.dividedBy(Literal.TWO));


class SquareRoot extends ConstructibleNumber {
  constructor(expr) { super(); this.expr = expr; }

  valueOf() { return Math.sqrt(this.expr.valueOf()); }

  toString() { return "√" + this.expr.toString(); }

  times(that) { return this.expr.times(that.squared()).squareRoot(); }

  squared() { return this.expr; }

  equals() { return that instanceof SquareRoot && this.expr.equals(that.expr); }
}

SquareRoot.TWO = Object.freeze(Literal.TWO.squareRoot());
SquareRoot.THREE = Object.freeze(Literal.THREE.squareRoot());
