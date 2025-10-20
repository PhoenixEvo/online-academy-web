import Handlebars from "handlebars";
Handlebars.registerHelper("increment", (v) => v + 1);
Handlebars.registerHelper("decrement", (v) => v - 1);
Handlebars.registerHelper("gt", (a, b) => a > b);
Handlebars.registerHelper("lt", (a, b) => a < b);
export default Handlebars;