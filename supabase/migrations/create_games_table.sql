-- Create games table to store user game history
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  game_status TEXT NOT NULL CHECK (game_status IN ('playing', 'white-wins', 'black-wins', 'draw')),
  winner TEXT CHECK (winner IN ('w', 'b')),
  move_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  final_fen TEXT,
  moves_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS games_user_id_idx ON games(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS games_created_at_idx ON games(created_at DESC);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own games
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own games
CREATE POLICY "Users can insert own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own games
CREATE POLICY "Users can update own games"
  ON games FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own games
CREATE POLICY "Users can delete own games"
  ON games FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
