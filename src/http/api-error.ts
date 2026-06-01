import type { Response } from "express";

export type ErrorDetailsValue =
  | string
  | number
  | boolean
  | string[]
  | ErrorDetails
  | ErrorDetailsValue[];

export interface ErrorDetails {
  [key: string]: ErrorDetailsValue;
}

export interface ApiErrorBody {
  message: string;
  details?: ErrorDetails;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: ErrorDetails;

  constructor(
    message: string,
    statusCode: number,
    details?: ErrorDetails,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON(): ApiErrorBody {
    const body: ApiErrorBody = { message: this.message };

    if (this.details) {
      body.details = this.details;
    }

    return body;
  }

  send(response: Response): void {
    response.status(this.statusCode).json(this.toJSON());
  }
}

export class NotFound extends ApiError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 404, details);
  }
}

export class BadRequest extends ApiError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 400, details);
  }
}
