#!/bin/bash

echo "Testing aichaku review command..."

# Run the review command with a short timeout
(
    deno run -A cli.ts review test-review.ts &
    PID=$!
    sleep 5
    kill $PID 2>/dev/null
) 2>&1

echo "Done."