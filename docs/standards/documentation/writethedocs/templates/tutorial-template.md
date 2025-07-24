# Getting Started with [Project Name]

Welcome! This tutorial walks you through using [Project] for the first time. By
the end, you'll have [specific achievement] and understand the basics of [key
concepts].

## Before You Begin

This tutorial takes about [time] to complete.

### What You'll Need

- **[Requirement]**: [Why it's needed]
- **[Requirement]**: [Version required and why]
- **Basic familiarity with [prerequisite knowledge]**

> 💡 **New to [prerequisite]?** Check out [this gentle introduction](link)
> first.

### What We'll Build

[Screenshot or diagram of the final result]

In this tutorial, we'll create [description of the end result]. This will teach
you:

- How [Project] handles [concept 1]
- The basics of [concept 2]
- Why [concept 3] matters

## Step 1: Set Up Your Environment

First, let's make sure everything is installed correctly.

### Install [Project]

Open your terminal and run:

```bash
# For macOS/Linux
curl -sSL https://install.example.com | sh

# For Windows
iwr -useb https://install.example.com | iex
```

<details>
<summary>🔧 Troubleshooting installation issues</summary>

**Permission denied error?** Try running with elevated permissions:

```bash
sudo curl -sSL https://install.example.com | sh
```

**Behind a proxy?** Set your proxy environment variables first:

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

**Still having issues?**

- Check our [installation guide](link) for your specific OS
- Ask for help in our [community chat](link)

</details>

### Verify Your Installation

Check that everything is working:

```bash
project --version
```

You should see something like:

```
Project version 1.2.3
Built: 2023-10-15
```

✅ **Checkpoint**: You now have [Project] installed and ready to use!

## Step 2: Create Your First [Thing]

Now for the fun part - let's create something!

### Understanding the Basics

Before we dive in, here's a quick overview:

- **[Term 1]**: [Plain English explanation]
- **[Term 2]**: [Another clear explanation]
- **[Term 3]**: [One more explanation]

Don't worry if this doesn't all make sense yet - it will become clearer as we
work through the example.

### Create the Project Structure

1. **Create a new directory** for your project:

   ```bash
   mkdir my-first-project
   cd my-first-project
   ```

2. **Initialize** a new [Project] configuration:

   ```bash
   project init
   ```

   This creates a basic structure:

   ```
   my-first-project/
   ├── config.yaml     # Your project configuration
   ├── src/           # Your source files go here
   └── README.md      # Project documentation
   ```

3. **Open `config.yaml`** in your favorite editor and update it:

   ```yaml
   # Before
   name: my-project
   version: 0.1.0

   # After
   name: my-first-project
   version: 0.1.0
   description: Learning [Project] with the tutorial
   author: Your Name
   ```

### Write Your First [Component]

Create a new file `src/hello.ext`:

```language
// This is your first [component]
// It demonstrates [what it shows]

[actual code here with line numbers or clear structure]
```

Let's break down what this does:

- **Line 1-2**: Comments explaining the purpose
- **Line 4**: [Explanation of key line]
- **Line 5**: [Explanation of another important part]

### Run Your Code

Time to see it in action:

```bash
project run src/hello.ext
```

You should see:

```
[Expected output]
Success! Your first [component] is working.
```

🎉 **Congratulations!** You just created and ran your first [Project] program!

<details>
<summary>😕 Not working as expected?</summary>

**Common issues**:

1. **Error: file not found**
   - Make sure you're in the right directory: `pwd` should show
     `.../my-first-project`
   - Check the file exists: `ls src/`

2. **Error: syntax error**
   - Double-check your code matches the example exactly
   - [Language-specific] common issues

3. **No output**
   - Some systems buffer output; try adding a newline at the end
   - Check you saved the file before running

</details>

## Step 3: Make It Interactive

Let's enhance our program to do something more interesting.

### Add User Input

Modify your `src/hello.ext` file:

```language
[Updated code with input handling]
```

**What's new:**

- [Explanation of new lines]
- [Why this approach]

### Test the Interaction

Run it again:

```bash
project run src/hello.ext
```

Try entering different inputs:

```
Enter your name: Alice
Hello, Alice! Welcome to [Project].
```

✅ **Checkpoint**: Your program can now interact with users!

## Step 4: Add Real Functionality

Now let's make it do something useful.

### Create a New Module

Create `src/calculator.ext`:

```language
[Calculator code example]
```

### Import and Use the Module

Update your main file:

```language
[Updated main file using the module]
```

### See It in Action

```bash
project run src/hello.ext
```

Play with different operations:

```
Enter first number: 10
Enter second number: 5
Choose operation (+, -, *, /): +
Result: 15
```

## What You've Learned

You've successfully:

- ✅ Installed [Project] and verified it works
- ✅ Created your first [component]
- ✅ Added user interaction
- ✅ Built a modular program with multiple files
- ✅ Learned about [key concept 1], [key concept 2], and [key concept 3]

### Quick Reference

Here are the commands you learned:

| Command         | What it does           |
| --------------- | ---------------------- |
| `project init`  | Create a new project   |
| `project run`   | Execute your code      |
| `project build` | Compile for production |
| `project test`  | Run tests              |

### Key Concepts

- **[Concept 1]**: [One-line summary]
- **[Concept 2]**: [One-line summary]
- **[Concept 3]**: [One-line summary]

## What's Next?

You're ready to explore more:

1. **[How-to: Connect to a Database]** - Add persistence to your project
2. **[How-to: Deploy Your Project]** - Share your creation with the world
3. **[Understanding [Core Concept]]** - Deep dive into how [Project] works
4. **[Build a Real App Tutorial]** - Create something production-ready

### Join the Community

- 💬 **[Discord/Slack/Forum]** - Get help and share what you build
- 🐛 **[Issue Tracker]** - Report bugs or request features
- 📚 **[Documentation]** - Explore all features in detail
- 🌟 **[GitHub]** - Star the project and contribute

Remember: everyone started where you are now. Don't hesitate to ask questions!

---

## Contribute to This Tutorial

Found something confusing? Have a better explanation? We'd love your help!

- 📝 [Edit this page](github-edit-link)
- 💬 [Discuss improvements](discussion-link)
- 🐛 [Report issues](issue-link)
