import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/services/db/prisma";
import { hashPassword } from "../src/services/security/password";

// Todos os usuarios usam a mesma senha. Como o hash e sem salt, todos os
// registros terao exatamente o mesmo valor na coluna password.
const PLAIN_PASSWORD = "123456";
const HASHED_PASSWORD = hashPassword(PLAIN_PASSWORD);

const users: Prisma.UserCreateManyInput[] = [
  {
    id: "user_ana",
    name: "Ana Beatriz",
    email: "ana.aluna@example.com",
    role: "student",
    password: HASHED_PASSWORD,
  },
  {
    id: "user_bruno",
    name: "Bruno Lima",
    email: "bruno.professor@example.com",
    role: "teacher",
    password: HASHED_PASSWORD,
  },
  {
    id: "user_carla",
    name: "Carla Suporte",
    email: "carla.suporte@example.com",
    role: "support",
    password: HASHED_PASSWORD,
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
    console.log(`  ${user.email} / ${PLAIN_PASSWORD} (${user.role})`);
  }
  console.log(`\nHash gravado no banco (igual para todos): ${HASHED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
