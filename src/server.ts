import cors from "cors";
import express from "express";
import "dotenv/config";
import { errorHandler } from "./errorHandler";
import { AppError } from "./errors";
import router from "./routes";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use((_request, _response, next) => {
  next(new AppError(404, "Rota nao encontrada"));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Oxetech Helpdesk API running on http://localhost:${port}`);
});
