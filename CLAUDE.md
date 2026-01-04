# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build for production (runs tsc + vite build)
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests

# Testing
npm run test -- --ui           # Run tests with UI
npm run test -- path/to/file   # Run specific test file
```

## Architecture Overview

### State Management Pattern

The application uses Zustand for state management with a **single centralized store** at `src/store/gameStore.ts`. All game state mutations flow through store actions. This is critical:

- **Never mutate game state directly** - always use store actions
- The store owns: `gameState`, `selectedTile`, `showLineCompleteAnimation`
- Key actions: `initializeGame`, `addPendingPlacement`, `commitTurn`
- The store coordinates between models, validators, and scorers

### Separation of Concerns

**Engine Layer** (`src/engine/`): Pure TypeScript logic with zero React dependencies
- `validation/`: Validates moves according to tile-matching rules
- `scoring/`: Calculates points for tile placements
- `ai/`: Generates and ranks AI moves

**Models Layer** (`src/models/`): Data factories and transformations
- `TileFactory`: Creates tile bag, draws tiles
- `GameInitializer`: Sets up new games
- `BoardModel`: Pure functions for board operations (position keys, adjacency, line finding)

**Components Layer**: React UI consuming the store

This separation enables testing game logic independently of UI.

### Board State Model

The board uses a **Map-based storage** for efficient sparse grid representation:

```typescript
board: {
  tiles: Map<string, PlacedTile>,  // Key: "row,col"
  bounds: BoardBounds               // Tracks min/max occupied positions
}
```

**Critical functions** in `BoardModel`:
- `positionToKey()` / `keyToPosition()`: Convert between positions and Map keys
- `getTileAt()`: Retrieve tile at position
- `findLineExtent()`: Find continuous line of tiles in a direction
- `getAdjacentPositions()`: Get all orthogonally adjacent positions

Always use `BoardModel` utilities when working with board positions - never manually create position keys.

### Validation Architecture

Validation follows a **layered approach** orchestrated by `PlacementValidator`:

1. **Position conflicts**: Check if position already occupied
2. **First move special case**: Must include (0, 0)
3. **Adjacency validation**: All pending placements form single line
4. **Board adjacency**: At least one placement adjacent to existing tiles
5. **Line validation**: For each placement, validate horizontal + vertical lines

The validator creates a **temporary board** with pending placements applied, then validates all affected lines. This ensures cross-validation without mutating state.

**Key insight**: A single tile placement can affect two lines (horizontal and vertical), both must validate.

### Scoring System

Scoring is calculated by `ScoreCalculator.calculateScore()`:

- Finds all affected lines (lines that include new tiles)
- Scores each line: 1 point per tile
- Detects full lines: 6-tile lines get +6 bonus points
- Returns `{ totalPoints, hasFullLine, lines }`

The scoring happens **after validation** but **before committing** to the board.

### Pending Placements Pattern

Game uses a **staging area** for tile placements:

```typescript
pendingPlacements: PendingPlacement[]  // Tiles not yet committed
```

**Workflow**:
1. User drags tile from hand → `addPendingPlacement()`
2. Tile removed from hand, added to `pendingPlacements`
3. Validation runs on `pendingPlacements` + current board
4. User clicks "Confirm Move" → `commitTurn()`
5. Tiles move from `pendingPlacements` to `board.tiles`
6. User can remove pending tiles → `removePendingPlacement()` returns tile to hand

This pattern enables:
- Real-time validation feedback
- Easy cancellation (return tiles to hand)
- Multi-tile turn planning

### AI Implementation

The AI uses a **greedy algorithm** in `greedyAI.ts`:

1. `MoveGenerator.generateValidMoves()`: Generates all valid single-tile placements
2. For each tile in hand, tests all adjacent positions
3. Validates placement and calculates score
4. Ranks moves by score (descending)
5. Selects highest-scoring move

**Current limitation**: AI only places one tile per turn. Multi-tile placements would require exponentially more move generation.

The AI executes with simulated "thinking time" via `executeAITurn()`.

### Component Patterns

**Drag-and-Drop**: Uses `react-dnd` with HTML5 backend
- `DraggableTile`: Source (tiles in hand)
- `BoardCell`: Drop target (board positions)
- Drop validation via `getValidPositions()` which returns only valid cells

**CSS Modules**: All components use scoped styles
- Convention: `ComponentName.module.css`
- Import as: `import styles from './Component.module.css'`

**Visual Feedback**:
- Green cells: valid drop targets
- Yellow tiles: pending placements
- Red feedback: invalid moves

### Type System

Core types in `src/types/`:

```typescript
Tile              // Unplaced tile (id, color, shape)
PlacedTile        // Tile on board (extends Tile + position)
PendingPlacement  // Staging { tile, position }
BoardPosition     // { row: number, col: number }
Player            // Player state including hand
GameState         // Root state object
```

**Important**: Use `PlacedTile` for tiles on the board, `Tile` for tiles in hand or bag.

### Game Persistence

The `useGamePersistence` hook auto-saves to localStorage after each turn:

- Saves complete `GameState` as JSON
- Restores on app load
- Handles corrupted saves gracefully
- Key: `tileline_save`

When modifying `GameState`, ensure all properties are JSON-serializable.

## Game Rules Implementation

### Line Validation Rules

A valid line must satisfy **all of these**:
1. All tiles in same row OR same column (not both)
2. Share exactly one attribute: all same color OR all same shape (never both)
3. No duplicate tiles (same color+shape)
4. Maximum 6 tiles (full line limit)
5. No gaps (tiles must be contiguous)

These rules are enforced in `LineValidator.validateLine()`.

### First Move Special Case

The first move of the game has special rules:
- Must include position (0, 0)
- If multiple tiles, must form valid line
- Validated in `PlacementValidator.validateFirstMove()`

### Turn Constraints

Within a single turn:
- All placements must form a single continuous line
- Cannot place tiles in different rows AND different columns
- This is enforced by `getValidPositions()` which constrains valid cells after first placement

## Common Development Patterns

### Adding New Validation Rules

1. Add validation logic to appropriate validator in `src/engine/validation/`
2. Return `ValidationResult` with `{ isValid, error? }`
3. Integrate into `PlacementValidator.validatePlacement()`
4. Validation should be pure functions (no side effects)

### Adding New Scoring Rules

1. Modify `LineScorer` or `ScoreCalculator` in `src/engine/scoring/`
2. Scoring functions should be pure (same input → same output)
3. Test with various board configurations

### Extending AI Behavior

To improve AI:
1. `MoveGenerator`: Modify `generateValidMoves()` to consider multi-tile placements
2. `greedyAI`: Change ranking heuristic (currently just total points)
3. Consider: blocking opponent, board position, tile count remaining

### Adding New Components

1. Create component directory with `.tsx` and `.module.css`
2. Import types from `src/types`
3. Access state via `useGameStore` hooks
4. Keep components focused - extract complex logic to hooks

## Testing Strategy

Currently tests are configured with Vitest but no test files exist in src/.

When adding tests:
- Test engine logic (validators, scorers) independently
- Mock board state for validation tests
- Use fixtures for complex game states
- AI move generation should be deterministic for testing

When validating UI changes use the Playwright MCP tool to open a browser to validate UI changes before presenting the result to the user.

## Known Implementation Notes

- The board is an **infinite grid** centered at (0, 0). Negative coordinates are valid.
- Map keys use string format `"row,col"` for performance
- The game doesn't implement tile exchange (optional rule when no moves available)
- AI only makes single-tile moves
- No undo/redo functionality
