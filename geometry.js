class Point {
  constructor(x, y) { this.x = x; this.y = y; }

  toString() { return this.x.toString() + "," + this.y.toString(); }

  distanceTo(that) {
    return that.x.minus(this.x).squared().
      plus(that.y.minus(this.y).squared()).
      squareRoot();
  }

  circleTo(that) { return new Circle(this.x, this.y, this.distanceTo(that)); }
}

class Circle extends Point {
  constructor(x, y, radius) { super(x, y); this.radius = radius; }

  toString() { return super.toString() + "," + this.radius.toString(); }
}
