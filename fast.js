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

function update_points(cn, pn) {
  cn -= 3;

  for(let i = 0; i < cn; i += 3) {
    pn = add_intersection_points(
      pn,
      circles[i], circles[i+1], circles[i+2],
      circles[cn], circles[cn+1], circles[cn+2],
    );
  }

  return pn;
}


// FIXME: Some amount of state deduplication may render the wheel unneccessary.
const SQRT3 = Math.sqrt(3);
const WHEEL_DEPTH = 5;
const WHEELS = [
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1, 0, SQRT3],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1, 0, 2],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 0.5, -SQRT3/2, 1],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 0.5, -SQRT3/2, SQRT3],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 0.5, -SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 0.5, -SQRT3/2, 2.6457513110645907],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, SQRT3/2, SQRT3],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, SQRT3/2, 1],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, -SQRT3/2, SQRT3],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, -SQRT3/2, 1],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, -SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, -SQRT3/2, 2.6457513110645907],
  [0.5, SQRT3/2, 1, 0, 0, SQRT3, 1.5, -SQRT3/2, 3],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, 1, 0.5, SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, 1, -0.5, SQRT3/2, 1],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, 1, -0.5, SQRT3/2, SQRT3],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, 1, -0.5, SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, 1, -0.5, SQRT3/2, 2.6457513110645907],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 0, 0, 2],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 0, 0, 1.5676182914716],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 0, 0, 0.736595473950025],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 0.5, -SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -0.5, SQRT3/2, SQRT3],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -0.5, SQRT3/2, 2],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -0.5, SQRT3/2, 2.6457513110645907],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -0.5, SQRT3/2, 1.9785990537531035],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -0.5, SQRT3/2, 0.2917975059648793],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, 1],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, 2],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, SQRT3],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, 2.6457513110645907],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, 3],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, 2.5243377989621387],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, -1, 0, 0.7922869913932612],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 1.5676182914716],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 0.736595473950025],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 1],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, SQRT3],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 1.9785990537531035],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 0.2917975059648793],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 2.5243377989621387],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 0.7922869913932612],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, SQRT3, 1.457427107756338, 0.5773502691896257, 1.9148542155126762],
  [0.5, SQRT3/2, 1, 0.5, -SQRT3/2, 2, -0.5, SQRT3/2, 2],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 1, 0, 2],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 1, 0, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 0.5, -SQRT3/2, SQRT3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 0.5, -SQRT3/2, 3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, 0, 1],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, 0, 2],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, 0, 3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 2, 0, 2],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 2, 0, 1],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 2, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 2, 0, 3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, 2, 0, 3.4641016151377544],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, SQRT3, 2],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, SQRT3, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, SQRT3, SQRT3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, SQRT3, 3],
  [0.5, SQRT3/2, SQRT3, 0, 0, 2, -1, SQRT3, 3.4641016151377544],
  [0.5, SQRT3/2, SQRT3, 0.5, -SQRT3/2, SQRT3, -1, 0, 1],
  [0.5, SQRT3/2, SQRT3, 0.5, -SQRT3/2, SQRT3, -1, 0, 2],
  [0.5, SQRT3/2, SQRT3, 0.5, -SQRT3/2, SQRT3, -1, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, 0.5, -SQRT3/2, SQRT3, -1, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 0, 0, 0.7365954739500249],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 0, 0, 1.5676182914716001],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 1, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 1, 0, 1.4440033879764007],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 1, 0, 2.4320473300313616],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 0.5, SQRT3/2, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 0.5, -SQRT3/2, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 0.5, -SQRT3/2, 0.7922869913932613],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 0.5, -SQRT3/2, 2.5243377989621383],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1, 0, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, 2.3722813232690143],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, 2, 0, 3.3722813232690143],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, -SQRT3/2, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, -SQRT3/2, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, -SQRT3/2, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, -SQRT3/2, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, -SQRT3/2, 0.2917975059648793],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, -SQRT3/2, 1.978599053753103],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, SQRT3/2, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, SQRT3/2, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, SQRT3/2, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, SQRT3/2, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, SQRT3/2, 1.5676182914716],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.5, SQRT3/2, 0.736595473950025],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 0.7365954739500249],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 1.4440033879764007],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 0.7922869913932613],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 2.3722813232690143],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 0.2917975059648793],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 1.5676182914716],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -0.27128644612183095, -0.6848186302914435, 1.914854215512676],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 1.5676182914716001],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 2.4320473300313616],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 2.5243377989621383],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 3.3722813232690143],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 1.978599053753103],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 0.736595473950025],
  [0.5, SQRT3/2, SQRT3, -1, 0, 1, -1.228713553878169, 0.9734937648862564, 1.914854215512676],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0, 0, 1.2247448713915892],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0, 0, 1.1691906765556028],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0, 0, 2.1524388869037496],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 1, 0, 0.8567459811922644],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 1, 0, 2.6955493547161966],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.5, SQRT3/2, 1.8512295868219162],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.5, SQRT3/2, 0.2700907567377265],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.5, -SQRT3/2, 0.2700907567377265],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.5, -SQRT3/2, 1.8512295868219162],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.5, -SQRT3/2, 0.3178372451957822],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.5, -SQRT3/2, 3.146264369941972],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -1, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -1, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 2, 0, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 2, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 2, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 2, 0, 1.5811388300841898],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 2, 0, 1.4494897427831779],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 2, 0, 3.449489742783178],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 1.2247448713915892],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 1.8512295868219162],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 0.2700907567377265],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 1.5811388300841898],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 1.9364916731037085],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 0.1472520559347922],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, -0.9682458365518543, 3.348788558497351],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1.2247448713915892],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 0.2700907567377265],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1.8512295868219162],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1.5811388300841898],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1.9364916731037085],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1.8063335144786787],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.75, 0.9682458365518543, 1.8711203213506382],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 1.1691906765556028],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 0.8567459811922644],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 0.3178372451957822],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 1.4494897427831779],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 0.1472520559347922],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 1.8063335144786787],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, 0.816496580927726, -0.8368632931834693, 3.265986323710904],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 2.1524388869037496],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 2.6955493547161966],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 3.146264369941972],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 3.449489742783178],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 3.348788558497351],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 1.8711203213506382],
  [0.5, SQRT3/2, SQRT3, -1, 0, 2, -0.816496580927726, 1.9915638315627209, 3.265986323710904],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, 1, 0, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, 0.5, -SQRT3/2, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, -1, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, 2, 0, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, 2, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, 2, 0, 3.4641016151377544],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, -1, SQRT3, 2],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, -1, SQRT3, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, -1, SQRT3, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, -1, SQRT3, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, SQRT3, -1, SQRT3, 3.4641016151377544],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 0, 0, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 1, 0, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 0.5, -SQRT3/2, 3.4641016151377544],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 2, 0, 3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 0.5, 2.598076211353316, 2.6457513110645907],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 0.5, 2.598076211353316, SQRT3],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 0.5, 2.598076211353316, 3.4641016151377544],
  [0.5, SQRT3/2, SQRT3, -1, 0, 3, 0.5, 2.598076211353316, 3],
];

function search_to_depth(test, cn, pn, d) {
  // FIXME: If we move updating points to here (just passing in how many
  // circles we've added), then we only need to do it in one place (e.g. the
  // wheel setup is merely copying the wheel into the circles array).

  // Check to see if this construction is a solution. If it is, we're done!
  if(test(pn)) {
    // FIXME: We want to do a deduplication step in here!

    console.log("%s", circles.slice(0, cn).join(","));
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

      done = search_to_depth(test, cn2, update_points(cn2, pn), d) || done;
    }
  }

  return done;
}

function search(test) {
  const start = Date.now();
  const n = WHEELS.length;

  circles[0] = 0;
  circles[1] = 0;
  circles[2] = 1;
  circles[3] = 1;
  circles[4] = 0;
  circles[5] = 1;
  points[0] = 0;
  points[1] = 0;
  points[2] = 1;
  points[3] = 0;
  points[4] = 0.5;
  points[5] = SQRT3/2;
  points[6] = 0.5;
  points[7] = -SQRT3/2;

  for(let d = WHEEL_DEPTH;; d++) {
    let done = false;

    for(let i = 0; i < n; i++) {
      const wheel = WHEELS[i];
      const wn = wheel.length;

      // Copy each circle from the wheel, adding its intersection points.
      let cn = 6;
      let pn = 8;

      for(let j = 0; j < wn; j += 3) {
        circles[cn++] = wheel[j];
        circles[cn++] = wheel[j+1];
        circles[cn++] = wheel[j+2];

        pn = update_points(cn, pn);
      }

      // DFS this wheel.
      done = search_to_depth(test, cn, pn, d * 3) || done;
    }

    if(done) {
      break;
    }

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
