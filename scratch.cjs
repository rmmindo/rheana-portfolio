const fs = require('fs');

// Helpers
const pt = (x, y) => `${x},${y}`;
const M = (x, y) => `M ${pt(x,y)}`;
const L = (x, y) => `L ${pt(x,y)}`;

// Path 1: Work (White) - needs 6 nodes for work.json
// Let's define the points and interpolate for SVG
const workPoints = [
  [50, 8],    // Start circle
  [50, 25],   // Node 1
  [55, 30],
  [65, 30],
  [65, 38],   // Node 2
  [65, 65],
  [45, 65],
  [40, 60],
  [30, 60],   // Node 3
  [30, 70],
  [45, 70],
  [50, 75],
  [55, 75],   // Node 4
  [60, 80],
  [65, 80],   // Node 5
  [70, 85],
  [75, 85],   // Node 6
  [75, 92]    // End circle
];

const voluntaryPoints = [
  [85, 20],   // Start
  [85, 25],
  [75, 25],
  [70, 30],
  [65, 30],
  [65, 25],
  [55, 15],
  [45, 15],   // Node 1
  [40, 20],
  [35, 20],
  [30, 25],   // Node 2
  [30, 35],
  [25, 40],   // Node 3
  [25, 60],
  [20, 65],   // Node 4
  [20, 75],
  [25, 80],   // Node 5
  [40, 80],
  [45, 85],
  [50, 85],   // Node 6
  [55, 90],
  [40, 90],
  [35, 85],   // Node 7
  [25, 85],
  [20, 90]    // End
];

const othersPoints = [
  [75, 75],   // Start
  [65, 75]    // Node 1
];

// We will also add decorative yellow paths to make it look like a real PCB
const bgPaths = [
  // Trace 1
  [[10, 10], [20, 10], [25, 15], [25, 25], [15, 35]],
  // Trace 2
  [[90, 10], [90, 40], [80, 50], [80, 60], [90, 70]],
  // Trace 3
  [[10, 90], [20, 90], [30, 80], [30, 60], [15, 45]]
];

function toPath(pts) {
  return pts.map((p, i) => (i === 0 ? M(p[0], p[1]) : L(p[0], p[1]))).join(' ');
}

const workPathStr = toPath(workPoints);
const volPathStr = toPath(voluntaryPoints);
const othPathStr = toPath(othersPoints);
const bgPathStrs = bgPaths.map(toPath);

console.log("WORK:", workPathStr);
console.log("VOL:", volPathStr);
console.log("OTHERS:", othPathStr);
