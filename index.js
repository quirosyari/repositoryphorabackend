require('dotenv').config({ override: true }); // <— importante
const express = require("express");
const cors = require("cors");
const routerAPI = require('./routes/index.js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// 🔴 Descomenta esto después de probar health
 routerAPI(app);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API en puerto ${port}`));
