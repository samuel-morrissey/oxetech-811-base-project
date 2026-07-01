import cors from "cors";
import express from "express";
import router from "./routes/routes";
import { dispatcher } from "./events/dispatcher";
import { EmailService } from "./services/email/EmailService";

const emailService = new EmailService();

dispatcher.on("ticket.created", (ticket) => {
  emailService.sendEmail("admin@oxetech.com", "Novo Ticket Criado", `Um novo ticket foi criado: ${ticket.title}`);
});

dispatcher.on("ticket.created", (ticket) => {
  console.info(`Evento recebido: ticket.created - ${ticket.title}`);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota nao encontrada" });
});

export { app, dispatcher };
