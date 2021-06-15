import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import morgan from "morgan";
import path from "path";

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/groups", groupRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (request, response) =>
    response.sendFile(
      path.resolve(__dirname, "frontend", "build", "index.html")
    )
  );
} else {
  app.get("/", (request, response) => {
    response.send("API is running");
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
