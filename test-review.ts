// Test file for review
export function processUserInput(input: unknown) {
  // No input validation
  eval(input);

  const password = "hardcoded123";
  console.log(password);

  return input;
}
