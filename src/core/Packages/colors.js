// const t = require("./terminal-fx");

// console.log(t.cyan("Olá!"));
// console.log(t.bold(t.yellow("Aviso")));
// console.log(t.gradient("TERMINAL FX"));
// console.log(t.rainbow("efeito colorido"));

// console.log(t.box("Tudo funcionando!", { title: "STATUS" }));

// (async () => {
//   await t.typewrite("Texto aparecendo aos poucos...", 30);
//   await t.spinner("Processando", 2000);
// })();

const ESC = "\x1b[";

const codes = {
  reset: "0",
  bold: "1",
  dim: "2",
  italic: "3",
  underline: "4",
  blink: "5",
  inverse: "7",
  hidden: "8",
  black: "30",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  magenta: "35",
  cyan: "36",
  white: "37",
  gray: "90",
  brightRed: "91",
  brightGreen: "92",
  brightYellow: "93",
  brightBlue: "94",
  brightMagenta: "95",
  brightCyan: "96",
  brightWhite: "97",
};

const wrap = (code, value) => `${ESC}${code}m${value}${ESC}0m`;

const api = {
  reset: "\x1b[0m",

  color(name, value) {
    if (!(name in codes)) throw new Error(`Cor/estilo desconhecido: ${name}`);
    return wrap(codes[name], value);
  },

  rgb(r, g, b, value) {
    return `\x1b[38;2;${r};${g};${b}m${value}\x1b[0m`;
  },

  bgRgb(r, g, b, value) {
    return `\x1b[48;2;${r};${g};${b}m${value}\x1b[0m`;
  },

  gradient(value, from = [65, 65, 65], to = [255, 230, 0]) {
    const chars = [...String(value)];
    if (!chars.length) return "";
    return (
      chars
        .map((ch, i) => {
          const p = chars.length === 1 ? 0 : i / (chars.length - 1);
          const r = Math.round(from[0] + (to[0] - from[0]) * p);
          const g = Math.round(from[1] + (to[1] - from[1]) * p);
          const b = Math.round(from[2] + (to[2] - from[2]) * p);
          return `\x1b[38;2;${r};${g};${b}m${ch}`;
        })
        .join("") + "\x1b[0m"
    );
  },

  rainbow(value) {
    const colors = [
      [255, 80, 80],
      [255, 180, 60],
      [255, 240, 70],
      [80, 220, 120],
      [70, 180, 255],
      [130, 100, 255],
      [220, 80, 220],
    ];
    const chars = [...String(value)];
    return (
      chars
        .map((ch, i) => {
          const c = colors[i % colors.length];
          return `\x1b[38;2;${c[0]};${c[1]};${c[2]}m${ch}`;
        })
        .join("") + "\x1b[0m"
    );
  },

  box(text, options = {}) {
    const title = options.title ? ` ${options.title} ` : "";
    const lines = String(text).split("\n");
    const width = Math.max(
      ...lines.map((x) => [...x].length),
      [...title].length,
    );
    const top = `┌${"─".repeat(width + 2)}┐`;
    const bottom = `└${"─".repeat(width + 2)}┘`;
    const body = lines.map(
      (x) => `│ ${x}${" ".repeat(width - [...x].length)} │`,
    );
    return [top, ...body, bottom].join("\n");
  },

  clear() {
    process.stdout.write("\x1b[2J\x1b[H");
  },

  cursor: {
    hide() {
      process.stdout.write("\x1b[?25l");
    },
    show() {
      process.stdout.write("\x1b[?25h");
    },
    up(n = 1) {
      process.stdout.write(`\x1b[${n}A`);
    },
    down(n = 1) {
      process.stdout.write(`\x1b[${n}B`);
    },
  },

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  async typewrite(text, speed = 35) {
    for (const ch of String(text)) {
      process.stdout.write(ch);
      await api.sleep(speed);
    }
    process.stdout.write("\n");
  },

  async spinner(message, task) {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    let running = true;

    api.cursor.hide();

    const animation = (async () => {
      while (running) {
        process.stdout.write(`\r${frames[i++ % frames.length]} ${message}`);
        await api.sleep(80);
      }
    })();

    try {
      return await task();
    } finally {
      running = false;
      await animation;

      process.stdout.write(`\r\x1b[2K`);
      api.cursor.show();
    }
  },
};

for (const [name, code] of Object.entries(codes)) {
  if (name !== "reset") {
    api[name] = (value) => wrap(code, value);
  }
}

export default api;
