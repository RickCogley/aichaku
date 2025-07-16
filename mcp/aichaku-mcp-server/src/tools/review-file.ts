/**
 * Review File Tool - Updated with blocklist support
 */

import type { ReviewRequest, ReviewResult } from "../types.ts";
import { ReviewEngine } from "../review-engine.ts";
import type { ReviewerConfig } from "../utils/file-filter.ts";

export async function reviewFile(
  file: string,
  content?: string,
  includeExternal = true,
  config: ReviewerConfig = {}
): Promise<ReviewResult> {
  const reviewEngine = new ReviewEngine(config);
  await reviewEngine.initialize();

  const request: ReviewRequest = {
    file,
    content,
    includeExternal,
    standards: [],
    methodologies: []
  };

  const result = await reviewEngine.review(request);
  
  // Add exclusion statistics to result if file was excluded
  if (result.excluded) {
    const filter = reviewEngine['fileFilter']; // Access private property for stats
    if (filter) {
      console.log(`📋 File excluded: ${file}`);
      console.log(`   Reason: ${result.excludeReason}`);
      console.log(`   ${filter.getExclusionSummary()}`);
    }
  }

  return result;
}

export async function reviewFiles(
  files: string[],
  config: ReviewerConfig = {}
): Promise<ReviewResult[]> {
  const results: ReviewResult[] = [];
  let excluded = 0;
  let reviewed = 0;

  for (const file of files) {
    const result = await reviewFile(file, undefined, true, config);
    results.push(result);
    
    if (result.excluded) {
      excluded++;
    } else {
      reviewed++;
    }
  }

  // Print summary
  console.log(`\n🔍 Review Summary:`);
  console.log(`   Files reviewed: ${reviewed}`);
  console.log(`   Files excluded: ${excluded}`);
  console.log(`   Total files: ${files.length}`);

  return results;
}

// Export for MCP tool use
export { reviewFile as default };