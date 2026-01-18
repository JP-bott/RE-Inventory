import express from "express";
import cors from "cors";
import itemsRouter from "./routes/items.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/items", itemsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Internal server error",
    },
  });
});

export default app;
