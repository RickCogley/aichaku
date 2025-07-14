/**
 * Deno Version Checker for Aichaku
 * Ensures the minimum required Deno version is met
 */

const REQUIRED_MAJOR = 2;
const REQUIRED_MINOR = 4;
const REQUIRED_VERSION = `${REQUIRED_MAJOR}.${REQUIRED_MINOR}.0`;

function checkDenoVersion(): void {
  const currentVersion = Deno.version.deno;
  const [major, minor] = currentVersion.split(".").map(Number);

  console.log(`🔍 Checking Deno version...`);
  console.log(`   Current: ${currentVersion}`);
  console.log(`   Required: ${REQUIRED_VERSION}+`);

  if (
    major < REQUIRED_MAJOR ||
    (major === REQUIRED_MAJOR && minor < REQUIRED_MINOR)
  ) {
    console.error(
      `❌ This project requires Deno ${REQUIRED_VERSION} or greater`,
    );
    console.error(`   Current version: ${currentVersion}`);
    console.error(
      `   Please upgrade Deno: https://deno.land/manual/getting_started/installation`,
    );
    console.error(``);
    console.error(`   Upgrade commands:`);
    console.error(
      `   • macOS/Linux: curl -fsSL https://deno.land/install.sh | sh`,
    );
    console.error(`   • Windows: irm https://deno.land/install.ps1 | iex`);
    console.error(`   • Homebrew: brew upgrade deno`);
    Deno.exit(1);
  }

  console.log(`✅ Deno version check passed`);
}

// Run the check when this file is executed directly
if (import.meta.main) {
  checkDenoVersion();
}

export { checkDenoVersion };
