import { Request, Response } from "express";
import { UserRepository } from "../core/repositories/UserRepository";
import { User } from "../types/types";
import { SESSION_COOKIE } from "../middleware/authMiddleware";
import { hashPassword } from "../services/security/password";

// Remove a senha antes de devolver o usuario nas respostas.
function toPublicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export class AuthController {
  constructor(private readonly users: UserRepository) {}

  // Faz login: valida email/senha e grava o id do usuario no cookie de sessao.
  login = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      response.status(400).json({ message: "Email e senha sao obrigatorios" });
      return;
    }

    const user = await this.users.findByEmail(email);
    // As senhas sao guardadas como hash SHA-256 sem salt.
    if (!user || user.password !== hashPassword(password)) {
      response.status(401).json({ message: "Credenciais invalidas" });
      return;
    }

    response.cookie(SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
    });

    response.json(toPublicUser(user));
  };

  // Encerra a sessao removendo o cookie.
  logout = async (_request: Request, response: Response) => {
    response.clearCookie(SESSION_COOKIE);
    response.json({ message: "Sessao encerrada" });
  };

  // Retorna o usuario autenticado (preenchido pelo middleware requireAuth).
  me = async (request: Request, response: Response) => {
    response.json(toPublicUser(request.user!));
  };
}
