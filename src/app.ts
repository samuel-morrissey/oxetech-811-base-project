import cors from "cors";
import express from "express";
import router from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use((_request, response) => {
  response.status(404).json({
    message: "Rota nao encontrada",
  });
});

export default app;
