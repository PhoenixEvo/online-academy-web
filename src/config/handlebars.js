import { engine } from "express-handlebars";
import hbs_sections from 'express-handlebars-sections'
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
        fill_section: hbs_sections(),
        gt(a, b) {
          return a > b;
        },
        lt(a, b) {
          return a < b;
        },
        gte(a, b) {
          return a >= b;
        },
        lte(a, b) {
          return a <= b;
        },

        subtract(a, b) {
          return Number(a) - Number(b);
        },
        add(a, b) {
          return Number(a) + Number(b);
        },
        max(a, b) {
          return Math.max(Number(a), Number(b));
        },
        min(a, b) {
          return Math.min(Number(a), Number(b));
        },
        isAtPage(currentPage, pageNum) {
          return parseInt(currentPage) === parseInt(pageNum);
        },
        formatDuration(seconds) {
          if (!seconds || seconds === 0) return '0m';
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          
          if (hours > 0) {
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
          }
          return `${minutes}m`;
        },
        divide(a, b) {
          if (!b || b === 0) return 0;
          return Math.round((Number(a) / Number(b)) * 100);
        },
        or() {
          // Check if any argument is truthy
          return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        },
      },

    })
  );
  app.set("view engine", "hbs");
  app.set("views", "src/views");
}