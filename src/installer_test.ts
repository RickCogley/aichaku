import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { install } from "./installer.ts";
import { exists } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

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
