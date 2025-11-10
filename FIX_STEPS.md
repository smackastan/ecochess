# 🎯 ACTION REQUIRED - Enable Realtime in 5 Steps

## Current Status: ❌ Realtime NOT Enabled

**Test Result:** 0 events received  
**Expected:** 2 events (INSERT + UPDATE)  
**Diagnosis:** Realtime replication is disabled

---

## 🚀 Fix It Now (2 minutes)

### STEP 1: Open This URL

```
https://supabase.com/dashboard/project/cxndvodvqizqdxztckps
```

**Or:**
1. Go to https://supabase.com
2. Click on your project: `cxndvodvqizqdxztckps`

---

### STEP 2: Navigate to Replication

In the left sidebar, click:

**Database** → **Replication**

**Direct link:**
```
https://supabase.com/dashboard/project/cxndvodvqizqdxztckps/database/replication
```

---

### STEP 3: Find multiplayer_games Table

Scroll down the list of tables until you find:

```
📊 multiplayer_games
```

---

### STEP 4: Enable All Events

Next to `multiplayer_games`, you'll see three toggles:

- **INSERT**: Click to turn ON (green/blue)
- **UPDATE**: Click to turn ON (green/blue)  
- **DELETE**: Click to turn ON (green/blue)

**All three should be enabled!**

---

### STEP 5: Save (if needed)

Changes usually auto-save. If you see a "Save" or "Apply" button, click it.

---

## ✅ Test It Worked

### Method 1: Web Test Page

1. Go to: http://localhost:3000/realtime-test
2. Make sure you're logged in
3. Click "Test Create & Update"
4. **Watch for:**
   - 🔔 Received INSERT event!
   - 🔔 Received UPDATE event!
   - Counter shows: **2**

### Method 2: SQL Verification

In Supabase Dashboard → SQL Editor, run:

```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Should return:** `multiplayer_games` (and other enabled tables)

---

## 🎮 Then Test Multiplayer

Once events are working:

1. **Browser 1** (Chrome normal):
   - http://localhost:3000
   - Log in as User 1
   - Send invite

2. **Browser 2** (Chrome incognito):
   - http://localhost:3000
   - Log in as User 2
   - Accept invite

3. **Both browsers:**
   - Join the game
   - Open console (F12)

4. **Browser 1:**
   - Make a move

5. **Browser 2:**
   - Should see move appear within 1-3 seconds
   - No refresh needed!

---

## 🆘 Troubleshooting

### Can't Find Replication Page?

Try the SQL method:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_games;
```

### Still No Events After Enabling?

1. Wait 30 seconds (changes need to propagate)
2. Refresh the test page
3. Try again

### Enabled But Still 0 Events?

Check RLS (Row Level Security) policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'multiplayer_games';
```

Make sure there's a policy allowing SELECT for authenticated users.

---

## 📋 Checklist

- [ ] Opened Supabase Dashboard
- [ ] Navigated to Database → Replication
- [ ] Found `multiplayer_games` table
- [ ] Enabled INSERT toggle
- [ ] Enabled UPDATE toggle
- [ ] Enabled DELETE toggle
- [ ] Saved changes (if needed)
- [ ] Tested on /realtime-test page
- [ ] Saw 2 events received
- [ ] Tested multiplayer game
- [ ] Moves sync in real-time

---

## 🎯 Success Looks Like

**Test page shows:**
```
🟢 Connected
Updates received: 2

Console:
[11:53:40 PM] 🔔 Received INSERT event!
[11:53:43 PM] 🔔 Received UPDATE event!
```

**Multiplayer game:**
```
Browser 1: Makes move
Browser 2: [Realtime] Game update received ✅
           Board updates automatically ✅
           Timer switches ✅
```

---

**You're almost there!** Just need to flip those toggles in Supabase! 🎯

**Direct link again:** https://supabase.com/dashboard/project/cxndvodvqizqdxztckps/database/replication
