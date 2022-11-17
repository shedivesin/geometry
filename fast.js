"use strict";
const EPS = 5e-9;

function equal(x, y) {
  return Math.abs(y - x) < EPS;
}

function equal2(x1, y1, x2, y2) {
  return equal(x1, x2) && equal(y1, y2);
}

function equal3(x1, y1, r1, x2, y2, r2) {
  return equal(x1, x2) && equal(y1, y2) && equal(r1, r2);
}

function contains2(p, pn, x, y) {
  for(let i = 0; i < pn; i += 2) {
    if(equal2(p[i], p[i + 1], x, y)) {
      return true;
    }
  }

  return false;
}

function contains3(c, cn, x, y, r) {
  for(let i = 0; i < cn; i += 3) {
    if(equal3(c[i], c[i + 1], c[i + 2], x, y, r)) {
      return true;
    }
  }

  return false;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function intersect(x1, y1, r1, x2, y2, r2, s) {
  x2 -= x1;
  y2 -= y1;

  const d_sq = x2 * x2 + y2 * y2;
  if(d_sq >= (r1 + r2) * (r1 + r2)) { return false; }
  if(d_sq <= (r1 - r2) * (r1 - r2)) { return false; }

  const a = (r1 * r1 - r2 * r2 + d_sq) / (2 * d_sq);
  const h_sq = r1 * r1 - a * a * d_sq;
  if(h_sq <= 0) { return false; }

  const h = Math.sqrt(h_sq / d_sq);
  s[0] = x1 + x2 * a - y2 * h;
  s[1] = y1 + y2 * a + x2 * h;
  s[2] = x1 + x2 * a + y2 * h;
  s[3] = y1 + y2 * a - x2 * h;
  return true;
}

function search_to_depth(test, c, cn, p, pn, s, d) {
  if(test(p, pn)) {
    // FIXME: We want to do a deduplication step in here!

    c.length = cn;
    console.log("%s", c.join(","));
    return true;
  }

  if(cn >= d) {
    return false;
  }

  let done = false;

  for(let i = 0; i < pn; i += 2) {
    for(let j = 0; j < pn; j += 2) {
      if(i === j) { continue; }

      if(equal2(p[i], p[i + 1], p[j], p[j + 1])) { continue; }

      const r = distance(p[i], p[i + 1], p[j], p[j + 1]);
      if(contains3(c, cn, p[i], p[i + 1], r)) { continue; }

      let cn2 = cn;
      c[cn2++] = p[i];
      c[cn2++] = p[i + 1];
      c[cn2++] = r;

      let pn2 = pn;
      for(let k = 0; k < cn; k += 3) {
        if(!intersect(c[k], c[k + 1], c[k + 2], p[i], p[i + 1], r, s)) { continue; }

        for(let l = 0; l < 4; l += 2) {
          if(contains2(p, pn2, s[l], s[l + 1])) { continue; }

          p[pn2++] = s[l];
          p[pn2++] = s[l + 1];
        }
      }

      done = search_to_depth(test, c, cn2, p, pn2, s, d) || done;
    }
  }

  return done;
}

function search(test) {
  const c = [];
  const p = [0, 0, 1, 0];
  const s = [NaN, NaN, NaN, NaN];
  for(let d = 0; !search_to_depth(test, c, 0, p, 4, s, d); d += 3);
}

search((p, pn) => contains2(p, pn, 1, 0) &&
  contains2(p, pn, 0, 1) &&
  contains2(p, pn, -1, 0) &&
  contains2(p, pn, 0, -1));
