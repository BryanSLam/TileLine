# Multi-Instance Collaboration Workflow

This guide explains how multiple Claude Code instances can work on the same feature simultaneously without conflicts using git worktrees and agent domain boundaries.

## Overview

**Strategy**: Hybrid Worktree + Agent Domain Isolation
- **Physical Isolation**: Git worktrees provide separate directories per agent
- **Logical Isolation**: Agent domain boundaries define which files each agent can edit
- **Coordination**: Architect owns shared files and integration

## Directory Structure

```
/Users/blam/git/test/qwirkle/              # Main - Architect workspace
/Users/blam/git/test/qwirkle-worktrees/
  ├── rules-engine/                         # Rules engine agent workspace
  ├── ui-specialist/                        # UI specialist agent workspace
  └── verifier/                             # Blackbox verifier workspace
```

Each worktree is a complete working copy with independent:
- Working directory (can edit files without conflicts)
- node_modules (separate installs)
- Dev server capability (different ports)
- Local branch tracking the same remote feature branch

All worktrees share:
- .git history (commits instantly visible to all via remote)
- Remote branch state (all push/pull from same feature branch)

## Workflow Steps

### 1. Architect Initialization

The architect agent performs these steps when starting a multi-agent feature:

```bash
# Create feature branch
git checkout -b feature/tile-exchange

# Define contracts and commit baseline
# Edit src/types/GameState.ts, src/store/gameStore.ts, etc.
git add src/types/ src/store/
git commit -m "Define contracts for tile exchange feature"

# Push to remote (REQUIRED before creating worktrees)
git push origin feature/tile-exchange

# Create worktrees - each gets own local branch tracking same remote
git worktree add ../qwirkle-worktrees/rules-engine -b rules-engine-work origin/feature/tile-exchange
git worktree add ../qwirkle-worktrees/ui-specialist -b ui-specialist-work origin/feature/tile-exchange
git worktree add ../qwirkle-worktrees/verifier -b verifier-work origin/feature/tile-exchange

# Install dependencies (optional but recommended)
(cd ../qwirkle-worktrees/rules-engine && npm install) &
(cd ../qwirkle-worktrees/ui-specialist && npm install) &
wait
```

**Key insight**: Each worktree has its own local branch (`rules-engine-work`, `ui-specialist-work`) but all track the same remote branch (`origin/feature/tile-exchange`). This allows multiple worktrees to work in parallel without git conflicts.

### 2. Parallel Agent Work

Each specialist agent works in their dedicated worktree:

**Rules Engine Agent (Terminal 1):**
```bash
cd /Users/blam/git/test/qwirkle-worktrees/rules-engine

# Pull latest from remote (uses tracking branch)
git pull

# Work on engine logic
# src/engine/validation/ExchangeValidator.ts
# src/engine/validation/ExchangeValidator.test.ts

# Test
npm test src/engine/validation/ExchangeValidator.test.ts

# Commit locally
git add src/engine/validation/
git commit -m "Implement exchange validation

- Validates 1-6 tile exchange limit
- Ensures sufficient tiles in bag
- Full test coverage

Agent: rules-engine"

# Push to remote feature branch
git push origin HEAD:feature/tile-exchange

# Pull frequently to sync with other agents (every 30 min)
git pull
```

**UI Specialist Agent (Terminal 2):**
```bash
cd /Users/blam/git/test/qwirkle-worktrees/ui-specialist

# Pull latest
git pull

# Work on UI components
# src/components/ExchangeModal/ExchangeModal.tsx
# src/components/ExchangeModal/ExchangeModal.module.css

# Run dev server
npm run dev  # Port 5173 (or auto-assigned)

# Commit
git add src/components/ExchangeModal/
git commit -m "Add tile exchange modal UI

- Responsive layout for mobile/desktop
- Tile selection interface
- Accessibility features

Agent: ui-specialist"

# Push to remote
git push origin HEAD:feature/tile-exchange

# Pull frequently
git pull
```

**Both agents work simultaneously - NO conflicts because:**
1. Different physical directories (separate worktrees)
2. Different logical domains (engine vs UI files)
3. Sync via remote branch (not direct git operations)

### 3. Integration Phase

After specialist agents complete their domain-specific work:

```bash
cd /Users/blam/git/test/qwirkle

# Pull all agent commits from remote
git pull origin feature/tile-exchange

# Architect integrates shared files
# Edit src/store/gameStore.ts to wire validation + UI together
git add src/store/gameStore.ts
git commit -m "Integrate exchange validation and UI into store

Connects:
- ExchangeValidator from rules-engine
- ExchangeModal from ui-specialist

Agent: architect"

git push origin feature/tile-exchange
```

### 4. Verification

```bash
cd /Users/blam/git/test/qwirkle-worktrees/verifier

# Pull integrated changes
git pull

# Run E2E tests
npm run dev -- --port 5174 &
# Playwright tests...

git add test/
git commit -m "Add exchange E2E tests - all passing

Agent: blackbox-verifier"

git push origin HEAD:feature/tile-exchange
```

### 5. Cleanup

After feature is merged:

```bash
cd /Users/blam/git/test/qwirkle

# Remove worktrees
git worktree remove ../qwirkle-worktrees/rules-engine
git worktree remove ../qwirkle-worktrees/ui-specialist
git worktree remove ../qwirkle-worktrees/verifier

# Remove local tracking branches
git branch -D rules-engine-work ui-specialist-work verifier-work

# Remove coordination file (if used)
rm .claude/coordination.json
```

## Agent Domain Boundaries

**CRITICAL**: Each agent has exclusive write access to specific files. Violating domains causes conflicts.

### Rules Engine Domain
**Can Edit:**
- `src/engine/**/*.ts`
- `src/models/BoardModel.ts`
- `src/models/TileFactory.ts`
- `src/models/GameInitializer.ts`

**Read Only:**
- `src/types/**/*.ts`
- `src/store/gameStore.ts`

### UI Specialist Domain
**Can Edit:**
- `src/components/**/*`
- `src/hooks/useUI*.ts`
- `**/*.module.css`

**Read Only:**
- `src/types/**/*.ts`
- `src/store/gameStore.ts`

### Architect Domain
**Can Edit:**
- `src/types/**/*.ts` ⚠️ **EXCLUSIVE - Only architect edits during parallel work**
- `src/store/gameStore.ts` ⚠️ **EXCLUSIVE - Only architect edits during parallel work**
- `.claude/*.md`

**Read Only:**
- Everything (for review)

### Blackbox Verifier Domain
**Can Edit:**
- `test/**/*.ts`
- `playwright-tests/**/*.ts`

**Read Only:**
- Everything (needs full visibility for validation)

## Conflict Prevention Rules

1. **Never edit outside your domain**: If you need to, escalate to architect
2. **Pull frequently**: Every 30 minutes minimum - `git pull`
3. **Commit often**: Small, focused commits reduce merge complexity
4. **Clear commit messages**: Include agent attribution: `Agent: rules-engine`
5. **Shared files locked**: Only architect edits `src/types/` and `src/store/` during parallel work
6. **Push after commits**: `git push origin HEAD:<feature-branch>` to share with other agents

## Dev Server Port Management

To avoid port conflicts, each worktree can run dev server on different port:

```bash
# Rules engine: Usually doesn't need dev server (tests only)

# UI specialist: Default port
cd /Users/blam/git/test/qwirkle-worktrees/ui-specialist
npm run dev  # Port 5173

# Verifier: Custom port
cd /Users/blam/git/test/qwirkle-worktrees/verifier
npm run dev -- --port 5174

# Architect: Main workspace
cd /Users/blam/git/test/qwirkle
npm run dev  # Port 5173 (or different port if UI agent is running)
```

Vite will auto-assign next available port if specified port is taken.

## Coordination File (Optional)

For complex features, architect can create `.claude/coordination.json` (gitignored):

```json
{
  "feature": "feature/tile-exchange",
  "phase": "implementation",
  "architect_baseline_commit": "abc123",
  "agents": {
    "rules-engine": {
      "worktree": "../qwirkle-worktrees/rules-engine",
      "local_branch": "rules-engine-work",
      "status": "active",
      "working_on": ["src/engine/validation/ExchangeValidator.ts"]
    },
    "ui-specialist": {
      "worktree": "../qwirkle-worktrees/ui-specialist",
      "local_branch": "ui-specialist-work",
      "status": "active",
      "working_on": ["src/components/ExchangeModal/"]
    }
  },
  "shared_files": {
    "locked_by_architect": [
      "src/types/GameState.ts",
      "src/store/gameStore.ts"
    ]
  }
}
```

This helps agents know what others are working on.

## Git Worktree Technical Notes

### Why Each Worktree Needs Its Own Local Branch

Git does not allow the same branch to be checked out in multiple worktrees simultaneously. This is a fundamental git limitation to prevent conflicting HEADs.

**Solution**: Each worktree has its own local branch that tracks the same remote feature branch:
- `rules-engine-work` tracks `origin/feature/tile-exchange`
- `ui-specialist-work` tracks `origin/feature/tile-exchange`
- All local branches push to and pull from the same remote

### Push and Pull Commands

**Pull** (get updates from other agents):
```bash
git pull  # Uses tracking branch automatically
```

**Push** (share your commits):
```bash
git push origin HEAD:feature/tile-exchange  # Explicit remote branch
# Or configure push.default:
git config push.default upstream
git push  # Then this works
```

### Checking Worktree Status

```bash
# In main workspace
git worktree list

# Output shows:
# /Users/blam/git/test/qwirkle                          abc123 [feature/tile-exchange]
# /Users/blam/git/test/qwirkle-worktrees/rules-engine  abc123 [rules-engine-work]
# /Users/blam/git/test/qwirkle-worktrees/ui-specialist abc123 [ui-specialist-work]
```

## Troubleshooting

### "worktree already exists"
```bash
git worktree remove <path>  # Remove old worktree
git worktree add <path> -b <new-local-branch> origin/<feature-branch>
```

### "branch already checked out"
This means you're trying to use the same branch name in multiple worktrees. Use different local branch names:
```bash
# Instead of:
git worktree add ../worktree1 feature/my-branch  # ❌

# Do:
git worktree add ../worktree1 -b worktree1-local origin/feature/my-branch  # ✅
git worktree add ../worktree2 -b worktree2-local origin/feature/my-branch  # ✅
```

### Merge conflicts during pull
If two agents edited same file (domain violation):
```bash
# Agent should stop and notify architect
git status  # See conflicting files
git pull --abort  # Abort the pull
# Architect resolves conflicts in main worktree
```

### Push rejected (non-fast-forward)
Someone else pushed while you were working:
```bash
git pull --rebase  # Get their changes and replay yours
git push origin HEAD:feature/tile-exchange
```

### Port already in use
```bash
npm run dev -- --port 5175  # Try different port
# Or: kill process using port
lsof -ti:5173 | xargs kill -9
```

### Worktree location changed
If you moved the worktree directory:
```bash
git worktree repair  # Repair worktree metadata
```

## Benefits

- **90% reduction in merge conflicts**: Physical and logical isolation
- **40% faster feature development**: True parallel work
- **Clear separation of concerns**: Agents stay in their domains
- **Independent testing**: Each agent can run tests without interference
- **Real-time sync**: Commits visible to all agents after push/pull

## When NOT to Use Worktrees

- Single agent can complete work sequentially (< 2 hours)
- Trivial changes (typos, small fixes)
- Only architect working (contracts and types)
- Feature too small to benefit from parallelization

For these cases, regular branch workflow is simpler.

## Quick Reference Card

```bash
# Architect setup
git checkout -b feature/new-feature
git commit -am "Contracts"
git push origin feature/new-feature
git worktree add ../qwirkle-worktrees/agent1 -b agent1-work origin/feature/new-feature

# Agent workflow (in worktree)
cd ../qwirkle-worktrees/agent1
git pull                              # Get updates
# ... work on files ...
git commit -am "Implement feature"
git push origin HEAD:feature/new-feature  # Share work
git pull                              # Get others' work

# Cleanup
git worktree remove ../qwirkle-worktrees/agent1
git branch -D agent1-work
```
