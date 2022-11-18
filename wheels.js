"use strict";

function round(x) { return Math.round(x * 1e8); }

const CANONS = [
  0,
  0.18350341907227397, // 1-√2/√3
  0.22871355387816905,
  0.25,
  0.27128644612183095,
  0.4574271077563381,
  0.5,
  0.5773502691896257, // 1/√3
  0.6848186302914435,
  0.728713553878169,
  0.75,
  0.816496580927726,
  0.8368632931834693,
  0.8660254037844386, // √3/2
  0.9682458365518543,
  0.9734937648862564,
  1,
  1.228713553878169,
  1.271286446121831,
  1.457427107756338,
  1.5,
  1.6583123951777, // √11/2
  1.7320508075688772, // √3
  1.816496580927726, // 1+√2/√3
  1.9915638315627209,
  2,
  2.228713553878169,
  2.598076211353316, // 3√3/2
  3,
];

function canon(x) {
  const s = Math.sign(x);
  const a = Math.abs(x);
  for(const c of CANONS) {
    if(Math.abs(a - c) < 5e-13) {
      return s * c;
    }
  }
  throw new Error("Uncanonical number: " + x);
}

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
  const d = Math.hypot(x2 - x1, y2 - y1);
  if(d >= r1 + r2 || d <= Math.abs(r1 - r2)) { return []; }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h_sq = r1 * r1 - a * a;
  if(h_sq <= 0) { return []; }

  const h = Math.sqrt(r1 * r1 - a * a);
  const u = (x2 - x1) / d;
  const v = (y2 - y1) / d;

  try {
    return [
      [canon(x1 + u * a - v * h), canon(y1 + v * a + u * h)],
      [canon(x1 + u * a + v * h), canon(y1 + v * a - u * h)],
    ];
  }
  catch(err) {
    console.log(x1, y1, r1, x2, y2, r2);
    throw err;
  }
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

search((circles, points) => {
  if(circles.length === 5) {
    console.log(circles);
    return true;
  }

  return false;
});
