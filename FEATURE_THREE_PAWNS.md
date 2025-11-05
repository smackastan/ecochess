# Feature Branch: Three Pawns Variant

## What Was Added

### ✅ New Game Variant
- **Three Pawns Sprint**: Only the 3 rightmost pawns (f, g, h files) for each player
- Faster, more intense gameplay than the full 8-pawn race
- Same promotion win condition

### ✅ Game Selection Screen
- Beautiful, modern UI with game cards
- Shows difficulty, player count, and estimated time for each variant
- "What is Eco Chess?" informational section
- "Coming Soon" preview for future variants

### ✅ Improved Architecture
- `GameProvider` now accepts a `variant` prop
- Games can be easily switched without page reload
- Back button to return to menu from any game
- Variant name displayed in game header

## Files Changed

1. **`lib/ecoChess.ts`**
   - Added `threePawnsVariant` export
   - Configured 3 pawns on columns 5, 6, 7 (f, g, h files)

2. **`components/GameSelector.tsx`** (NEW)
   - Game selection UI with cards for each variant
   - Information section about Eco Chess concept
   - Responsive grid layout

3. **`contexts/GameContext.tsx`**
   - Added `variant` prop to `GameProvider`
   - Added `variantName` to context API
   - Properly handles variant switching

4. **`app/page.tsx`**
   - State management for selected variant
   - Conditional rendering: GameSelector vs ChessGame
   - Key prop for proper GameProvider remounting

5. **`components/ChessGame.tsx`**
   - Added `onBackToMenu` callback prop
   - Displays variant name in header
   - Back button UI

## How to Test

1. Open http://localhost:3000
2. You should see the game selection screen
3. Click "Pawn Race" to play with all 8 pawns
4. Click "Back to Menu" button
5. Click "Three Pawns Sprint" to play with only 3 pawns
6. Both games should work perfectly!

## Next Steps

### To merge this feature into main:
```bash
# Make sure everything works
git status

# Switch to main branch
git checkout main

# Merge the feature branch
git merge feature/three-pawns-variant

# If you want to push to GitHub (after setting up remote)
git push origin main
```

### To continue development on this branch:
```bash
# You're already on the branch!
# Just keep coding and committing
git add .
git commit -m "Your commit message"
```

### To create another feature branch:
```bash
# Switch to main first
git checkout main

# Create and switch to new branch
git checkout -b feature/your-new-feature
```

## Future Variant Ideas
- Knights Only Battle
- King & Pawns Endgame Trainer
- Bishops vs Knights
- Rook Endgame Mastery
- Queen & Pawns Race
- Single File Pawn Race (only one column)

## Architecture Benefits
The modular design makes it super easy to add new variants:
1. Create the variant config in `lib/ecoChess.ts`
2. Add a game card in `GameSelector.tsx`
3. That's it! The rest just works.
