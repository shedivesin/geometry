"use strict";

const EPS = 5e-9;

function eq(x, y) {
  return Math.abs(y - x) < EPS;
}

function eq2(x1, y1, x2, y2) {
  return eq(x1, x2) && eq(y1, y2);
}

function eq3(x1, y1, r1, x2, y2, r2) {
  return eq(x1, x2) && eq(y1, y2) && eq(r1, r2);
}


// const MAX_CIRCLES = 30;
// const circles = new Array(MAX_CIRCLES).fill(0);
const circles = [0, 0, 1, 1, 0, 1];

function contains_circle(n, x, y, r) {
  for(let i = 0; i < n; i += 3) {
    if(eq3(circles[i], circles[i+1], circles[i+2], x, y, r)) {
      return true;
    }
  }

  return false;
}

function add_circle(n, x1, y1, x2, y2) {
  if(eq2(x1, y1, x2, y2)) { return n; }

  const r = Math.hypot(x2 - x1, y2 - y1);
  if(contains_circle(n, x1, y1, r)) { return n; }
  // if(n >= MAX_CIRCLES) { throw new Error("MAX_CIRCLES not big enough"); }

  circles[n++] = x1;
  circles[n++] = y1;
  circles[n++] = r;
  return n;
}


// const MAX_POINTS = 10000;
// const points = new Array(MAX_POINTS).fill(0);
const points = [0, 0, 1, 0];

function contains_point(n, x, y) {
  for(let i = 0; i < n; i += 2) {
    if(eq2(points[i], points[i+1], x, y)) {
      return true;
    }
  }

  return false;
}

function add_point(n, x, y) {
  if(contains_point(n, x, y)) { return n; }
  // if(n >= MAX_POINTS) { throw new Error("MAX_POINTS not big enough"); }

  points[n++] = x;
  points[n++] = y;
  return n;
}

function add_intersection_points(n, x1, y1, r1, x2, y2, r2) {
  x2 -= x1;
  y2 -= y1;

  const d_sq = x2 * x2 + y2 * y2;
  if(d_sq >= (r1 + r2) * (r1 + r2)) { return n; }
  if(d_sq <= (r1 - r2) * (r1 - r2)) { return n; }

  const a = (r1 * r1 - r2 * r2 + d_sq) / (2 * d_sq);
  const h_sq = r1 * r1 - a * a * d_sq;
  if(h_sq <= 0) { return n; }

  const h = Math.sqrt(h_sq / d_sq);

  x1 += x2 * a;
  y1 += y2 * a;
  x2 *= h;
  y2 *= h;

  return add_point(add_point(n, x1 - y2, y1 + x2), x1 + y2, y1 - x2);
}


// FIXME: Some amount of state deduplication may render wheels unneccessary.
const SQRT3 = Math.sqrt(3);
const WHEEL_DEPTH = 4;
const WHEELS = [
  [0.5, -SQRT3/2,     1,  0  ,     0  , SQRT3],
  [0.5, -SQRT3/2,     1,  0.5, SQRT3/2,     1],
  [0.5, -SQRT3/2,     1,  0.5, SQRT3/2, SQRT3],
  [0.5, -SQRT3/2,     1,  0.5, SQRT3/2,     2],
  [0.5, -SQRT3/2, SQRT3,  0  ,     0  ,     2],
  [0.5, -SQRT3/2, SQRT3,  0.5, SQRT3/2, SQRT3],
  [0.5, -SQRT3/2, SQRT3, -1  ,     0  ,     1],
  [0.5, -SQRT3/2, SQRT3, -1  ,     0  ,     2],
  [0.5, -SQRT3/2, SQRT3, -1  ,     0  , SQRT3],
  [0.5, -SQRT3/2, SQRT3, -1  ,     0  ,     3],
];

function search_to_depth(test, cn, new_cn, max_cn, pn) {
  // If this state doesn't actually contain any new circles, bail.
  if(cn === new_cn) { return false; }

  // Add the intersection points made by the newly drawn circles and then
  // call our test function to see if we've found the intersection points
  // we're looking for. If so, great, we're done!
  for(; cn < new_cn; cn += 3) {
    for(let i = 0; i < cn; i += 3) {
      pn = add_intersection_points(
        pn,
        circles[i], circles[i+1], circles[i+2],
        circles[cn], circles[cn+1], circles[cn+2],
      );
    }
  }

  if(test(pn)) {
    console.log("%j", circles.slice(0, cn).join(","));
    return true;
  }

  // If we've already searched to our maximum depth, then don't recurse.
  if(cn >= max_cn) {
    return false;
  }

  // For every pair of unique points, draw a circle from the first to the
  // second. If this is a new circle (e.g. not already in the construction),
  // then add it (and any new intersection points it makes) to the construction
  // and continue searching.
  let done = false;

  for(let i = 0; i < pn; i += 2) {
    for(let j = 0; j < pn; j += 2) {
      if(i === j) { continue; }

      done = search_to_depth(
        test,
        cn,
        add_circle(
          cn,
          points[i], points[i+1],
          points[j], points[j+1],
        ),
        max_cn,
        pn,
      ) || done;
    }
  }

  return done;
}

function search(test) {
  const start = Date.now();
  const n = WHEELS.length;

  for(let d = WHEEL_DEPTH; ; d++) {
    let done = false;

    for(let i = 0; i < n; i++) {
      const wheel = WHEELS[i];
      const wn = wheel.length;

      for(let j = 0; j < wn; j += 3) {
        circles[j+6] = wheel[j];
        circles[j+7] = wheel[j+1];
        circles[j+8] = wheel[j+2];
      }

      done = search_to_depth(test, 0, 6 + wn, d * 3, 4) || done;
    }

    if(done) {
      break;
    }

    console.log(
      "No solutions with %d circles (after %d ms).",
      d,
      Date.now() - start,
    );
  }

  console.log(
    "Search complete (after %d ms).",
    Date.now() - start,
  );
}


search(n =>
  // NB: No need to check <1,0> and <1/2,±SQRT3/2>, since they always exist.
  contains_point(n, SQRT3/2, -0.5) &&
  contains_point(n, SQRT3/2,  0.5) &&
  contains_point(n, 0,  1) &&
  contains_point(n, 0, -1) &&
  contains_point(n, -SQRT3/2, -0.5) &&
  contains_point(n, -SQRT3/2,  0.5) &&
  contains_point(n, -0.5, -SQRT3/2) &&
  contains_point(n, -0.5,  SQRT3/2) &&
  contains_point(n, -1, 0));
