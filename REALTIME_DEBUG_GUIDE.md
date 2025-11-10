# 🔍 Debugging Guide for Real-Time Sync

## 🐛 Issue: Moves Don't Sync Automatically

**Symptom:** Moves only appear after refreshing the page

**Possible Causes:**
1. Supabase Realtime subscription not firing
2. Callback function not updating state
3. Browser console errors preventing updates
4. Network/WebSocket connection issues

---

## 🧪 Step-by-Step Debugging

### Test 1: Check Browser Console

**Open both browsers' developer consoles (F12 or ⌘+Option+I)**

#### What to look for:

**When game loads:**
```
Setting up board, gameState.board: [...]
Final FEN: pppppppp/8/8/8/8/8/PPPPPPPP/4Kk2 w - - 0 1
```

**When making a move:**
```
=== VALIDATING MOVE ===
Move: e2 (row 6, col 4) -> e4 (row 4, col 4)
Piece at source: {type: 'p', color: 'w'}
✅ Valid: Forward 2 squares from start
```

**Real-time subscription:**
```
Supabase Realtime: Connected
Channel: game:[game-id] joined
```

**When opponent makes a move (should see):**
```
Received update from Supabase
Updated game state
Loading FEN: pppppppp/8/8/8/4p3/8/PPPP1PPP/4Kk2 w - - 0 1
```

---

### Test 2: Add Console Logging

Add this to `MultiplayerGameComponent.tsx` temporarily to debug:

```typescript
useEffect(() => {
  console.log('🎮 Setting up multiplayer game:', gameId);
  loadGame();

  // Subscribe to real-time updates
  const channel = multiplayerService.subscribeToGame(gameId, (updatedGame) => {
    console.log('🔥 REALTIME UPDATE RECEIVED:', updatedGame);
    console.log('Current FEN:', updatedGame.current_fen);
    console.log('Move history:', updatedGame.move_history);
    
    setGame(updatedGame);
    if (chessGame) {
      console.log('Updating chess game from FEN');
      updateChessGameFromFen(updatedGame.current_fen);
    }
    lastMoveTimeRef.current = Date.now();
  });

  console.log('✅ Subscribed to game updates');

  return () => {
    console.log('❌ Unsubscribing from game');
    multiplayerService.unsubscribeFromGame();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [gameId]);
```

---

### Test 3: Check Supabase Realtime Dashboard

1. Go to your Supabase dashboard
2. Click on "Database" → "Replication"
3. Verify that Realtime is enabled for `multiplayer_games` table
4. Check if there are any errors

**Expected:** ✅ Realtime enabled for `public.multiplayer_games`

---

### Test 4: Verify Database Trigger

Check if moves are actually being saved:

1. Go to Supabase → Table Editor → `multiplayer_games`
2. Find your active game
3. Watch the `current_fen` field
4. Make a move in Browser 1
5. Refresh the table in Supabase

**Expected:** 
- `current_fen` should update immediately
- `move_history` should add new move
- `current_turn` should flip (w→b or b→w)
- `last_move_at` should update to current time

---

### Test 5: Network Tab

**Browser 1:**
1. Open Network tab (F12 → Network)
2. Filter by "WS" (WebSocket)
3. Look for Supabase Realtime connection

**Expected:**
- WebSocket connection to `realtime-v2.supabase.co`
- Status: 101 Switching Protocols (green)
- Messages tab shows "phoenix" protocol messages

**When move is made:**
- Should see outgoing message with UPDATE data
- Should see incoming message with UPDATE confirmation

---

## 🔧 Common Fixes

### Fix 1: Realtime Not Enabled

**Problem:** Supabase Realtime not enabled for table

**Solution:**
```sql
-- Run in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_games;
```

---

### Fix 2: RLS Blocking Updates

**Problem:** Row Level Security preventing read

**Solution:**
```sql
-- Check current policy
SELECT * FROM pg_policies 
WHERE tablename = 'multiplayer_games';

-- Should have policy allowing players to read their games
```

---

### Fix 3: Subscription Not Firing

**Problem:** React cleanup removing subscription too early

**Solution:** Check dependencies in useEffect:

```typescript
// Current (might be issue)
useEffect(() => {
  // subscribe
}, [gameId]);

// Try this instead
useEffect(() => {
  // subscribe
}, [gameId, chessGame]); // Add chessGame dependency
```

---

### Fix 4: State Not Updating

**Problem:** `setGame()` called but UI doesn't update

**Add this logging:**
```typescript
const [game, setGame] = useState<MultiplayerGame | null>(null);

// Add this after setGame calls
useEffect(() => {
  console.log('📊 Game state changed:', game);
}, [game]);
```

---

## 📋 Testing Checklist

Use this to systematically test:

### Browser 1 (White Player)
- [ ] Open http://localhost:3000
- [ ] Open Console (F12)
- [ ] Log in as Account 1
- [ ] Send invite to Account 2
- [ ] Accept invite notification
- [ ] Console shows: "Subscribed to game updates"
- [ ] Console shows: "Setting up board"
- [ ] Make move: e2→e4
- [ ] Console shows: "VALIDATING MOVE"
- [ ] Console shows move is valid
- [ ] Board updates locally
- [ ] Timer stops for you

### Browser 2 (Black Player)  
- [ ] Open http://localhost:3000 (different browser/incognito)
- [ ] Open Console (F12)
- [ ] Log in as Account 2
- [ ] See invite, click Accept
- [ ] Console shows: "Subscribed to game updates"
- [ ] Console shows: "Setting up board"
- [ ] **WAIT FOR WHITE'S MOVE**
- [ ] **CHECK CONSOLE** for "REALTIME UPDATE RECEIVED"
- [ ] If you see update → Board should show White's pawn on e4
- [ ] If no update → Check WebSocket connection
- [ ] Your timer should be running

---

## 🐞 Debugging Scenarios

### Scenario A: No Console Message on Move

**Symptoms:**
- Browser 2 doesn't show "REALTIME UPDATE RECEIVED"
- WebSocket shows connected

**Likely cause:** Subscription filter might be wrong

**Check:**
```typescript
// In multiplayerService.ts subscribeToGame()
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'multiplayer_games',
  filter: `id=eq.${gameId}`,  // ← Make sure gameId is correct
})
```

**Debug:**
```typescript
console.log('Subscribing to game ID:', gameId);
console.log('Filter:', `id=eq.${gameId}`);
```

---

### Scenario B: Console Shows Update But Board Doesn't Change

**Symptoms:**
- Browser 2 console shows "REALTIME UPDATE RECEIVED"
- But board doesn't update

**Likely cause:** `updateChessGameFromFen()` not working

**Check:**
```typescript
const updateChessGameFromFen = (fen: string) => {
  console.log('🔄 updateChessGameFromFen called with:', fen);
  
  if (!chessGame) {
    console.error('❌ chessGame is null!');
    return;
  }
  
  const newChessGame = new EcoChessGame(variant);
  console.log('Created new EcoChessGame');
  
  newChessGame.loadFromFen(fen);
  console.log('Loaded FEN');
  
  setChessGame(newChessGame);
  console.log('✅ Set new chess game');
};
```

---

### Scenario C: Works After Refresh But Not Live

**Symptoms:**
- Page refresh shows correct position
- But live updates don't work

**Likely cause:** Realtime subscription timing issue

**Try:**
```typescript
useEffect(() => {
  loadGame().then(() => {
    // Subscribe AFTER game is loaded
    const channel = multiplayerService.subscribeToGame(gameId, callback);
  });
}, [gameId]);
```

---

## 🎯 Quick Diagnostic Commands

**Check Supabase connection:**
```javascript
// Run in browser console
supabase.from('multiplayer_games').select('*').limit(1)
  .then(res => console.log('✅ Connected:', res))
  .catch(err => console.error('❌ Error:', err))
```

**Check Realtime status:**
```javascript
// Run in browser console
console.log('Realtime channels:', 
  Object.keys(supabase.getChannels()))
```

---

## 📊 Expected vs Actual

### Expected Behavior:

```
Browser 1: Make move (e2→e4)
  ↓
Database: UPDATE multiplayer_games
  ↓  
Supabase Realtime: Broadcast UPDATE event
  ↓
Browser 2: Receive WebSocket message
  ↓
Browser 2: subscribeToGame callback fires
  ↓
Browser 2: updateChessGameFromFen(new FEN)
  ↓
Browser 2: Board shows White's move
  ↓
TIME ELAPSED: < 500ms
```

### If Not Working:

Check where the chain breaks and report back with:
1. Last successful step
2. Console errors
3. Network tab WebSocket messages

---

## 🚨 Emergency Fallback

If real-time still doesn't work, add manual polling:

```typescript
// Temporary fallback - polls every 2 seconds
useEffect(() => {
  const pollInterval = setInterval(async () => {
    const { data } = await multiplayerService.getGame(gameId);
    if (data && data.move_history.length !== game?.move_history.length) {
      console.log('📊 Poll detected change');
      setGame(data);
      updateChessGameFromFen(data.current_fen);
    }
  }, 2000);

  return () => clearInterval(pollInterval);
}, [gameId, game]);
```

---

## 📧 What to Report

If still broken after these tests, please provide:

1. **Browser 1 console log** (when making move)
2. **Browser 2 console log** (when waiting for move)
3. **Network tab** screenshot showing WebSocket
4. **Supabase table** screenshot showing the game record
5. **Which step in the chain fails**

This will help pinpoint the exact issue! 🎯
