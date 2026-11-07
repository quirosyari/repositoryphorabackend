
const routerCasilleros = require("./casilleros.js");
const routerTrackings = require("./trackings.js");
const routerUsuarios = require("./usuarios.js");
 const routerEstadisticas = require("./estadisticas.js");
const   routerFacturas= require("./facturas.js");
const   routerHistorial= require("./historialcambios.js");


function routerAPI(app) {
 app.use("/usuarios", routerUsuarios);
  app.use("/casilleros", routerCasilleros);
  app.use("/trackings", routerTrackings);
  app.use("/estadisticas", routerEstadisticas);
  app.use("/facturas", routerFacturas);
    app.use("/historial", routerHistorial);

          } 
          module.exports = routerAPI;