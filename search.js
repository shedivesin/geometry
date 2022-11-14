// http://paulbourke.net/geometry/circlesphere/
function intersect([ax, ay, ar], [bx, by, br]) {
  bx -= ax;
  by -= ay;

  const d = Math.hypot(bx, by);
  if(d > ar + br || d < Math.abs(ar - br)) { return []; }

  const x = (ar * ar - br * br + d * d) / (2 * d);
  if(x >= ar) { return [[(ax * d + bx * x) / d, (ay * d + by * x) / d]]; }

  const y = Math.sqrt(ar * ar - x * x);
  return [
    [(ax * d + bx * x - by * y) / d, (ay * d + by * x + bx * y) / d],
    [(ax * d + bx * x + by * y) / d, (ay * d + by * x - bx * y) / d],
  ];
}


// FIXME: Instead of using a fixed set of rotation matrices, why not pick
// points and transform everything such that the second point is at 1,0.
const SQRT3_2 = Math.sqrt(3) / 2;
const ROTATION_MATRICES = [
  [+1, 0, 0, +1],
  [-1, 0, 0, +1],
  [+1, 0, 0, -1],
  [-1, 0, 0, -1],
  [+0.5, -SQRT3_2, +SQRT3_2, +0.5],
  [-0.5, -SQRT3_2, -SQRT3_2, +0.5],
  [+0.5, +SQRT3_2, +SQRT3_2, -0.5],
  [-0.5, +SQRT3_2, -SQRT3_2, -0.5],
  [-0.5, -SQRT3_2, +SQRT3_2, -0.5],
  [+0.5, -SQRT3_2, -SQRT3_2, -0.5],
  [-0.5, +SQRT3_2, +SQRT3_2, +0.5],
  [+0.5, +SQRT3_2, -SQRT3_2, +0.5],
];

// FIXME: Since rounding basically turns the floats into int32s, and since
// Javascript strings are 16-bit characters, perhaps we can simply turn a
// circle into a 6-character string?
function round(x) { return Math.round(x * 1e8) / 1e8; }
function str(obj) { return obj.map(round).toString(); }

function hashes(circles) {
  let best;

  const n = circles.length;
  const temp = new Array(n);

  for(const c of circles) {
    for(const m of ROTATION_MATRICES) {
      for(let j = 0; j < n; j++) {
        const p = circles[j];
        const x = round((p[0] - c[0]) * m[0] + (p[1] - c[1]) * m[1]);
        const y = round((p[0] - c[0]) * m[2] + (p[1] - c[1]) * m[3]);
        const r = round(p[2]);
        temp[j] = x + "," + y + "," + r;
      }

      const hash = temp.sort().join(";");
      if(best === undefined || hash.localeCompare(best) < 0) { best = hash; }
    }
  }

  return best;
}


// FIXME: Is memory usage better if we use objects (with __proto__ pointers)
// rather than Maps?
// FIXME: BFS is incapable of going beyond 6 states. Return to DFS with a
// depth cap.
function search(max_depth) {
  const start = Date.now();

  const a = [0, 0];
  const b = [1, 0];
  const open = [[new Map(), new Map().set(str(a), a).set(str(b), b)]];
  const closed = new Set().add("");

  while(open.length >= 1) {
    const [circles, points] = open.shift();
    // console.log(Array.from(circles.values()));

    if(circles.size >= max_depth) { continue; }

    for(const a of points.values()) {
      for(const b of points.values()) {
        if(a === b) { continue; }

        const circle = [a[0], a[1], Math.hypot(b[0] - a[0], b[1] - a[1])];
        const key = str(circle);
        if(circles.has(key)) { continue; }

        const new_circles = new Map(circles).set(key, circle);
        const key2 = hashes(Array.from(new_circles.values()));
        if(closed.has(key2)) { continue; }
        closed.add(key2);

        const new_points = new Map(points);
        for(const other of circles.values()) {
          for(const point of intersect(circle, other)) {
            const key = str(point);
            if(new_points.has(key)) { continue; }

            new_points.set(key, point);
          }
        }

        open.push([new_circles, new_points]);
      }
    }
  }

  console.log(
    "Explored %d state(s) in %d ms.",
    closed.size,
    Date.now() - start,
  );
}


search(0);
search(1);
search(2);
search(3);
search(4);
search(5);
search(6);
search(7);
//search(8);
