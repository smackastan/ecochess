# Realtime Debugging Steps

## What We've Added

### 1. Enhanced Logging
Added console.log statements throughout the realtime flow:
- **multiplayerService.ts**: Logs subscription status and received updates
- **MultiplayerGameComponent.tsx**: Logs loading, subscription setup, and move events

### 2. Realtime Test Page
Created `/app/realtime-test/page.tsx` - A dedicated testing page that:
- Shows real-time connection status
- Counts updates received
- Allows you to create/update test games
- Displays detailed console logs

## How to Debug

### Step 1: Run the Development Server
```bash
npm run dev
```

### Step 2: Open the Realtime Test Page
Navigate to: `http://localhost:3000/realtime-test`

### Step 3: Check Connection Status
1. Make sure you're logged in
2. Look for "Connected" status (green dot)
3. Check the console logs for subscription status

### Step 4: Test Realtime Updates
1. Click the "Test Create & Update" button
2. Watch for these log messages:
   - `🔔 Received INSERT event!`
   - `🔔 Received UPDATE event!`
3. The "Updates received" counter should increment

### Step 5: Check Supabase Dashboard

If no events are received, you need to enable Realtime in Supabase:

1. Go to https://supabase.com/dashboard
2. Select your project: `cxndvodvqizqdxztckps`
3. Go to **Database** → **Replication**
4. Find the `multiplayer_games` table
5. Make sure the toggle is **ON** for all event types (INSERT, UPDATE, DELETE)
6. Also check `game_invites` table

### Step 6: Test in Multiplayer Game

After confirming Realtime works on the test page:

1. Open the app in two different browsers (or incognito)
2. Log in with two different accounts
3. Send a game invite from one account
4. Accept from the other account
5. Open browser console (F12) in both browsers
6. Make a move in one browser
7. Watch the console logs:
   - Browser 1: Should see `[Multiplayer] Move sent successfully`
   - Browser 2: Should see `[Multiplayer] Received game update:`
8. The move should appear automatically (without refresh)

## Common Issues & Solutions

### Issue: Subscription Status Shows "CHANNEL_ERROR"
**Solution**: Realtime is not enabled on the table
- Go to Supabase Dashboard → Database → Replication
- Enable replication for `multiplayer_games` table

### Issue: Subscription Shows "SUBSCRIBED" but No Events
**Possible Causes**:
1. **Row Level Security (RLS) blocking updates**
   - Check RLS policies in Supabase
   - Make sure authenticated users can SELECT updates
   
2. **Filter not matching**
   - Check the gameId in the URL matches a real game
   - Verify the filter in subscribeToGame: `filter: 'id=eq.${gameId}'`

### Issue: Events Delayed by Several Seconds
**Solution**: This is normal - Supabase Realtime can have 1-3 second delays

### Issue: Works on Test Page but Not in Game
**Possible Causes**:
1. **Component unmounting too early**
   - Check if the component stays mounted during the game
   
2. **Multiple subscriptions interfering**
   - Make sure unsubscribeFromGame is called properly
   
3. **Chess game state not updating**
   - Check updateChessGameFromFen is creating a new instance

## Expected Console Output (Successful Test)

When you make a move in multiplayer, you should see:

**Player 1 (making move):**
```
[Multiplayer] Attempting move: { sourceSquare: 'e2', targetSquare: 'e4' }
[Multiplayer] Sending move to server: { newFen: '...', moveNotation: 'e2e4', ... }
[Multiplayer] Move sent successfully
```

**Player 2 (receiving move):**
```
[Realtime] Subscription status: SUBSCRIBED
[Realtime] Game update received: { id: '...', current_fen: '...', ... }
[Multiplayer] Received game update: { ... }
```

## Next Steps

If Realtime is confirmed working but moves still don't sync:

1. **Check the FEN update logic**
   - Verify `updateChessGameFromFen` is called
   - Ensure it creates a new EcoChessGame instance
   
2. **Check render dependencies**
   - The component should re-render when `game` or `chessGame` changes
   
3. **Test with browser refresh**
   - If it works after refresh but not in realtime, the issue is in the update logic

## Helpful Commands

```bash
# Check current git status
git status

# View recent logs
git log --oneline -5

# Check for uncommitted changes
git diff
```

## Contact

If you're still stuck after following these steps, provide:
1. Console logs from both browsers
2. Screenshot of Supabase Replication settings
3. The game ID you're testing with
