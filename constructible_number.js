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

  dividedBy(that) {
    throw new RangeError(`Unsupported: ${this.constructor.name}/${that.constructor.name}`);
  }

  squared() {
    return this.times(this);
  }

  squareRoot() {
    throw new RangeError(`Unsupported: √${this.constructor.name}`);
  }
}


class Literal extends ConstructibleNumber {
  constructor(value) { super(); this.value = value; }

  valueOf() { return this.value; }

  toString() { return this.value.toString(); }

  plus(that) {
    if(that instanceof Literal) { return new Literal(this.value + that.value); }
    return super.plus(that);
  }

  minus(that) {
    if(that instanceof Literal) { return new Literal(this.value - that.value); }
    return super.minus(that);
  }

  times(that) {
    if(that instanceof Literal) { return new Literal(this.value * that.value); }
    return super.times(that);
  }

  dividedBy(that) {
    if(that instanceof Literal) {
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

    return new Fraction(this, that);
  }

  squareRoot() {
    const sqrt_value = Math.sqrt(this.value);
    if(Number.isInteger(sqrt_value)) { return new Literal(sqrt_value); }

    return new SquareRoot(this);
  }
}


class Fraction extends ConstructibleNumber {
  constructor(num, den) { super(); this.num = num; this.den = den; }

  valueOf() { return this.num.valueOf() / this.den.valueOf(); }

  toString() { return this.num.toString() + "/" + this.den.toString(); }

  squared() {
    return this.num.squared().dividedBy(this.den.squared());
  }

  squareRoot() {
    return this.num.squareRoot().dividedBy(this.den.squareRoot());
  }
}


class SquareRoot extends ConstructibleNumber {
  constructor(expr) { super(); this.expr = expr; }

  valueOf() { return Math.sqrt(this.expr.valueOf()); }

  toString() { return "√" + this.expr.toString(); }

  squared() { return this.expr; }
}
