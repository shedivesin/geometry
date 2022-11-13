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


// FIXME: Ditch the reflections array, we can simply use two for loops.
const REFLECTIONS = [[+1, +1], [-1, +1], [+1, -1], [-1, -1]];

function round(x) { return Math.round(x * 1e8) / 1e8; }
function str(obj) { return obj.map(round).toString(); }

function comparator([ax, ay, ar], [bx, by, br]) {
  return (ax - bx) || (ay - by) || (ar - br);
}

function hashes(circles) {
  const m = REFLECTIONS.length;
  const hashes = new Array(m);

  const n = circles.length;
  const temp = new Array(n);
  for(let i = 0; i < n; i++) { temp[i] = [0, 0, 0]; }

  for(let i = 0; i < m; i++) {
    const [a, b] = REFLECTIONS[i];

    for(let j = 0; j < n; j++) {
      const p = circles[j];
      const q = temp[j];
      q[0] = round(p[0] * a);
      q[1] = round(p[1] * b);
      q[2] = round(p[2]);
    }

    hashes[i] = temp.sort(comparator).join(";");
  }

  return hashes;
}


// FIXME: Is memory usage better if we use objects (with __proto__ pointers)
// rather than Maps?
// FIXME: BFS is incapable of going beyond 6 states. Return to DFS with a
// depth cap.
function search(max_depth) {
  const start = Date.now();

  const a = [-0.5, 0];
  const b = [+0.5, 0];
  const open = [[new Map(), new Map().set(str(a), a).set(str(b), b)]];
  const closed = new Set().add("");

  while(open.length >= 1) {
    const [circles, points] = open.shift();
    // console.log(Array.from(circles.values()));

    if(circles.size >= max_depth) { continue; }

    for(const a of points.values()) {
      points: for(const b of points.values()) {
        if(a === b) { continue; }

        const circle = [a[0], a[1], Math.hypot(b[0] - a[0], b[1] - a[1])];
        const key = str(circle);
        if(circles.has(key)) { continue; }

        const new_circles = new Map(circles).set(key, circle);
        const keys = hashes(Array.from(new_circles.values()));
        for(const key of keys) { if(closed.has(key)) { continue points; } }

        closed.add(keys[0]);

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
