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
        formatDate(date) {
          if (!date || date === null || date === undefined) return 'N/A';
          try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return 'N/A';
            return dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          } catch (error) {
            console.error('formatDate error:', error);
            return 'N/A';
          }
        },
      },
    })
  );
  app.set("view engine", "hbs");
  app.set("views", "src/views");
}