import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import router from "./routes/index.js";

const app = express();
const port = env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota nao encontrada" });
});

app.listen(port, () => {
  console.log(
    `Oxetech Helpdesk API running on http://localhost:${port}`,
  );
});
