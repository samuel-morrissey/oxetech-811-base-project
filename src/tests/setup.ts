import fs from "node:fs";
import path from "node:path";
import { beforeEach } from "@jest/globals";

process.env.DATA_FILE = "src/tests/db/db.test.json";

beforeEach(() => {
    const templatePath = path.resolve(
        process.cwd(),
        "src/tests/db/db.test.template.json"
    );

    const testPath = path.resolve(
        process.cwd(),
        "src/tests/db/db.test.json"
    );

    fs.copyFileSync(templatePath, testPath);
});

