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
const circles = [];

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
const points = [];

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


function search_to_depth(test, cn, pn, d) {
  // Check to see if this construction is a solution. If it is, we're done!
  if(test(pn)) {
    // FIXME: We want to do a deduplication step in here!

    console.log("%s", c.slice(0, cn).join(","));
    return true;
  }

  // If we've already searched to our maximum depth, then don't recurse.
  if(cn >= d) {
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

      const cn2 = add_circle(
        cn,
        points[i], points[i+1],
        points[j], points[j+1],
      );
      if(cn2 === cn) { continue; }

      let pn2 = pn;
      for(let k = 0; k < cn; k += 3) {
        pn2 = add_intersection_points(
          pn2,
          circles[k], circles[k+1], circles[k+2],
          circles[cn], circles[cn+1], circles[cn+2],
        );
      }

      done = search_to_depth(test, cn2, pn2, d) || done;
    }
  }

  return done;
}

function search(test) {
  const start = Date.now();
  // NB: While it's possible to start from 0 circles and 2 points, it is more
  // efficient to start from two circles. This is because my naive search does
  // not identify duplicate constructions (e.g. identical but for translation,
  // rotation, mirroring, etc.), and so tries to construct these circles in
  // multiple ways.
  // FIXME: It is not difficult to identify all possible constructions up to
  // some fixed depth (4? 5?). Perhaps we could manually do so and bootstrap
  // the search. This allows us to reduce the initial branching factor without
  // needing costly steps in the search itself.
  let cn = 0;
  circles[cn++] = 0;
  circles[cn++] = 0;
  circles[cn++] = 1;
  circles[cn++] = 1;
  circles[cn++] = 0;
  circles[cn++] = 1;

  let pn = 0;
  points[pn++] = 0;
  points[pn++] = 0;
  points[pn++] = 1;
  points[pn++] = 0;
  points[pn++] = 0.5;
  points[pn++] = Math.sqrt(3)/2;
  points[pn++] = 0.5;
  points[pn++] = -Math.sqrt(3)/2;

  for(let d = 2; !search_to_depth(test, cn, pn, d * 3); d++) {
    console.log(
      "No solutions of %d circles (after %d ms).",
      d,
      Date.now() - start,
    );
  }

  console.log(
    "Search complete (after %d ms).",
    Date.now() - start,
  );
}


const a = Math.sqrt(3)/2;
search(n =>
  // NB: No need to check <1,0> and <0.5,±a>, since they always exist.
  contains_point(n,  a, -0.5) &&
  contains_point(n,  a,  0.5) &&
  contains_point(n,  0,  1) &&
  contains_point(n,  0, -1) &&
  contains_point(n, -a, -0.5) &&
  contains_point(n, -a,  0.5) &&
  contains_point(n, -0.5, -a) &&
  contains_point(n, -0.5,  a) &&
  contains_point(n, -1,  0));
