"use strict";

// ## GEOMETRY

function distance(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

// http://paulbourke.net/geometry/circlesphere/
function* intersect(p, q) {
  const d = distance(p, q);
  if(d > p[2] + q[2] || d < Math.abs(p[2] - q[2])) { return; }

  const a = (p[2] * p[2] - q[2] * q[2] + d * d) / (2 * d);
  if(a >= p[2]) {
    yield [p[0] + (q[0] - p[0]) * (a / d), p[1] + (q[1] - p[1]) * (a / d)];
    return;
  }

  const h = Math.sqrt(p[2] * p[2] - a * a);
  yield [
    p[0] + (q[0] - p[0]) * (a / d) - (q[1] - p[1]) * (h / d),
    p[1] + (q[1] - p[1]) * (a / d) + (q[0] - p[0]) * (h / d),
  ];
  yield [
    p[0] + (q[0] - p[0]) * (a / d) + (q[1] - p[1]) * (h / d),
    p[1] + (q[1] - p[1]) * (a / d) - (q[0] - p[0]) * (h / d),
  ];
}

function* intersection_points(list) {
  yield [0, 0];
  yield [1, 0];

  for(let a = list; a; a = a[3]) {
    for(let b = a[3]; b; b = b[3]) {
      yield* intersect(a, b);
    }
  }
}

function len(list) {
  let n = 0;
  for(let a = list; a; a = a[3]) { n++; }
  return n;
}

function round(x) {
  return Math.round(x * 1e8) / 1e8;
}

// FIXME: I'm certain we can do a lot better here...
function str(x, y, r) {
  return round(x) + "," + round(y) + "," + round(r);
}

function hash(list, o, m00, m10, m01, m11) {
  const strs = [];

  for(let a = list; a; a = a[3]) {
    const x = a[0] - o[0];
    const y = a[1] - o[1];
    const r = a[2];
    strs.push(str(x * m00 + y * m10, x * m01 + y * m11, r));
  }

  return strs.sort().join(";");
}

function canonical_hash(list) {
  if(!list) { return ""; }
  if(!list[3]) { return hash(list, list, 1, 0, 0, 1); }

  let best;

  for(let a = list; a; a = a[3]) {
    // FIXME: Is it worth including untransformed (but translated) variants
    // for each single point?

    for(let b = list; b; b = b[3]) {
      if(a === b) { continue; }

      const d = distance(a, b);
      const cos = (b[0] - a[0]) / d;
      const sin = (a[1] - b[1]) / d;

      const g = hash(list, a, cos, -sin, sin, cos);
      if(g.localeCompare(best) < 0) { best = g; }

      // FIXME: Is the vertical flip necessary?
      const h = hash(list, a, cos, -sin, -sin, -cos);
      if(h.localeCompare(best) < 0) { best = h; }
    }
  }

  return best;
}

function contains(list, x) {
  for(let a = list; a; a = a[3]) {
    if(str(a[0], a[1], a[2]) === x) {
      return true;
    }
  }

  return false;
}

function search(depth) {
  const start = Date.now();
  // FIXME: A bloom filter would be much more space-efficient.
  const closed = new Set();

  for(const open = [null]; open.length; ) {
    const next = open.shift();

    const hash = canonical_hash(next);
    if(closed.has(hash)) { continue; }
    closed.add(hash);

    // FIXME: We could cache length on each node, making this step O(1).
    if(len(next) >= depth) { continue; }

    for(const p of intersection_points(next)) {
      for(const q of intersection_points(next)) {
        const r = distance(p, q);
        if(round(r) === 0) { continue; }
        if(contains(next, str(p[0], p[1], r))) { continue; }

        open.push([p[0], p[1], r, next]);
      }
    }
  }

  console.log(
    "Explored %d state(s) in %d ms.",
    closed.size,
    Date.now() - start,
  );
}

search(0);
search(1);
search(2);
search(3);
search(4);
search(5);
search(6);
