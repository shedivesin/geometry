import Algebrite from "algebrite";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  equals(that) {
    return this.x === that.x && this.y === that.y;
  }

  distance(that) {
    return Algebrite.run(`(((${that.x})-(${this.x}))^2+((${that.y})-(${this.y}))^2)^(1/2)`);
  }
}

class Circle extends Point {
  constructor(x, y, r) {
    super(x, y);
    this.r = r;
  }

  toString() {
    return `${super.toString()},${this.r}`;
  }

  equals(that) {
    return super.equals(that) && this.r === that.r;
  }

  intersect(that) {
    const d = this.distance(that);
    // circles do not intersect
    if(Algebrite.run(`(${d})>(${this.r})+(${that.r})`) === "1") {
      return [];
    }
    // one circle contains the other
    if(Algebrite.run(`(${d})<abs((${this.r})-(${that.r}))`) === "1") {
      return [];
    }

    const a = Algebrite.run(`((${this.r})^2-(${that.r})^2+(${d})^2)/(2*(${d}))`);
    const h = Algebrite.run(`((${this.r})^2-(${a})^2)^(1/2)`);
    const x = Algebrite.run(`(${this.x})+((${that.x})-(${this.x}))*(${a})/(${d})`);
    const y = Algebrite.run(`(${this.y})+((${that.y})-(${this.y}))*(${a})/(${d})`);
    // circles are tangent
    if(h === "0") { return [new Point(x, y)]; }

    // circles intersect normally
    const u = Algebrite.run(`((${this.y})-(${that.y}))*(${h})/(${d})`);
    const v = Algebrite.run(`((${that.x})-(${this.x}))*(${h})/(${d})`);
    return [
      new Point(Algebrite.run(`(${x})+(${u})`), Algebrite.run(`(${y})+(${v})`)),
      new Point(Algebrite.run(`(${x})-(${u})`), Algebrite.run(`(${y})-(${v})`)),
    ];
  }
}

const points = [
  new Point("0", "0"),
  new Point("1", "0"),
];

const circles = [
];

for(let d = 0; d < 4; d++) {
  // Add points from circles
  for(let i = 0; i < circles.length - 1; i++) {
    const a = circles[i];
    for(let j = i + 1; j < circles.length; j++) {
      const b = circles[j];
      const ps = a.intersect(b);
      points: for(const p of ps) {
        for(let k = 0; k < points.length; k++) {
          const q = points[k];
          if(p.equals(q)) {
            continue points;
          }
        }
        points.push(p);
      }
    }
  }


  // Add circles from points
  for(let i = 0; i < points.length; i++) {
    const p = points[i];
    circles: for(let j = 0; j < points.length; j++) {
      if(i === j) { continue; }

      const q = points[j];
      const a = new Circle(p.x, p.y, p.distance(q));
      for(let k = 0; k < circles.length; k++) {
        const b = circles[k];
        if(a.equals(b)) {
          continue circles;
        }
      }

      circles.push(a);
      console.log("%s", a);
    }
  }
}
