import "nightingale-unit-testing";
import { strictEqual } from "node:assert";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { transform } from "@babel/core";
import plugin from "./index.js";

const dirname = fileURLToPath(new URL(".", import.meta.url));
const tests = fs
  .readdirSync(path.resolve(dirname, "__tests_fixtures__"))
  .filter((name) => name.endsWith(".cjs"));

tests.forEach((filename) => {
  const require = createRequire(import.meta.url);

  // eslint-disable-next-line import/no-dynamic-require
  const testContent = require(
    path.resolve(dirname, "__tests_fixtures__", filename),
  );

  test(testContent.name || filename, () => {
    try {
      const output = transform(testContent.actual, {
        babelrc: false,
        presets: [],
        plugins: [[plugin, testContent.pluginOptions || {}]],
      });

      const actual = output.code.trim();
      const expected = testContent.expected.trim();

      strictEqual(actual, expected);
    } catch (error) {
      if (error._babel && error instanceof SyntaxError) {
        console.log(`Unexpected error in test: ${test.name || filename}`);
        console.log(`${error.name}: ${error.message}\n${error.codeFrame}`);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
      } else {
        throw error;
      }
    }
  });
});
