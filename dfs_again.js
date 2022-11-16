"use strict";

function round(x) { return Math.round(x * 1e8); }

function hash1(x) {
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

function hash2(x, y) { return hash1(x) + hash1(y); }

function hash3(x, y, z) { return hash1(x) + hash1(y) + hash1(z); }

function contains_hash2(points, x2, y2) {
  const n = points.length;
  const h2 = hash2(x2, y2);

  for(let i = 0; i < n; i++) {
    const p1 = points[i];
    const h1 = hash2(p1[0], p1[1]);
    if(h1 === h2) { return true; }
  }

  return false;
}

function contains_hash3(circles, x2, y2, r2) {
  const n = circles.length;
  const h2 = hash3(x2, y2, r2);

  for(let i = 0; i < n; i++) {
    const c1 = circles[i];
    const h1 = hash3(c1[0], c1[1], c1[2]);
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
      if(!round(r) || contains_hash3(circles, p1[0], p1[1], r)) { continue; }

      circles.push([p1[0], p1[1], r]);

      for(let k = 0; k < m; k++) {
        const c1 = circles[k];
        for(const p of intersect(c1[0], c1[1], c1[2], p1[0], p1[1], r)) {
          if(!contains_hash2(points, p[0], p[1])) { points.push(p); }
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

search(({length}) => length >= 0);
search(({length}) => length >= 1);
search(({length}) => length >= 2);
search(({length}) => length >= 3);
search(({length}) => length >= 4);
search(({length}) => length >= 5);
search(({length}) => length >= 6);
