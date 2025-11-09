# Setting Up the Games Database

To enable game saving functionality, you need to run the SQL migration in your Supabase project.

## Quick Setup

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `cxndvodvqizqdxztckps`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/create_games_table.sql`
6. Click **Run** to execute the migration

## What This Creates

The migration will create:

- ✅ **`games` table** - Stores all user game history
- ✅ **Row Level Security (RLS) policies** - Users can only see their own games
- ✅ **Indexes** - For fast queries on user_id and created_at
- ✅ **Triggers** - Automatically update timestamps

## Table Schema

```sql
games (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  variant_name TEXT,
  game_status TEXT ('playing' | 'white-wins' | 'black-wins' | 'draw'),
  winner TEXT ('w' | 'b'),
  move_history JSONB,
  final_fen TEXT,
  moves_count INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
)
```

## Features Enabled

Once the migration is run, logged-in users can:
- ✅ Automatically save completed games
- ✅ View their game history
- ✅ See game statistics (wins, losses, draws)
- ✅ Delete old games
- ✅ Track move history for each game

## Verification

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase
2. You should see a new `games` table
3. Check that RLS is enabled (there should be a shield icon)
4. Try playing a game while logged in - it should save automatically!
