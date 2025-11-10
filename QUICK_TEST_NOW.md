# 🚀 QUICK TEST - DO THIS NOW

## Step 1: Open Test Page
http://localhost:3000/realtime-test

## Step 2: Check Status
Look for:
- 🟢 Green dot = Good
- 🔴 Red dot = Need to enable Realtime

## Step 3: Click Button
"Test Create & Update"

Watch for:
- ✅ "Received INSERT event!"
- ✅ "Received UPDATE event!"

## If You See Events → SUCCESS! 🎉
Real-time is working. Now test the actual game.

## If NO Events → Need to Enable Realtime

1. Go to: https://supabase.com/dashboard
2. Find your project: `cxndvodvqizqdxztckps`
3. Click: Database → Replication
4. Enable `multiplayer_games` table
5. Come back and test again

---

**That's it!** Start at http://localhost:3000/realtime-test
