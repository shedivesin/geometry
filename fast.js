"use strict";

const ε = 5e-9;

function eq(x, y) {
  return Math.abs(y - x) < ε;
}


// const MAX_CIRCLES = 30;
// const circles = new Array(MAX_CIRCLES).fill(0);
const circles = [0, 0, 1, 1, 0, 1];

function contains_circle(n, x, y, r) {
  for(let i = 0; i < n; i += 3) {
    if(eq(circles[i], x) && eq(circles[i+1], y) && eq(circles[i+2], r)) {
      return true;
    }
  }

  return false;
}

function add_circle(n, x1, y1, x2, y2) {
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
    if(eq(points[i], x) && eq(points[i+1], y)) {
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
  // FIXME: Adjust these checks to use epsilon...
  if(d_sq > (r1 + r2) * (r1 + r2)) { return n; }
  if(d_sq < (r1 - r2) * (r1 - r2)) { return n; }

  const a = (r1 * r1 - r2 * r2 + d_sq) / (2 * d_sq);
  const h = Math.sqrt(Math.max(r1 * r1 / d_sq - a * a, 0));

  x1 += x2 * a;
  y1 += y2 * a;
  x2 *= h;
  y2 *= h;

  return add_point(add_point(n, x1 - y2, y1 + x2), x1 + y2, y1 - x2);
}


// FIXME: Rather than using a Set, perhaps we can just use a large array as
// a hash table? We're already working with ints, after all...
const hash = [];
const visited = new Set();

function ftob(x) {
  x = Math.round(x * 1e8);
  // if(!(x >= -2147483648 && x < 2147483648)) { throw new Error("Out of range"); }

  return String.fromCharCode(
    (x >> 24) & 255,
    (x >> 16) & 255,
    (x >>  8) & 255,
    (x >>  0) & 255,
  );
}

function djb2(str) {
  const n = str.length;
  let hash = 5381;

  for(let i = 0; i < n; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }

  return hash;
}

function hash_circles_affine(n, x0, y0, m00, m10, m01, m11) {
  let j = 0;

  for(let i = 0; i < n; i += 3) {
    hash[j++] =
      ftob(circles[i+2]) +
      ftob((circles[i] - x0) * m00 + (circles[i+1] - y0) * m10) +
      ftob((circles[i] - x0) * m01 + (circles[i+1] - y0) * m11);
  }

  hash.length = j;
  return djb2(hash.sort().join(""));
}

function min(a, b) {
  return (a < b)? a: b;
}

// FIXME: This is a lot of work: so much so that it significantly slows the
// search. Do we need to compare EVERY circle to EVERY other one?
function hash_circles(n) {
  // NB: This only works at all when n >= 6 (e.g. there are two circles).
  // This is OK since we initialize the search at that depth, so this function
  // will never get called with n < 6, but be warned!

  let best = 2147483647;

  for(let i = 3; i < n; i += 3) {
    for(let j = 0; j < i; j += 3) {
      if(eq(circles[i], circles[j]) && eq(circles[i+1], circles[j+1])) { continue; }

      const r = Math.hypot(circles[j] - circles[i], circles[j+1] - circles[i+1]);
      const cos = (circles[j] - circles[i]) / r;
      const sin = (circles[j+1] - circles[i+1]) / r;

      best = min(hash_circles_affine(n, circles[i], circles[i+1], cos, sin, -sin, cos), best);
      best = min(hash_circles_affine(n, circles[i], circles[i+1], cos, sin, sin, -cos), best);
      best = min(hash_circles_affine(n, circles[j], circles[j+1], -cos, -sin, sin, -cos), best);
      best = min(hash_circles_affine(n, circles[j], circles[j+1], -cos, -sin, -sin, cos), best);
    }
  }

  return best;
}

// Return true (and mark the state as visited) if this is a state we've never
// encountered before. (Return false if we have been here before.)
// FIXME: This only checks for identical constructions. It should also handle
// reflections and rotations, etc.
function visit(n) {
  const hash = hash_circles(n, 1, 0, 0, 0, 1, 0);
  if(visited.has(hash)) { return false; }

  visited.add(hash);
  return true;
}

// Reset state such that no states are considered visited.
function clear_visited() {
  visited.clear();
}


function search_to_depth(test, cn, new_cn, max_cn, pn) {
  // If this state doesn't actually contain any new circles, bail.
  if(cn === new_cn) { return false; }

  // If we've already visited this state, bail.
  // NB: However, skip this if we're at the last level of the tree---it doesn't
  // buy us anything, then.
  if(new_cn < max_cn && !visit(new_cn)) { return false; }

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

  for(let d = 2; !search_to_depth(test, 0, 6, d * 3, 4); d++) {
    console.log(
      "No solutions with %d circles (after %d ms).",
      d,
      Date.now() - start,
    );

    clear_visited();
  }

  console.log(
    "Search complete (after %d ms).",
    Date.now() - start,
  );

  clear_visited();
}


const SQRT3 = Math.sqrt(3);
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
