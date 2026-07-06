import "dotenv/config";
import { createApp } from "./app";
import { PrismaCommentRepository } from "./services/db/PrismaCommentRepository";
import { PrismaTicketRepository } from "./services/db/PrismaTicketRepository";
import { PrismaUserRepository } from "./services/db/PrismaUserRepository";
import { EmailService } from "./services/email/EmailService";

const app = createApp({
  userRepository: new PrismaUserRepository(),
  ticketRepository: new PrismaTicketRepository(),
  commentRepository: new PrismaCommentRepository(),
  emailService: new EmailService(),
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Oxetech Helpdesk API running on http://localhost:${port}!!`);
});
