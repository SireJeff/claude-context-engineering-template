/**
 * Interactive prompts for create-claude-context
 *
 * Uses enquirer for beautiful, user-friendly prompts
 */

const { prompt } = require('enquirer');
const path = require('path');
const chalk = require('chalk');
const { detectTechStack } = require('./detector');

// Available tech stack presets
const PRESETS = {
  'python-fastapi': {
    name: 'Python + FastAPI + PostgreSQL',
    stack: 'Python, FastAPI, PostgreSQL',
    commands: {
      install: 'pip install -r requirements.txt',
      dev: 'uvicorn main:app --reload',
      test: 'pytest',
      migrate: 'alembic upgrade head'
    }
  },
  'node-express': {
    name: 'Node.js + Express + MongoDB',
    stack: 'Node.js, Express, MongoDB',
    commands: {
      install: 'npm install',
      dev: 'npm run dev',
      test: 'npm test',
      migrate: 'npm run migrate'
    }
  },
  'typescript-nextjs': {
    name: 'TypeScript + Next.js + Prisma',
    stack: 'TypeScript, Next.js, Prisma, PostgreSQL',
    commands: {
      install: 'npm install',
      dev: 'npm run dev',
      test: 'npm test',
      migrate: 'npx prisma migrate dev'
    }
  },
  'go-gin': {
    name: 'Go + Gin + PostgreSQL',
    stack: 'Go, Gin, PostgreSQL',
    commands: {
      install: 'go mod download',
      dev: 'go run main.go',
      test: 'go test ./...',
      migrate: 'migrate -path migrations -database $DATABASE_URL up'
    }
  },
  'rust-actix': {
    name: 'Rust + Actix + SQLx',
    stack: 'Rust, Actix-web, SQLx, PostgreSQL',
    commands: {
      install: 'cargo build',
      dev: 'cargo run',
      test: 'cargo test',
      migrate: 'sqlx migrate run'
    }
  },
  'ruby-rails': {
    name: 'Ruby + Rails + PostgreSQL',
    stack: 'Ruby, Rails, PostgreSQL',
    commands: {
      install: 'bundle install',
      dev: 'rails server',
      test: 'rails test',
      migrate: 'rails db:migrate'
    }
  }
};

/**
 * Run interactive prompts
 */
async function runPrompts(targetDir, presetName = null) {
  // Detect tech stack for auto-suggestion
  const detected = await detectTechStack(targetDir);

  console.log(chalk.gray('\nLet\'s set up context engineering for your project.\n'));

  const answers = await prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      initial: path.basename(targetDir),
      validate: (value) => {
        if (!value.trim()) return 'Project name is required';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'select',
      name: 'techStackChoice',
      message: 'Technology stack:',
      choices: [
        {
          name: 'auto',
          message: detected.summary
            ? `Confirm: ${detected.summary}`
            : 'Auto-detect from project files'
        },
        { name: 'preset', message: 'Select from presets' },
        { name: 'manual', message: 'Enter manually' },
        { name: 'skip', message: 'Skip (use generic template)' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'preset',
      message: 'Select a tech stack preset:',
      choices: Object.entries(PRESETS).map(([key, value]) => ({
        name: key,
        message: value.name
      })),
      skip() {
        return this.state.answers.techStackChoice !== 'preset';
      }
    },
    {
      type: 'input',
      name: 'manualStack',
      message: 'Enter your tech stack (e.g., "Python, Django, PostgreSQL"):',
      skip() {
        return this.state.answers.techStackChoice !== 'manual';
      }
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Features to include:',
      choices: [
        { name: 'rpi', message: 'RPI Workflow (Research-Plan-Implement)', value: true },
        { name: 'agents', message: 'Specialized Agents (6 agents)', value: true },
        { name: 'validation', message: 'Validation Commands', value: true },
        { name: 'ci', message: 'CI/CD Templates', value: false },
        { name: 'team', message: 'Team Collaboration', value: false },
        { name: 'analytics', message: 'Analytics Dashboard', value: false }
      ],
      initial: ['rpi', 'agents', 'validation']
    },
    {
      type: 'confirm',
      name: 'installPlugin',
      message: 'Install Claude Code plugin for ongoing commands?',
      initial: true
    }
  ]);

  // Process tech stack choice
  let techStack = detected;
  if (answers.techStackChoice === 'preset' && answers.preset) {
    const preset = PRESETS[answers.preset];
    techStack = {
      ...techStack,
      summary: preset.stack,
      preset: answers.preset,
      commands: preset.commands
    };
  } else if (answers.techStackChoice === 'manual' && answers.manualStack) {
    techStack = {
      ...techStack,
      summary: answers.manualStack,
      preset: null
    };
  }

  return {
    projectName: answers.projectName,
    techStack,
    features: {
      rpi: answers.features.includes('rpi'),
      agents: answers.features.includes('agents'),
      validation: answers.features.includes('validation'),
      ci: answers.features.includes('ci'),
      team: answers.features.includes('team'),
      analytics: answers.features.includes('analytics')
    },
    installPlugin: answers.installPlugin
  };
}

/**
 * Get default configuration (for --yes flag)
 */
async function getDefaults(targetDir, presetName = null) {
  const detected = await detectTechStack(targetDir);

  let techStack = detected;
  if (presetName && PRESETS[presetName]) {
    const preset = PRESETS[presetName];
    techStack = {
      ...techStack,
      summary: preset.stack,
      preset: presetName,
      commands: preset.commands
    };
  }

  return {
    projectName: path.basename(targetDir),
    techStack,
    features: {
      rpi: true,
      agents: true,
      validation: true,
      ci: false,
      team: false,
      analytics: false
    },
    installPlugin: true
  };
}

module.exports = {
  runPrompts,
  getDefaults,
  PRESETS
};
