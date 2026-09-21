import express, { response } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello From Gateway");
});

app.use("/api/auth", proxy(process.env.AUTH_SERIVCE_URL));

app.listen(PORT, (req, res) => {
  console.log(`server is running on port ${PORT}`);
});
