# Eco Chess Architecture

## Overview
This is a scalable TypeScript-based chess variant application built with Next.js, designed for "ecological" constraint-based chess games. The first variant is **Pawn Race** - only pawns, first to promote wins!

## 🎯 Your Questions Answered

### Q: Is chess.js okay with removing the king and custom win conditions?
**A: YES!** chess.js is very flexible:
- It handles move validation and piece logic
- We can use `chess.clear()` to start with an empty board
- We can `chess.put()` only the pieces we want
- **Win conditions are separate** - we check them ourselves
- The library doesn't enforce checkmate; it just validates legal moves

### Q: Easy but scalable approach?
**A: Layered Architecture** - here's what we built:

## 📁 Architecture Layers

### 1. **Type Layer** (`types/game.ts`)
- Defines all game types: `GamePiece`, `GameState`, `GameVariant`
- **Scalable**: Add new variants by implementing `GameVariant` interface
- Type-safe throughout the application

### 2. **Engine Layer** (`lib/ecoChess.ts`)
- `EcoChessGame` class - core game engine
- Uses chess.js for move validation
- Modular variant system via `GameVariant` interface
- **Current variant**: `pawnRaceVariant`
- **Future variants**: Just create new `GameVariant` objects!

### 3. **State Management** (`contexts/GameContext.tsx`)
- React Context + useReducer for state
- **Pass-and-play ready**: Works locally right now
- **Online-ready**: Easy to swap with:
  - Socket.io for real-time multiplayer
  - Firebase/Supabase for managed solution
  - WebRTC for peer-to-peer

### 4. **UI Layer** (`components/ChessGame.tsx`)
- Uses `react-chessboard` for rendering
- Clean separation from game logic
- Beautiful Tailwind CSS styling

## 🎮 Current Features

### Pawn Race Variant
- ✅ Only pawns on the board
- ✅ Standard pawn movement (1 square, 2 on first move)
- ✅ Diagonal captures
- ✅ Win condition: First to reach promotion rank
- ✅ Move history tracking
- ✅ Visual status indicators
- ✅ Reset/Play again functionality

## 🚀 Adding Online Multiplayer (Future)

The architecture is designed for easy online implementation:

### Option 1: Socket.io (Recommended for Real-time)
```typescript
// In GameContext.tsx
import { io } from 'socket.io-client';

const socket = io('your-server-url');

function makeMove(from: string, to: string) {
  // Emit move to server
  socket.emit('move', { from, to, gameId });
  
  // Server validates and broadcasts to both players
}

// Listen for opponent moves
socket.on('opponentMove', (move) => {
  dispatch({ type: 'MAKE_MOVE', ...move });
});
```

### Option 2: Firebase Realtime Database
```typescript
// Simple realtime sync
const gameRef = ref(database, `games/${gameId}`);
onValue(gameRef, (snapshot) => {
  const gameState = snapshot.val();
  dispatch({ type: 'UPDATE_STATE', gameState });
});
```

### Option 3: Next.js API Routes + Polling
```typescript
// app/api/games/[id]/move/route.ts
export async function POST(request: Request) {
  const { from, to } = await request.json();
  // Validate move server-side
  // Update database
  // Return new game state
}
```

## 🔧 Adding New Variants

Create a new variant in `lib/ecoChess.ts`:

```typescript
export const kingOfTheHillVariant: GameVariant = {
  name: "King of the Hill",
  description: "Get your king to the center 4 squares to win!",
  initialBoard: /* standard setup */,
  allowedPieces: ['p', 'r', 'n', 'b', 'q', 'k'],
  winCondition: (gameState: GameState) => {
    // Check if king is in center d4, d5, e4, or e5
    const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
    // ... implementation
  },
  isValidMove: /* use chess.js */
};
```

Then pass it to `EcoChessGame`:
```typescript
const game = new EcoChessGame(kingOfTheHillVariant);
```

## 🏗️ Project Structure

```
/app
  page.tsx              # Main entry point
/components
  ChessGame.tsx         # UI component for the game
/contexts
  GameContext.tsx       # State management
/lib
  ecoChess.ts          # Game engine & variants
/types
  game.ts              # TypeScript type definitions
```

## 🎨 Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **chess.js** - Chess logic and move validation
- **react-chessboard** - Visual board component

## 📝 Key Design Decisions

1. **Separation of Concerns**: Game logic is separate from React components
2. **Chess.js Integration**: Leverages battle-tested chess logic
3. **Variant System**: Pluggable game variants
4. **Context API**: Simple state management, easily replaced with online solution
5. **Type Safety**: Full TypeScript coverage

## 🔮 Future Enhancements

- [ ] Online multiplayer (Socket.io or Firebase)
- [ ] Game rooms/lobbies
- [ ] Multiple simultaneous variants
- [ ] AI opponents (Stockfish.js integration)
- [ ] Player accounts and ratings
- [ ] Tournament system
- [ ] More variants:
  - Knights Only
  - Rooks vs Bishops
  - Atomic Chess
  - Racing Kings
  - Horde Chess

## 🎯 Why This Approach Works

1. **chess.js is flexible** - Doesn't force traditional chess rules
2. **Modular design** - Add variants without touching existing code
3. **Online-ready** - State management designed for easy network sync
4. **Type-safe** - Catch bugs at compile time
5. **React best practices** - Context API, hooks, component composition

## 🚦 Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and start playing!

## 💡 Tips for Development

- Test new variants thoroughly with edge cases
- Keep game logic in `lib/` separate from UI
- Use TypeScript types to prevent bugs
- Consider server-side move validation for online play
- Profile performance with many pieces/moves
