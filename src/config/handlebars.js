import { engine } from "express-handlebars";

export function setupHandlebars(app) {
  app.engine(
    "hbs",
    engine({
      extname: ".hbs",
      helpers: {
        eq(a, b) {
          return a === b;
        },
        formatPrice(v) {
          try {
            return Number(v || 0).toLocaleString("vi-VN");
          } catch {
            return v;
          }
        },
        increment(v) {
          return Number(v) + 1;
        },
        decrement(v) {
          return Math.max(1, Number(v) - 1);
        },
        range(from, to) {
          from = Number(from);
          to = Number(to);
          const out = [];
          for (let i = from; i <= to; i++) out.push(i);
          return out;
        },
      },
    })
  );
  app.set("view engine", "hbs");
  app.set("views", "src/views");
}
