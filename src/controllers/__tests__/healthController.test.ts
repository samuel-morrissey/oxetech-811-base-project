import { describe, expect, it } from "vitest";

import { SERVICE } from "../../constants";
import { getHealth } from "../healthController";
import { makeReq, makeRes } from "./httpFakes";

describe("healthController.getHealth", () => {
  it("responde com status ok e nome do servico", () => {
    const { res, json } = makeRes();
    getHealth(makeReq(), res);
    expect(json).toHaveBeenCalledWith({
      status: SERVICE.HEALTH_OK,
      service: SERVICE.NAME,
    });
  });
});
