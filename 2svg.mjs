import readline from "node:readline";
import fs from "node:fs";

fs.mkdir("svg", (err) => {
  if(err && err.code !== "EEXIST") { console.warn(err); }
});

let n = 0;

readline.
  createInterface({input: process.stdin}).
  on("line", line => {
    const cs = [];
    let min_x = 0;
    let min_y = 0;
    let max_x = 0;
    let max_y = 0;

    for(const str of line.split(";")) {
      const c = str.split(",", 3);
      c[0] = Math.round((+c[0]) * 1e6);
      c[1] = Math.round((+c[1]) * 1e6);
      c[2] = Math.round((+c[2]) * 1e6);
      cs.push(c);

      min_x = Math.min(min_x, c[0] - c[2] - 5e5);
      min_y = Math.min(min_y, c[1] - c[2] - 5e5);
      max_x = Math.max(max_x, c[0] + c[2] + 5e5);
      max_y = Math.max(max_y, c[1] + c[2] + 5e5);
    }

    let str = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min_x/1e6} ${min_y/1e6} ${(max_x-min_x)/1e6} ${(max_y-min_y)/1e6}"><g fill="none" stroke="#000" stroke-width="0.033333">`;
    for(const c of cs) {
      str += "<circle";
      if(c[0] !== 0) { str += ` cx="${c[0]/1e6}"`; }
      if(c[1] !== 0) { str += ` cy="${c[1]/1e6}"`; }
      str += ` r="${c[2]/1e6}"/>`;
    }
    str += "</g><circle r=\"0.066667\"/><circle cy=\"1\" r=\"0.066667\"/></svg>\n";
    fs.writeFile(`svg/${n++}.svg`, str, (err) => {
      if(err) { console.warn(err); }
    });
  });
