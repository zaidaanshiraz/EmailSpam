import express from "express";
import connect from "./config/db.js";
import routes from "./routes/route.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", routes);
app.use("/auth", authRoutes);

app.listen(3001, async () => {
  console.log("server running on port 3001");
  await connect();
  console.log("mongoDB connected");
});