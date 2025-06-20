import readline from "node:readline";

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
      c[0] = Math.round((+c[0]) * 3e7);
      c[1] = Math.round((+c[1]) * 3e7);
      c[2] = Math.round((+c[2]) * 3e7);
      cs.push(c);

      min_x = Math.min(min_x, c[0] - c[2] - 5e5);
      min_y = Math.min(min_y, c[1] - c[2] - 5e5);
      max_x = Math.max(max_x, c[0] + c[2] + 5e5);
      max_y = Math.max(max_y, c[1] + c[2] + 5e5);
    }

    console.log(
      "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"%d %d %d %d\">",
      min_x / 1e6,
      min_y / 1e6,
      (max_x - min_x) / 1e6,
      (max_y - min_y) / 1e6,
    );
    for(const c of cs) {
      let str = "<circle";
      if(c[0] !== 0) { str += ` cx="${c[0] / 1e6}"`; }
      if(c[1] !== 0) { str += ` cy="${c[1] / 1e6}"`; }
      str += " r=\"2\"/>";
      console.log("  %s", str);
    }
    console.log(
      "  <g fill=\"none\" stroke=\"#000\">",
    );
    for(const c of cs) {
      let str = "<circle";
      if(c[0] !== 0) { str += ` cx="${c[0] / 1e6}"`; }
      if(c[1] !== 0) { str += ` cy="${c[1] / 1e6}"`; }
      str += ` r="${c[2] / 1e6}"/>`;
      console.log("    %s", str);
    }
    console.log("  </g>\n</svg>");
  });
