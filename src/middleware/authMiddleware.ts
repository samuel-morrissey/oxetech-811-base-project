import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { UserRepository } from "../core/repositories/UserRepository";

// Nome do cookie que guarda a sessao (o id do usuario autenticado).
export const SESSION_COOKIE = "session";

// Middleware de AUTENTICACAO (nao autorizacao): apenas verifica se existe um
// usuario logado. O cookie de sessao carrega o id do usuario; aqui ele e
// carregado do repositorio e anexado em request.user para os controllers usarem.
export function createAuthMiddleware(users: UserRepository): RequestHandler {
  return async (request: Request, response: Response, next: NextFunction) => {
    const userId = request.cookies?.[SESSION_COOKIE];

    if (!userId) {
      response.status(401).json({ message: "Nao autenticado" });
      return;
    }

    const user = await users.findById(String(userId));
    if (!user) {
      response.status(401).json({ message: "Nao autenticado" });
      return;
    }

    request.user = user;
    next();
  };
}
