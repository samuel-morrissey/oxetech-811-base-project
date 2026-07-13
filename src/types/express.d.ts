import type { User } from "./types";

// Aumenta o tipo Request do Express para carregar o usuario autenticado.
// O middleware de autenticacao preenche request.user apos validar o cookie.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
