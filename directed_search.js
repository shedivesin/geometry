"use strict";

const EPSILON = 5e-9;
const MAX_POINTS = 64;
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

  add_point(x1 + y2, y1 - x2);
  add_point(x1 - y2, y1 + x2);
  return true;
}

function list_points() {
  const points = new Array(pn);

  for(let i = 0; i < pn; i++) {
    points[i] = [px[i], py[i]];
  }

  return points;
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

function search_to_depth(test, results, depth) {
  if(test()) {
    results.push(list_circles());
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
  const results = [];

  for(let depth = 0; !results.length; depth++) {
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
    console.log(
      "%d solutions with %d circles (%s s).",
      results.length,
      depth,
      (s + ns / 1e9).toFixed(6),
    );
  }

  return results;
}


console.log(
  search(
    search(
      [[]],
      () => has_point(-1, 0),
    ),
    () => has_point(0, -1) && has_point(0, 1),
  ),
);
