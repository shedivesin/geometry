"use strict";

function distance(p, q) {
  return Math.hypot(q.x - p.x, q.y - p.y);
}

// http://paulbourke.net/geometry/circlesphere/
function intersect(p, q) {
  const d = distance(p, q);
  if(d > p.r + q.r || d < Math.abs(p.r - q.r)) { return []; }

  const a = (p.r * p.r - q.r * q.r + d * d) / (2 * d);
  if(a >= p.r) {
    return [
      {
        x: p.x + (q.x - p.x) * a / d,
        y: p.y + (q.y - p.y) * a / d,
      },
    ];
  }

  const h = Math.sqrt(p.r * p.r - a * a);
  return [
    {
      x: p.x + (q.x - p.x) * (a / d) - (q.y - p.y) * (h / d),
      y: p.y + (q.y - p.y) * (a / d) + (q.x - p.x) * (h / d),
    },
    {
      x: p.x + (q.x - p.x) * (a / d) + (q.y - p.y) * (h / d),
      y: p.y + (q.y - p.y) * (a / d) - (q.x - p.x) * (h / d),
    },
  ];
}

function len(node) {
  let n = 0;
  for(; node; n++, node = node.next);
  return n;
}

function* points(a) {
  yield {x: 0, y: 0};
  yield {x: 1, y: 0};

  for(; a; a = a.next) {
    for(let b = a.next; b; b = b.next) {
      yield* intersect(a, b);
    }
  }
}

function contains(node, x, y, r) {
  for(; node; node = node.next) {
    if(Math.abs(node.x - x) < 1e-8 && Math.abs(node.y - y) < 1e-8 && Math.abs(node.r - r) < 1e-8) {
      return true;
    }
  }

  return false;
}

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

// FIXME: This clearly isn't working right... take another look at it.
function hash(list) {
  const array = [];
  let hash;

  for(let center = list; center; center = center.next) {
    for(const matrix of ROTATION_MATRICES) {
      for(let node = list; node; node = node.next) {
        const x = Math.round(((node.x - center.y) * matrix[0] + (node.y - center.y) * matrix[1]) * 1e8);
        const y = Math.round(((node.x - center.y) * matrix[2] + (node.y - center.y) * matrix[3]) * 1e8);
        const r = Math.round(node.r * 1e8);
        array.push(x + "," + y + "," + r);
      }

      const cand = array.sort().join(";");
      if(hash === undefined || cand.localeCompare(hash) < 0) { hash = cand; }

      array.length = 0;
    }
  }

  return hash;
}

function search(depth) {
  const start = Date.now();
  // FIXME: A bloom filter would be much more space-efficient.
  const closed = new Set();

  for(const open = [null]; open.length; ) {
    const next = open.shift();
    // console.log(next);

    const key = hash(next);
    if(closed.has(key)) { continue; }
    closed.add(key);

    // FIXME: We could cache length on each node, making this step O(1).
    if(len(next) >= depth) { continue; }

    for(const p of points(next)) {
      for(const q of points(next)) {
        if(Math.abs(q.x - p.x) < 1e-8 && Math.abs(q.y - p.y) < 1e-8) { continue; }

        const r = distance(p, q);
        if(contains(next, p.x, p.y, r)) { continue; }

        open.push({x: p.x, y: p.y, r, next});
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
