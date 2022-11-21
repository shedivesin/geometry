"use strict";

// 1.  Try simply adding the point and then using "is the last point a
//     duplicate?" as our primitive (rather than checking before writing).
//
// 2.  If that's no slower, try passing around indices rather than struct
//     values.
//
// 3.  If that's no slower, try storing circles as indices into the points
//     array (origin and radius).
//
// 4.  If that's no slower, try adding lt/gt/le/ge functions (defined similarly
//     to eq()) and use those for circle intersections (hopefully catching more
//     bad cases early).
//
// 5.  Finally, the big one: instead of searching construction paths, make ALL
//     circles/points at a given level of the tree, and then searching the
//     resulting point set for constructions. Once one is found, we can trace
//     the tree back and find the minimal set of circles that will produce it.

const ε = 5e-9;

function eq(x, y) {
  return Math.abs(y - x) < ε;
}


const cx = [0, 1];
const cy = [0, 0];
const cr = [1, 1];

function contains_circle(n, x, y, r) {
  for(let i = 0; i < n; i++) {
    if(eq(cx[i], x) && eq(cy[i], y) && eq(cr[i], r)) {
      return true;
    }
  }

  return false;
}

function add_circle(n, x1, y1, x2, y2) {
  if(eq(x1, x2) && eq(y1, y2)) { return n; }

  const r = Math.hypot(x2 - x1, y2 - y1);
  if(contains_circle(n, x1, y1, r)) { return n; }

  cx[n] = x1;
  cy[n] = y1;
  cr[n] = r;
  return n + 1;
}


const px = [0, 1, 0.5, 0.5];
const py = [0, 0, -0.8660254037844386, 0.8660254037844386];

function contains_point(n, x, y) {
  for(let i = 0; i < n; i++) {
    if(eq(px[i], x) && eq(py[i], y)) {
      return true;
    }
  }

  return false;
}

function add_point(n, x, y) {
  if(contains_point(n, x, y)) { return n; }

  px[n] = x;
  py[n] = y;
  return n + 1;
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
  if(test(cn, pn)) {
    // console.log("%j", circles.slice(0, cn));
    return 1;
  }

  // If we've already searched to our maximum depth, then don't recurse.
  if(cn >= d) {
    return 0;
  }

  // For every pair of unique points, draw a circle from the first to the
  // second. If this is a new circle (e.g. not already in the construction),
  // then add it (and any new intersection points it makes) to the construction
  // and continue searching.
  let found = 0;

  for(let i = 0; i < pn; i++) {
    for(let j = 0; j < pn; j++) {
      if(i === j) { continue; }

      const cn2 = add_circle(
        cn, 
        px[i], py[i],
        px[j], py[j],
      );
      if(cn2 === cn) { continue; }

      let pn2 = pn;
      for(let k = 0; k < cn; k++) {
        pn2 = add_intersection_points(
          pn2,
          cx[k], cy[k], cr[k],
          cx[cn], cy[cn], cr[cn],
        );
      }

      found += search_to_depth(test, cn2, pn2, d);
    }
  }

  return found;
}

function search(test) {
  const start = Date.now();

  for(let d = 2, found = 0; !found; d++) {
    found = search_to_depth(test, 2, 4, d);

    console.log(
      "%d solutions with %d circles (%d ms, %d cs, %d ps).",
      found,
      d,
      Date.now() - start,
      cx.length,
      px.length,
    );
  }
}


search(n => n >= 7);
