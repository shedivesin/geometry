"use strict";

function round(x) { return Math.round(x * 1e8); }

function hash(x) {
  x = round(x);
  if(!(x >= -2147483648 && x < 2147483648)) {
    throw new RangeError("Number went out of range for hashing");
  }

  return String.fromCharCode(
    x >>> 24,
    (x >>> 16) & 255,
    (x >>> 8) & 255,
    x & 255,
  );
}

function hash3(x, y, z) { return hash(x) + hash(y) + hash(z); }

function hashv(v) {
  let str = "";

  const n = v.length;
  for(let i = 0; i < n; i++) { str += hash(v[i]); }

  return str;
}

function contains_hashv(vectors, v2) {
  const n = vectors.length;
  const h2 = hashv(v2);

  for(let i = 0; i < n; i++) {
    const h1 = hashv(vectors[i]);
    if(h1 === h2) { return true; }
  }

  return false;
}

function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

// http://paulbourke.net/geometry/circlesphere/
function intersect(x1, y1, r1, x2, y2, r2) {
  x2 -= x1;
  y2 -= y1;

  const d = Math.hypot(x2, y2);
  if(d >= r1 + r2 || d <= Math.abs(r1 - r2)) { return []; }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h_sq = r1 * r1 - a * a;
  if(h_sq <= 0) { return []; }

  const h = Math.sqrt(r1 * r1 - a * a);
  x2 /= d;
  y2 /= d;

  return [
    [x1 + x2 * a - y2 * h, y1 + y2 * a + x2 * h],
    [x1 + x2 * a + y2 * h, y1 + y2 * a - x2 * h],
  ];
}

function hash_construction(circles) {
  const n = circles.length;
  if(n === 0) { return ""; }
  if(n === 1) { return hash3(0, 0, circles[0][2]); }

  const temp = new Array(n);
  let best;

  for(let i = 0; i < n; i++) {
    const c1 = circles[i];

    for(let j = 0; j < n; j++) {
      if(i === j) { continue; }

      const c2 = circles[j];
      const d = distance(c1[0], c1[1], c2[0], c2[1]);
      if(!round(d)) { continue; }

      const cos = (c2[0] - c1[0]) / d;
      const sin = (c1[1] - c2[1]) / d;

      for(let s = 1; s >= -1; s -= 2) {
        for(let k = 0; k < n; k++) {
          const c3 = circles[k];
          const x = c3[0] - c1[0];
          const y = c3[1] - c1[1];
          const r = c3[2];
          temp[k] = hash3(x * cos - y * sin, (x * sin + y * cos) * s, r);
        }

        const hash = temp.sort().join("");
        if(best === undefined || hash.localeCompare(best) < 0) { best = hash; }
      }
    }
  }

  return best;
}

function search_to_depth(test, circles, points, visited, depth) {
  if(circles.length >= depth) { return false; }

  const hash = hash_construction(circles);
  if(visited.has(hash)) { return false; }
  visited.add(hash);

  if(test(circles, points)) { return true; }

  const m = circles.length;
  const n = points.length;
  let done = false;

  for(let i = 0; i < n; i++) {
    const p1 = points[i];

    for(let j = 0; j < n; j++) {
      if(i === j) { continue; }

      const p2 = points[j];
      const r = distance(p1[0], p1[1], p2[0], p2[1]);
      if(!round(r)) { continue; }

      const c = [p1[0], p1[1], r];
      if(contains_hashv(circles, c)) { continue; }

      circles.push(c);
      for(let k = 0; k < m; k++) {
        const c1 = circles[k];
        for(const p of intersect(c1[0], c1[1], c1[2], p1[0], p1[1], r)) {
          if(contains_hashv(points, p)) { continue; }
          points.push(p);
        }
      }

      done = search_to_depth(test, circles, points, visited, depth) || done;

      circles.length = m;
      points.length = n;
    }
  }

  return done;
}

function search(test) {
  const start = Date.now();
  const circles = [];
  const points = [[0, 0], [1, 0]];
  const visited = new Set();

  for(
    let depth = 0;
    !search_to_depth(test, circles, points, visited, depth);
    visited.clear(), depth++
  );

  const end = Date.now();
  console.log("Explored %d state(s) in %d ms.", visited.size, end - start);
}

// Benchmark search speed.
search(({length}) => length >= 0);
search(({length}) => length >= 1);
search(({length}) => length >= 2);
search(({length}) => length >= 3);
search(({length}) => length >= 4);
search(({length}) => length >= 5);
search(({length}) => length >= 6);

// Napoleon's Problem (inscribe a square in a given circle).
search((circles, points) => {
  const n = circles.length;
  if(n === 0) { return false; }

  const c = circles[n - 1];
  if(round(c[2] - Math.SQRT2)) { return false; }
  if(round(c[0] * c[0] + c[1] * c[1] - 1)) { return false; }

  console.log(circles);
  return true;
});
