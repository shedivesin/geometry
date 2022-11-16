"use strict";

const EPS = 5e-9;

function equal(x, y) {
  return Math.abs(y - x) < EPS;
}

function contains2(points, x, y) {
  const n = points.length;

  for(let i = 0; i < n; i += 2) {
    if(equal(x, points[i]) && equal(y, points[i + 1])) {
      return true;
    }
  }

  return false;
}

function contains3(circles, x, y, r) {
  const n = circles.length;

  for(let i = 0; i < n; i += 3) {
    if(equal(x, circles[i]) && equal(y, circles[i + 1]) && equal(r, circles[i + 2])) {
      return true;
    }
  }

  return false;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

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
    x1 + x2 * a - y2 * h, y1 + y2 * a + x2 * h,
    x1 + x2 * a + y2 * h, y1 + y2 * a - x2 * h,
  ];
}

function search_to_depth(test, circles, points, depth) {
  if(circles.length >= depth * 3) { return false; }

  if(test(circles, points)) {
    console.log("%j", circles);
    return true;
  }

  const m = circles.length;
  const n = points.length;
  let done = false;

  for(let i = 0; i < n; i += 2) {
    for(let j = 0; j < n; j += 2) {
      if(i === j) { continue; }

      const r = distance(points[i], points[i + 1], points[j], points[j + 1]);
      if(equal(r, 0)) { continue; }
      if(contains3(circles, points[i], points[i + 1], r)) { continue; }

      circles.push(points[i], points[i + 1], r);

      for(let k = 0; k < m; k += 3) {
        const p = intersect(
          circles[k], circles[k + 1], circles[k + 2],
          circles[m], circles[m + 1], circles[m + 2],
        );

        for(let l = 0; l < p.length; l += 2) {
          if(contains2(points, p[l], p[l + 1])) { continue; }

          points.push(p[l], p[l + 1]);
        }
      }

      done = search_to_depth(test, circles, points, depth) || done;

      circles.length = m;
      points.length = n;
    }
  }

  return done;
}

function search(test) {
  const start = Date.now();
  const circles = [];
  const points = [0, 0, 1, 0];

  for(
    let depth = 0;
    !search_to_depth(test, circles, points, depth);
    depth++
  );

  const end = Date.now();
  console.log("Explored ??? state(s) in %d ms.", end - start);
}

// Napoleon's Problem (inscribe a square in a given circle).
search(circles => {
  const n = circles.length;
  return n >= 9 &&
    equal(circles[n - 1], Math.SQRT2) &&
    equal(distance(circles[n - 3], circles[n - 2], 0, 0), 1);
});
