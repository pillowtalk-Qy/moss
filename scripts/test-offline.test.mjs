import assert from "node:assert/strict";
import { test } from "node:test";
import { runOfflineTests } from "./test-offline.mjs";

test("sets MOSS_SKIP_E2E and runs the recursive workspace test command", () => {
  let call;
  const code = runOfflineTests({
    env: { EXISTING: "kept", MOSS_SKIP_E2E: "0" },
    platform: "darwin",
    stdio: "pipe",
    spawn: (command, args, options) => {
      call = { command, args, options };
      return { status: 0 };
    },
  });

  assert.equal(code, 0);
  assert.equal(call.command, "pnpm");
  assert.deepEqual(call.args, ["-r", "test"]);
  assert.equal(call.options.stdio, "pipe");
  assert.equal(call.options.env.EXISTING, "kept");
  assert.equal(call.options.env.MOSS_SKIP_E2E, "1");
});

test("uses the Windows pnpm command shim", () => {
  let command;
  runOfflineTests({
    platform: "win32",
    stdio: "pipe",
    spawn: (nextCommand) => {
      command = nextCommand;
      return { status: 0 };
    },
  });

  assert.equal(command, "pnpm.cmd");
});

test("returns the underlying test command exit status", () => {
  const code = runOfflineTests({
    stdio: "pipe",
    spawn: () => ({ status: 7 }),
  });

  assert.equal(code, 7);
});

test("throws spawn errors instead of hiding command failures", () => {
  const error = new Error("pnpm not found");

  assert.throws(
    () =>
      runOfflineTests({
        stdio: "pipe",
        spawn: () => ({ error }),
      }),
    error,
  );
});
