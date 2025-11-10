#!/usr/bin/env node

/**
 * Simple Realtime Test - No auth required
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let SUPABASE_URL, SUPABASE_ANON_KEY;

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    SUPABASE_URL = line.split('=')[1];
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    SUPABASE_ANON_KEY = line.split('=')[1];
  }
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🚀 Supabase Realtime Test\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    log_level: 'debug'
  }
});

let eventCount = 0;
let testGameId = null;

console.log('📡 Setting up subscription...\n');

const channel = supabase
  .channel('test-games')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'multiplayer_games',
    },
    (payload) => {
      eventCount++;
      console.log(`\n🔔 EVENT ${eventCount} RECEIVED!`);
      console.log('Type:', payload.eventType);
      console.log('Game ID:', payload.new?.id);
      console.log('Status:', payload.new?.game_status);
    }
  )
  .subscribe((status) => {
    console.log('Subscription Status:', status);
    
    if (status === 'SUBSCRIBED') {
      console.log('✅ Subscribed! Now testing...\n');
      runTest();
    } else if (status === 'CHANNEL_ERROR') {
      console.log('\n❌ CHANNEL_ERROR - Realtime NOT enabled!');
      console.log('\n🔧 Fix: https://supabase.com/dashboard/project/cxndvodvqizqdxztckps/database/replication');
      console.log('Enable for: multiplayer_games table\n');
      process.exit(1);
    }
  });

async function runTest() {
  try {
    console.log('Creating test game...');
    const { data, error } = await supabase
      .from('multiplayer_games')
      .insert({
        variant_name: 'test-' + Date.now(),
        game_status: 'waiting',
        time_control: 600,
        current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        move_history: [],
        current_turn: 'w',
        white_time_remaining: 600,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error.message);
      cleanup();
      return;
    }

    testGameId = data.id;
    console.log('✅ Created game:', testGameId);
    console.log('⏳ Waiting for INSERT event...\n');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Updating test game...');
    const { error: updateError } = await supabase
      .from('multiplayer_games')
      .update({ game_status: 'active' })
      .eq('id', testGameId);

    if (updateError) {
      console.error('❌ Update error:', updateError.message);
      cleanup();
      return;
    }

    console.log('✅ Updated game to active');
    console.log('⏳ Waiting for UPDATE event...\n');

    // Wait 3 seconds for events
    await new Promise(resolve => setTimeout(resolve, 3000));

    cleanup();

  } catch (err) {
    console.error('❌ Test error:', err.message);
    cleanup();
  }
}

async function cleanup() {
  console.log('\n=================================');
  console.log('📊 RESULTS');
  console.log('=================================');
  console.log('Events Received:', eventCount);
  console.log('Expected: 2 (INSERT + UPDATE)\n');

  if (testGameId) {
    await supabase
      .from('multiplayer_games')
      .delete()
      .eq('id', testGameId);
    console.log('✅ Cleaned up test game\n');
  }

  await supabase.removeChannel(channel);

  if (eventCount >= 2) {
    console.log('✅ SUCCESS! Realtime is working! 🎉\n');
    process.exit(0);
  } else {
    console.log('❌ FAILED! Realtime is NOT enabled.');
    console.log('\n🔧 To fix:');
    console.log('1. Go to: https://supabase.com/dashboard/project/cxndvodvqizqdxztckps/database/replication');
    console.log('2. Find: multiplayer_games');
    console.log('3. Enable: INSERT, UPDATE, DELETE');
    console.log('4. Run: npm run test:realtime\n');
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted');
  cleanup();
});
