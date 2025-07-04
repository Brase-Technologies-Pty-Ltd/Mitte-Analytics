import sequelize from "./src/config/db.config.js";
import express from "express";
import roleRoute from "./src/routes/role.router.js";
import userRoleRoute from "./src/routes/user.role.router.js";
import imprestRoute from "./src/routes/imprest.router.js";
import userRoute from "./src/routes/user.router.js";
import productRoute from "./src/routes/product.router.js";
import genericRoute from "./src/routes/generic.router.js";
import brandRoute from "./src/routes/brand.router.js";
import packUomRoute from "./src/routes/pack.uom.router.js";
import uomRoute from "./src/routes/uom.router.js";
import hospital from "./src/routes/hospital.router.js";
import productFromRoute from "./src/routes/productform.router.js";
import authRoute from "./src/routes/auth.router.js";
import imprestProductRoute from "./src/routes/imprest.products.router.js";
import purchaseRoute from "./src/routes/purchase.router.js";
import externalAuthRoute from "./src/routes/external.auth.router.js";
import emailRoute from "./src/routes/email.router.js";
import stockRoute from "./src/routes/stock.router.js";
import updatepassroute from "./src/routes/updatepass.router.js";
import db_sync from "./src/models/db.sync.js";
import motionalert from "./src/routes/merakimotionalerts.router.js";
import cameraRoute from "./src/routes/camera.router.js";
import cors from "cors";
import client from "prom-client";

import https from "https";
import fs from "fs";
import requestLogger from "./src/middlewares/requestLogger.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const httpsOptions = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

// Create a Registry which registers the metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // collects CPU, memory, etc.

const port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json({ extended: true }));
app.use(requestLogger);
app.use(errorHandler);

app.use("/api/role", roleRoute);
app.use("/api/userrole", userRoleRoute);
app.use("/api/imprest", imprestRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/generic", genericRoute);
app.use("/api/brand", brandRoute);
app.use("/api/packuom", packUomRoute);
app.use("/api/uom", uomRoute);
app.use("/api/productform", productFromRoute);
app.use("/api/hospital", hospital);
app.use("/api/auth", authRoute);
app.use("/api/imprestproduct", imprestProductRoute);
app.use("/api/role/check", externalAuthRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/email", emailRoute);
app.use("/api/stock", stockRoute);
app.use("/api/updatepassword", updatepassroute);
app.use("/api/motionalert", motionalert);
app.use("/api/camera", cameraRoute);

app.use("/api/metrics", async (req, res) => {
  res.header("Content-Type", register.contentType);
  res.send(await register.metrics());
});
app.use("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "OK", database: "connected" });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "disconnected",
      error: error.message,
    });
  }
});

db_sync();

const server = https.createServer(httpsOptions, app);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

server.listen(3001, "0.0.0.0", () => {
  console.log(`Server is running on port ${3001}`);
});
