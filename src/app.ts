import cors from "cors";
import express from "express";
import router from "./routes/routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use("/api", router);

app.use((_request, response) => {
	response.status(404).json({ message: "Rota nao encontrada" });
});

export default app;
