# TileLine

A tile-matching strategy game built with React and TypeScript.

> **Note**: TileLine is an independent implementation inspired by the tile-matching mechanics of Qwirkle by Susan McKinley Ross, published by MindWare. This is a personal project created for educational purposes and is not affiliated with or endorsed by MindWare. Qwirkle is a registered trademark of MindWare.

## 🎮 Play Now

**[Play TileLine →](https://tileline.vercel.app)**

Experience the game live in your browser. No installation required!

---

## 🎮 Features

### Complete Gameplay
- **Full Game Rules**: All tile-matching rules implemented and enforced
- **2-4 Players**: Support for 2 to 4 players in any combination of human and AI
- **Drag-and-Drop**: Intuitive tile placement with visual feedback
- **Automatic Scoring**: Real-time score calculation with +6 bonus for completing 6-tile lines
- **AI Opponents**: Greedy algorithm AI that plays strategically

### User Experience
- **Visual Feedback**: Green highlights for valid drops, red for invalid, yellow for pending
- **Click to Remove**: Tap pending tiles to return them to your hand
- **Line Complete Animation**: Celebration animation when completing a 6-tile line
- **Game Over Screen**: Beautiful modal showing winner and final scores
- **Easy Restart**: Prominent "New Game" button in header with confirmation
- **Placement Hints Toggle**: Optional visual hints showing where tiles can be placed

### Persistence
- **Auto-Save**: Game automatically saves after each turn to localStorage
- **Resume Game**: Continue your game after closing the browser
- **Smart Recovery**: Handles corrupted saves gracefully

### Design
- **Responsive**: Works on desktop and mobile devices
- **Authentic Tiles**: 6 colors × 6 shapes rendered with SVG
- **Clean UI**: Modern, intuitive interface with CSS Modules
- **Smooth Animations**: Polished transitions and feedback

## 🚀 Getting Started

### Prerequisites
- Node.js v20.18.1 or later
- npm 11.6.0 or later

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎯 How to Play

1. **Setup**: Choose number of players (2-4) and configure each as Human or AI
2. **First Turn**: Place tiles to include the center position (0,0)
3. **Place Tiles**: Drag tiles from your hand to the board
   - All tiles must form a single line (horizontal or vertical)
   - Line must share either same color OR same shape (not both)
   - No duplicate tiles in a line
   - Maximum 6 tiles per line
4. **Confirm Move**: Click "Confirm Move" when ready
5. **Scoring**:
   - 1 point per tile in each line created/extended
   - +6 bonus for completing a full line (6 tiles)
6. **Win**: Highest score when all tiles are played

## 🏗️ Architecture

### Tech Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **react-dnd** for drag-and-drop
- **CSS Modules** for styling

### Project Structure
```
src/
├── types/              # TypeScript type definitions
├── models/             # Data factories (TileFactory, GameInitializer)
├── engine/             # Pure game logic
│   ├── validation/     # Move validation
│   ├── scoring/        # Score calculation
│   └── ai/            # AI move generation
├── store/              # Zustand state management
├── components/         # React components
├── hooks/              # Custom React hooks
└── utils/              # Utilities (localStorage)
```

### Key Design Decisions

**Separation of Concerns**
- Pure game logic in `engine/` (no React dependencies)
- UI components consume logic through store
- Easy to test and maintain

**State Management**
- Zustand for simplicity and TypeScript support
- Single source of truth for game state
- Automatic persistence integration

**Drag-and-Drop**
- react-dnd for cross-browser compatibility
- Visual feedback during drag operations
- Touch-friendly for mobile devices

**AI Implementation**
- Greedy algorithm evaluating all valid single-tile moves
- Selects highest-scoring move
- Easily extensible to multi-tile combinations

## 📝 Game Rules Implementation

### Validation
- **placementValidator.ts**: Orchestrates all validation checks
- **lineValidator.ts**: Validates tile-matching line rules (color/shape constraints)
- **adjacencyValidator.ts**: Ensures tiles form continuous lines

### Scoring
- **scoreCalculator.ts**: Calculates points for all affected lines
- **lineScorer.ts**: Scores individual lines with full line bonus

### AI
- **moveGenerator.ts**: Generates all valid placement positions
- **greedyAI.ts**: Selects best move using scoring heuristic

## 🎨 Tile Colors & Shapes

**Colors**: Red, Orange, Yellow, Green, Blue, Purple
**Shapes**: Circle, Square, Diamond, Star, Cross, Clover

All rendered as scalable SVG graphics.

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

### Lint Code
```bash
npm run lint
```

## 📦 Dependencies

### Runtime
- react & react-dom: ^18.2.0
- react-dnd & react-dnd-html5-backend: ^16.0.1
- zustand: ^4.5.0
- uuid: ^9.0.1
- clsx: ^2.1.0

### Development
- @vitejs/plugin-react: ^4.2.1
- typescript: ^5.2.2
- vite: ^5.0.8
- vitest: ^1.1.0

## 🎮 Gameplay Tips

- **Start Strong**: Place multiple tiles on first turn for more points
- **Full Line Bonus**: Focus on completing 6-tile lines for +6 points
- **Strategic Placement**: Consider future move possibilities
- **Block Opponents**: Sometimes it's worth scoring less to limit AI options
- **Count Tiles**: Keep track of which tiles have been played

## 🐛 Known Limitations

- AI uses single-tile placement only (can be extended to multi-tile)
- No undo/redo functionality
- No network multiplayer (local only)
- No tile exchange mechanism (optional rule when no valid moves)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

The core game mechanics are inspired by Qwirkle, designed by Susan McKinley Ross and published by MindWare. This is an independent implementation created for educational purposes and is not affiliated with, endorsed by, or sponsored by MindWare.
