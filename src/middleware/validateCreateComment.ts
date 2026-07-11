import { Request, Response, NextFunction } from "express";
import { ERROR_MESSAGES } from "../constante.error";

export function validateCreateComment(request: Request, response: Response, next: NextFunction) {

    if (!request.body.authorId || !request.body.message) {
        response.status(400).json({ error: ERROR_MESSAGES.COMMENT_AND_AUTHOR_REQUIRED_FOR_CLOSING });
        return;
    }

    next();

}