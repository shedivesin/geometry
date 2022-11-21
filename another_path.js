"use strict";

const ε = 5e-9;

function eq(x, y) {
  return Math.abs(y - x) < ε;
}


// FIXME: Try replacing this with just storing indices into the points array.
const cx = [0, 1];
const cy = [0, 0];
const cr = [1, 1];

function circle_eq(i, j) {
  return eq(cx[i], cx[j]) && eq(cy[i], cy[j]) && eq(cr[i], cr[j]);
}

function add_circle(n, i, j) {
  if(i === j) { return n; }

  cx[n] = px[i];
  cy[n] = py[i];
  cr[n] = Math.hypot(px[j] - px[i], py[j] - py[i]);
  for(let k = 0; k < n; k++) {
    if(circle_eq(k, n)) {
      return n;
    }
  }

  return n + 1;
}


const px = [0, 1, 0.5, 0.5];
const py = [0, 0, -0.8660254037844386, 0.8660254037844386];

function point_eq(i, j) {
  return eq(px[i], px[j]) && eq(py[i], py[j]);
}

function add_point(n, x, y) {
  px[n] = x;
  py[n] = y;
  for(let i = 0; i < n; i++) {
    if(point_eq(i, n)) {
      return n;
    }
  }

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


// FIXME: This might be optimized by not comparing EVERY point and circle, but
// just the ones newly added.
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
      const cn2 = add_circle(cn, i, j);
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
      "%d solutions with %d circles (%d ms, %d ps).",
      found,
      d,
      Date.now() - start,
      px.length,
    );
  }
}


search(n => n >= 7);
