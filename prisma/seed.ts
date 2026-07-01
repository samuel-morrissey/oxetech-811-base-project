import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/services/db/prisma";

const users: Prisma.UserCreateManyInput[] = [
  {
    id: "user_ana",
    name: "Ana Beatriz",
    email: "ana.aluna@example.com",
    role: "student",
    password: "123456",
  },
  {
    id: "user_bruno",
    name: "Bruno Lima",
    email: "bruno.professor@example.com",
    role: "teacher",
    password: "professor123",
  },
  {
    id: "user_carla",
    name: "Carla Suporte",
    email: "carla.suporte@example.com",
    role: "support",
    password: "suporte123",
  },
];

const tickets: Prisma.TicketCreateManyInput[] = [
  {
    id: "ticket_001",
    title: "Nao consigo acessar o ambiente virtual",
    description: "A pagina de login informa erro mesmo com a senha correta.",
    category: "sistemas",
    status: "open",
    priority: "high",
    requesterId: "user_ana",
    assignedToId: "user_carla",
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "ticket_002",
    title: "Projetor da sala 204 nao liga",
    description: "O equipamento esta sem imagem e a aula comeca em uma hora. Urgente.",
    category: "infra",
    status: "in_progress",
    priority: "urgent",
    requesterId: "user_bruno",
    assignedToId: "user_carla",
    createdAt: "2026-05-02T08:15:00.000Z",
    updatedAt: "2026-05-02T08:35:00.000Z",
  },
  {
    id: "ticket_003",
    title: "Duvida sobre prazo de atividade",
    description: "Preciso confirmar a data final de entrega do projeto integrador.",
    category: "academico",
    status: "resolved",
    priority: "medium",
    requesterId: "user_ana",
    assignedToId: "user_bruno",
    createdAt: "2026-05-03T14:20:00.000Z",
    updatedAt: "2026-05-04T09:00:00.000Z",
  },
];

// Cada comentario aponta para o ticket (ticketId) e para o autor (authorId),
// deixando explicito o vinculo usuario -> comentario.
const comments: Prisma.TicketCommentCreateManyInput[] = [
  {
    id: "comment_001",
    ticketId: "ticket_002",
    authorId: "user_carla",
    message: "Chamado recebido. Vou verificar o equipamento antes da aula.",
    createdAt: "2026-05-02T08:35:00.000Z",
  },
  {
    id: "comment_002",
    ticketId: "ticket_003",
    authorId: "user_bruno",
    message: "O prazo final esta registrado no ambiente virtual da disciplina.",
    createdAt: "2026-05-04T09:00:00.000Z",
  },
  {
    id: "comment_003",
    ticketId: "ticket_001",
    authorId: "user_ana",
    message: "Continuo sem acesso mesmo apos redefinir a senha.",
    createdAt: "2026-05-01T11:30:00.000Z",
  },
];

async function main() {
  // Limpa na ordem inversa das dependencias para respeitar as foreign keys.
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: users });
  await prisma.ticket.createMany({ data: tickets });
  await prisma.ticketComment.createMany({ data: comments });

  console.log("Banco de dados populado com sucesso.");
  console.log("\nCredenciais para login (POST /api/auth/login):");
  for (const user of users) {
    console.log(`  ${user.email} / ${user.password} (${user.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
