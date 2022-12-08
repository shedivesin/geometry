"use strict";


const EPSILON = 5e-9;
const MAX_POINTS = 128;
const MAX_CIRCLES = 16;


const buffer = new ArrayBuffer(MAX_POINTS * 16 + MAX_CIRCLES * 24);

const px = new Float64Array(buffer, 0, MAX_POINTS);
const py = new Float64Array(buffer, MAX_POINTS * 8, MAX_POINTS);
let pn = 2;
px[0] = 0;
py[0] = 0;
px[1] = 1;
py[1] = 0;

const cx = new Float64Array(buffer, MAX_POINTS * 16, MAX_CIRCLES);
const cy = new Float64Array(buffer, MAX_POINTS * 16 + MAX_CIRCLES * 8, MAX_CIRCLES);
const cr = new Float64Array(buffer, MAX_POINTS * 16 + MAX_CIRCLES * 16, MAX_CIRCLES);
let cn = 0;


function eq(x, y) {
  return Math.abs(y - x) < EPSILON;
}


function clear_points() {
  pn = 2;
}

function has_point(x, y) {
  for(let i = 0; i < pn; i++) {
    if(eq(px[i], x) && eq(py[i], y)) {
      return true;
    }
  }

  return false;
}

function add_point(x, y) {
  if(has_point(x, y)) {
    return false;
  }
  if(pn >= MAX_POINTS) {
    throw new Error("MAX_POINTS is not big enough");
  }

  px[pn] = x;
  py[pn] = y;
  pn++;

  return true;
}

// http://paulbourke.net/geometry/circlesphere/
// https://mathworld.wolfram.com/Circle-CircleIntersection.html
function add_intersection_points(x1, y1, r1, x2, y2, r2) {
  x2 -= x1;
  y2 -= y1;

  const d_sq = x2 * x2 + y2 * y2;
  // FIXME: Adjust these checks to use epsilon?
  if(d_sq > (r1 + r2) * (r1 + r2)) {
    return false;
  }
  if(d_sq < (r1 - r2) * (r1 - r2)) {
    return false;
  }

  const a = (r1 * r1 - r2 * r2 + d_sq) / (2 * d_sq);
  const h = Math.sqrt(Math.max(r1 * r1 / d_sq - a * a, 0));

  x1 += x2 * a;
  y1 += y2 * a;
  x2 *= h;
  y2 *= h;

  add_point(x1 - y2, y1 + x2);
  add_point(x1 + y2, y1 - x2);
  return true;
}


function clear_circles() {
  cn = 0;
}

function has_circle(x, y, r) {
  for(let i = 0; i < cn; i++) {
    if(eq(cx[i], x) && eq(cy[i], y) && eq(cr[i], r)) {
      return true;
    }
  }

  return false;
}

function add_circle(x, y, r) {
  if(has_circle(x, y, r)) {
    return false;
  }
  if(cn >= MAX_CIRCLES) {
    throw new Error("MAX_CIRCLES is not big enough");
  }

  for(let i = 0; i < cn; i++) {
    add_intersection_points(cx[i], cy[i], cr[i], x, y, r);
  }

  cx[cn] = x;
  cy[cn] = y;
  cr[cn] = r;
  cn++;

  return true;
}

function list_circles() {
  const circles = new Array(cn);

  for(let i = 0; i < cn; i++) {
    circles[i] = [cx[i], cy[i], cr[i]];
  }

  return circles;
}


function ftob(x) {
  x = Math.round(x * 1e8);
  if(!(x >= -2147483648 && x < 2147483648)) {
    throw new Error("Out of range");
  }

  return String.fromCharCode(
    (x >> 24) & 255,
    (x >> 16) & 255,
    (x >>  8) & 255,
    (x >>  0) & 255,
  );
}

function hash_circle(x, y, r) {
  return ftob(r) + ftob(x) + ftob(y);
}

function hash_circles_affine(x0, y0, m00, m10, m01, m11) {
  const hash = new Array(cn);

  for(let i = 0; i < cn; i++) {
    hash[i] = hash_circle(
      (cx[i] - x0) * m00 + (cy[i] - y0) * m10,
      (cx[i] - x0) * m01 + (cy[i] - y0) * m11,
      cr[i],
    );
  }

  hash.sort();
  return hash.join("");
}

function min(min, a, b, c, d) {
  if(min === undefined || a.localeCompare(min) < 0) { min = a; }
  if(b.localeCompare(min) < 0) { min = b; }
  if(c.localeCompare(min) < 0) { min = c; }
  if(d.localeCompare(min) < 0) { min = d; }
  return min;
}

function hash_circles() {
  if(cn === 0) {
    return "";
  }
  if(cn === 1) {
    return hash_circle(0, 0, cr[0]);
  }

  let best;

  for(let i = 1; i < cn; i++) {
    for(let j = 0; j < i; j++) {
      if(eq(cx[j], cx[i]) && eq(cy[j], cy[i])) {
        continue;
      }

      const r = Math.hypot(cx[i] - cx[j], cy[i] - cy[j]);
      const cos = (cx[i] - cx[j]) / r;
      const sin = (cy[i] - cy[j]) / r;

      best = min(
        best,
        hash_circles_affine(cx[j], cy[j], cos, sin, -sin, cos),
        hash_circles_affine(cx[j], cy[j], cos, sin, sin, -cos),
        hash_circles_affine(cx[i], cy[i], -cos, -sin, sin, -cos),
        hash_circles_affine(cx[i], cy[i], -cos, -sin, -sin, cos),
      );
    }
  }

  return best;
}


function search_to_depth(test, results, depth) {
  if(test()) {
    const hash = hash_circles();
    if(!results.has(hash)) {
      results.set(hash, list_circles());
    }
    return;
  }
  if(cn >= depth) {
    return;
  }

  const cn_mark = cn;
  const pn_mark = pn;

  for(let i = 1; i < pn; i++) {
    for(let j = 0; j < i; j++) {
      const r = Math.hypot(px[i] - px[j], py[i] - py[j]);

      if(add_circle(px[j], py[j], r)) {
        search_to_depth(test, results, depth);
        cn = cn_mark;
        pn = pn_mark;
      }

      if(add_circle(px[i], py[i], r)) {
        search_to_depth(test, results, depth);
        cn = cn_mark;
        pn = pn_mark;
      }
    }
  }
}

function search(seeds, test) {
  const n = seeds.length;
  const results = new Map();

  for(let depth = 0; !results.size; depth++) {
    const start = process.hrtime();

    for(let i = 0; i < n; i++) {
      const seed = seeds[i];
      const sn = seed.length;
      if(sn > depth) { continue; }

      clear_points();
      clear_circles();

      for(let j = 0; j < sn; j++) {
        const circle = seed[j];
        add_circle(circle[0], circle[1], circle[2]);
      }

      search_to_depth(test, results, depth);
    }

    const [s, ns] = process.hrtime(start);
    console.warn(
      "%d solutions with %d circles (%s s).",
      results.size,
      depth,
      (s + ns / 1e9).toFixed(6),
    );
  }

  console.warn("---");

  return Array.from(results.values());
}


function print(solutions) {
  for(const solution of solutions) {
    console.log(
      "%s",
      solution.
        map(x => x.map(x => Math.round(x * 1e8) / 1e8).join(",")).
        join(";"),
    );
  }
}


const SQRT3 = Math.sqrt(3);
// NB: This is the list of all possible constructions involving four circles,
// when rotations and reflections are removed. The benefit to defining it
// explicitly, rather than simply asking the search for it, is that we can
// avoid a level of IEEE floating point rounding errors.
const SEED4 = [
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, 1], [1/2, SQRT3/2, SQRT3]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, 1], [1/2, -SQRT3/2, 1]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, 1], [1/2, -SQRT3/2, SQRT3]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, 1], [1/2, -SQRT3/2, 2]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, SQRT3], [0, 0, 2]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, SQRT3], [1/2, -SQRT3/2, SQRT3]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, SQRT3], [-1, 0, 1]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, SQRT3], [-1, 0, SQRT3]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, SQRT3], [-1, 0, 2]],
  [[0, 0, 1], [1, 0, 1], [1/2, SQRT3/2, SQRT3], [-1, 0, 3]]
];

print(
  search(
    SEED4,
    () => has_point(-1, 0) && has_point(0, -1) && has_point(0, 1),
  ),
);
