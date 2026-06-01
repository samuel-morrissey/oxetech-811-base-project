import { describe, expect, it } from "vitest";
import {
  isValidTicketStatus,
  TICKET_STATUSES,
} from "../../../../src/features/tickets/utils/is-valid-ticket-status.js";

describe("isValidTicketStatus", () => {
  it("exporta todos os status permitidos", () => {
    expect(TICKET_STATUSES).toEqual([
      "open",
      "in_progress",
      "resolved",
      "closed",
    ]);
  });

  it("retorna true para status validos", () => {
    for (const status of TICKET_STATUSES) {
      expect(isValidTicketStatus(status)).toBe(true);
    }
  });

  it("retorna false para status invalidos", () => {
    expect(isValidTicketStatus("invalid")).toBe(false);
    expect(isValidTicketStatus("")).toBe(false);
  });
});
