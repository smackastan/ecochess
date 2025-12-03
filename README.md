# Eco Chess

An ecological approach to chess - playing constraint-based mini games that focus on specific pieces and winning conditions.

## Current Game: Pawn Race

The first variant removes every piece except for the pawns. Two players race to promote a pawn first to win!

**Rules:**
- Only pawns remain on the board
- Standard pawn movement (1 or 2 squares forward from starting position, diagonal captures)
- First player to promote a pawn to the opposite end wins
- Turn-based gameplay with move validation

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play!

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main game page
│   ├── autotest/       # Automated testing page
│   └── test/           # Test page with react-chessboard
├── components/         # React components
│   ├── ChessGame.tsx   # Main game component
│   └── SimpleChessboard.tsx  # Custom chessboard UI
├── contexts/          # React context providers
│   └── GameContext.tsx # Game state management
├── lib/               # Core game logic
│   └── ecoChess.ts    # Game engine and variants
└── types/             # TypeScript type definitions
    └── game.ts        # Game-related types
```

## Features

-  Turn-based gameplay
-  Move validation for pawn moves
-  Win condition detection (pawn promotion)
-  Move history tracking
-  Clean, responsive UI
-  TypeScript for type safety

## Future Game Variants

The architecture supports adding more constraint-based chess variants:
- Knights only
- Bishops vs Knights
- King and Pawns endgame
- And more creative constraints!

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Chess Logic:** chess.js
- **State Management:** React Context + useReducer

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide for developers
- [GAME_STATUS.md](GAME_STATUS.md) - Current game status and features
- [SOLUTION.md](SOLUTION.md) - Technical solutions and fixes

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
