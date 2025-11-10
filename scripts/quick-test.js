#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env
const env = fs.readFileSync('.env.local', 'utf8');
const URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const KEY = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

console.log('Testing Realtime...\n');

const supabase = createClient(URL, KEY);

let count = 0;

const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'multiplayer_games'
  }, (payload) => {
    count++;
    console.log(`✅ Event ${count}:`, payload.eventType);
  })
  .subscribe((status) => {
    console.log('Status:', status);
    
    if (status === 'SUBSCRIBED') {
      console.log('\n✅ Connected! Creating test game...\n');
      setTimeout(createGame, 1000);
    } else if (status === 'CHANNEL_ERROR') {
      console.log('\n❌ ERROR: Realtime NOT enabled!');
      console.log('Fix: https://supabase.com/dashboard/project/cxndvodvqizqdxztckps/database/replication\n');
      process.exit(1);
    }
  });

let gameId;

async function createGame() {
  const { data } = await supabase
    .from('multiplayer_games')
    .insert({
      variant_name: 'test',
      game_status: 'waiting',
      time_control: 600,
      current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      move_history: [],
      current_turn: 'w',
      white_time_remaining: 600
    })
    .select()
    .single();

  gameId = data.id;
  console.log('Created:', gameId);
  console.log('Waiting 2s for INSERT event...\n');
  
  setTimeout(updateGame, 2000);
}

async function updateGame() {
  await supabase
    .from('multiplayer_games')
    .update({ game_status: 'active' })
    .eq('id', gameId);
  
  console.log('Updated game');
  console.log('Waiting 2s for UPDATE event...\n');
  
  setTimeout(finish, 2000);
}

async function finish() {
  await supabase.from('multiplayer_games').delete().eq('id', gameId);
  await supabase.removeChannel(channel);
  
  console.log('===================');
  console.log('Events received:', count);
  console.log('Expected: 2');
  console.log('===================\n');
  
  if (count >= 2) {
    console.log('✅ SUCCESS!\n');
    process.exit(0);
  } else {
    console.log('❌ FAILED! Enable Realtime in Supabase Dashboard\n');
    process.exit(1);
  }
}

setTimeout(() => {
  console.log('\n⏱️  Timeout - script taking too long');
  process.exit(1);
}, 30000);
