import { assertEquals } from "jsr:@std/assert@1";
import { install } from "./installer.ts";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

Deno.test("installer - should detect missing methodology", async () => {
  const result = await install("non-existent", { silent: true });

  assertEquals(result.success, false);
  assertEquals(result.methodology, "non-existent");
  assertEquals(result.message, "Methodology 'non-existent' not found");
});

Deno.test("installer - should install to project path", async () => {
  const tempDir = await Deno.makeTempDir();
  const targetPath = join(tempDir, ".claude");

  try {
    const result = await install("shape-up", {
      projectPath: targetPath,
      silent: true,
    });

    assertEquals(result.success, true);
    assertEquals(result.methodology, "shape-up");

    // Check if directories were created
    const hasTemplates = await exists(join(targetPath, "templates"));
    const hasGuide = await exists(
      join(targetPath, "SHAPE-UP-AICHAKU-GUIDE.md"),
    );

    assertEquals(hasTemplates, true);
    assertEquals(hasGuide, true);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});
