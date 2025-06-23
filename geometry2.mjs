import Algebrite from "algebrite";
import readline from "node:readline";

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

const points = new Map();
const circles = new Map();
readline.
  createInterface({input: process.stdin}).
  on("line", line => {
    const match = line.match(/^P([^,]*),([^,]*)$|^C([^,]*),([^,]*),([^,]*)$/);
    if(match !== null && match[1] && match[2]) {
      const p = new Point(match[1], match[2]);
      points.set(p.toString(), p);
    }
    else if(match !== null && match[3] && match[4] && match[5]) {
      const c = new Circle(match[3], match[4], match[5]);
      circles.set(c.toString(), c);
    }
    else {
      throw new Error("invalid line");
    }
  }).
  on("close", () => {
    // Add circles from points
    for(const p of points.values()) {
      for(const q of points.values()) {
        if(p === q) { continue; }

        const c = new Circle(p.x, p.y, p.distance(q));
        const s = c.toString();
        if(!circles.has(s)) {
          circles.set(s, c);
          console.log("C%s", s);
        }
      }
    }

    // Add points from circles
    for(const a of circles.values()) {
      for(const b of circles.values()) {
        if(a === b) { break; }

        const ps = a.intersect(b);
        for(const p of a.intersect(b)) {
          const s = p.toString();
          if(!points.has(s)) {
            points.set(s, p);
            console.log("P%s", s);
          }
        }
      }
    }
  });
