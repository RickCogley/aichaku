Need to encorporate summarize conversation checkpoint hooks. The idea is to call
a script, passing it the transcript of the current conversation, making it more
deterministic, and running on both Stop and preCompact events, especially since
compacting is automatic.

The script it is calling is ./summarize-conversation.ts and the hooks would
obviously need their path updated to the correct location.

Question is, where to store the script? In the global aichaku settings folder
e.g. /Users/rcogley/.aichaku ? In where aichaku is installed e.g.
/Users/rcogley/.deno/bin/aichaku ?

```json
{
  "hooks": [
    {
      "event": "preCompact",
      "command": "deno run --allow-read --allow-run /path/to/summarize-conversation.ts"
    },
    {
      "event": "Stop",
      "command": "deno run --allow-read --allow-run /path/to/summarize-conversation.ts"
    }
  ]
}
```
