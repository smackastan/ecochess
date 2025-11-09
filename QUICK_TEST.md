# 🧪 Quick Testing Guide

## Test the Fixed Invite System (5 minutes)

### Prerequisites
- Two test accounts already created
- Dev server running at http://localhost:3000

---

## 🎯 Quick Test Steps

### 1. Send an Invite (Account 1)
```
1. Open Chrome → http://localhost:3000
2. Log in as: test1@example.com
3. Click: "🎮 Play Online"
4. Enter email: test2@example.com
5. Choose: Pawn Race, 5 minutes
6. Click: "Send Invite"
7. ✅ See: "Invite sent successfully!"
```

### 2. Check Received Invite (Account 2)
```
1. Open Firefox/Safari → http://localhost:3000
2. Log in as: test2@example.com
3. Click: "📬 Invites"
4. ✅ Should see: "Challenge from test1@example.com"
   (NOT "Challenge from Unknown")
```

### 3. Test Real-Time Notification
```
1. Keep Account 2's "Invites" modal OPEN
2. Switch to Account 1 (Chrome)
3. Send another invite to test2@example.com
4. Switch back to Account 2 (Firefox)
5. ✅ New invite should appear automatically (1-2 seconds)
   (No page refresh needed!)
```

### 4. Accept & Play
```
1. As Account 2, click "Accept"
2. ✅ Both browsers load the game
3. Make a move as White (Account 1)
4. ✅ Move appears on Account 2's board instantly
5. ✅ Timer switches to Account 2
```

---

## ✅ Success Criteria

All of these should work:

- [ ] Invites show sender's email (not "Unknown")
- [ ] Invites appear for recipient without refresh
- [ ] Real-time notification works (new invite appears automatically)
- [ ] Accept creates game for both players
- [ ] Moves sync in real-time
- [ ] Timers count down correctly

---

## 🐛 If Something Doesn't Work

### Invites don't appear for recipient
1. Check Supabase dashboard → Tables → game_invites
2. Verify `to_user_id` is populated (not NULL)
3. Check `to_user_email` matches recipient's email exactly

### Shows "Unknown" instead of sender email
1. Supabase dashboard → Database → Views
2. Verify `game_invites_with_users` view exists
3. Check it includes `sender_email` column

### Real-time doesn't work
1. Open browser console (F12)
2. Look for Supabase Realtime connection messages
3. Verify no subscription errors

### Migration not applied
If the database trigger doesn't exist:
```bash
# Re-run the migration via Supabase MCP
# (Ask for help if needed)
```

---

## 📊 Expected Database State

After sending one invite, check Supabase:

**Table: game_invites**
```
to_user_email: test2@example.com
to_user_id: [should be populated, not NULL]
from_user_id: [Account 1's UUID]
status: pending
```

**View: game_invites_with_users**
```
Same as above, PLUS:
sender_email: test1@example.com
```

---

## 🎮 All Features Working

Once this test passes, you have:

✅ **Full Authentication**
- Email/password + Google OAuth
- Secure sessions

✅ **Game History**
- Auto-save on game completion
- Stats dashboard

✅ **Online Multiplayer**
- Friend invitations (FIXED!)
- Real-time moves
- Live timers
- All variants

---

## 🚀 Ready to Deploy!

When all tests pass:
1. Merge feature branch to main
2. Push to GitHub
3. Deploy to Vercel
4. Share with friends! 🎉

---

**Time to test: ~5 minutes**
**Let's verify the fix works!** 🎯
