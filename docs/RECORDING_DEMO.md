# Recording a Demo GIF

This guide explains how to create the demo GIF for the README.

## Prerequisites

Install the required tools:

```bash
# Install asciinema (terminal recorder)
# macOS
brew install asciinema

# Ubuntu/Debian
sudo apt install asciinema

# Or via pip
pip install asciinema

# Install agg (asciinema gif generator)
# macOS
brew install agg

# Or from source
cargo install --git https://github.com/asciinema/agg
```

## Recording Steps

### 1. Prepare a Clean Directory

```bash
mkdir /tmp/demo-project
cd /tmp/demo-project
```

### 2. Start Recording

```bash
asciinema rec demo.cast --cols 100 --rows 30
```

### 3. Run the Demo Commands

Once recording starts, type these commands (with appropriate pauses):

```bash
# Show the command
npx create-universal-ai-context@latest

# Walk through the prompts:
# - Project name: my-awesome-app
# - Technology stack: Select "Auto-detect" or a preset
# - Features: Keep defaults (RPI, Agents, Validation)
# - Install plugin: Yes

# Show the result
tree .ai-context -L 2

# Show AI_CONTEXT.md
head -50 AI_CONTEXT.md
```

### 4. Stop Recording

Press `Ctrl+D` or type `exit` to stop recording.

### 5. Convert to GIF

```bash
agg demo.cast demo.gif --cols 100 --rows 30 --font-size 14
```

## Recommended Settings

For the best looking GIF:

```bash
agg demo.cast demo.gif \
  --cols 100 \
  --rows 30 \
  --font-size 14 \
  --theme monokai \
  --speed 1.5
```

## Alternative: Using Terminalizer

If you prefer terminalizer:

```bash
# Install
npm install -g terminalizer

# Record
terminalizer record demo

# Generate GIF
terminalizer render demo -o demo.gif
```

## GIF Optimization

Optimize the GIF size using gifsicle:

```bash
# Install gifsicle
brew install gifsicle  # macOS
sudo apt install gifsicle  # Ubuntu

# Optimize
gifsicle -O3 --colors 128 demo.gif -o demo-optimized.gif
```

## Placement

Once created, place the GIF at:

```
packages/create-ai-context/docs/demo.gif
```

Then update the README to reference it:

```markdown
![Demo](docs/demo.gif)
```

## Tips

1. **Keep it short**: Aim for 30-45 seconds
2. **Use pauses**: Let viewers read the prompts
3. **Clean terminal**: Start with a fresh terminal window
4. **Consistent speed**: Don't rush, but don't pause too long
5. **Show the result**: Always show the final file structure
