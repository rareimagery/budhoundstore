# Installing UI UX Pro Max Skill — Bud Hound / @RareImagery Project

## Prerequisites

### 1. Node.js & npm
```bash
# Check if installed
node --version
npm --version

# macOS (if needed)
brew install node
```

### 2. Python 3.x
The design system search engine requires Python 3.

```bash
# Check if installed
python3 --version

# macOS (if needed)
brew install python3
```

### 3. Claude Code (Anthropic CLI)
UI UX Pro Max is an AI skill that runs inside Claude Code — Anthropic's command-line coding tool.

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

> If you haven't used Claude Code before, you'll need to authenticate with your Anthropic account on first run.

---

## Installation

### Option A: CLI Installer (Recommended)

```bash
# Install the uipro CLI globally
npm install -g uipro-cli

# Navigate to your project root
cd /path/to/budhound-rareimagery

# Install the skill for Claude Code
uipro init --ai claude
```

This creates the following structure in your project:

```
your-project/
└── .claude/
    └── skills/
        └── ui-ux-pro-max/
            ├── data/          # Style, color, typography, and reasoning databases
            ├── scripts/       # Python search engine & design system generator
            └── ...
```

### Option B: Claude Code Plugin Marketplace

If you prefer to install directly from within Claude Code:

```bash
# Open Claude Code in your project
cd /path/to/budhound-rareimagery
claude

# Then run these commands inside Claude Code
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

---

## Verify Installation

```bash
# Check the skill folder exists
ls -la .claude/skills/ui-ux-pro-max/

# Test the design system generator
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "e-commerce streetwear" --design-system -p "Bud Hound"
```

---

## Usage with Bud Hound Branding

Once installed, start Claude Code in your project directory and prompt naturally. The skill activates automatically for any UI/UX request.

### Example Prompts

```
Build a landing page for Bud Hound e-commerce with purple (#7B2D8E) and gold (#D4AF37) branding

Create a product page for Bud Hound ballcaps with "Be Rare" messaging

Design a storefront hero section featuring Bud Hound imagery with dark mode
```

### Generate & Persist a Design System

Lock in your Bud Hound brand design system so it stays consistent across pages:

```bash
# Generate and save a master design system
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "streetwear e-commerce dog brand" \
  --design-system --persist -p "Bud Hound"

# Create page-specific overrides
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "product showcase" \
  --design-system --persist -p "Bud Hound" --page "product"

python3 .claude/skills/ui-ux-pro-max/scripts/search.py "merchandise storefront" \
  --design-system --persist -p "Bud Hound" --page "storefront"
```

This creates:

```
design-system/
├── MASTER.md              # Global brand rules (colors, typography, spacing)
└── pages/
    ├── product.md         # Product page overrides
    └── storefront.md      # Storefront page overrides
```

### Using the Persisted Design System

When working on a specific page, prompt Claude Code like this:

```
I am building the Storefront page. Please read design-system/MASTER.md.
Also check if design-system/pages/storefront.md exists.
If the page file exists, prioritize its rules.
Now generate the React component with Bud Hound purple/gold branding.
```

---

## Updating

```bash
# Check for new versions
uipro versions

# Update to latest
uipro update
```

---

## Useful Links

- **Repo:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Website:** https://uupm.cc
- **npm CLI:** https://www.npmjs.com/package/uipro-cli
- **Claude Code Docs:** https://docs.anthropic.com/en/docs/claude-code
