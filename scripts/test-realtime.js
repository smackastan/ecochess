#!/usr/bin/env node

/**
 * Terminal-based Realtime Testing Script
 * This script tests Supabase Realtime functionality from the command line
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Supabase Realtime Test Script');
console.log('=================================\n');
console.log('📡 Supabase URL:', SUPABASE_URL);
console.log('🔑 Using anon key:', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

let updateCount = 0;
let testGameId = null;

// Test 1: Check Authentication
async function testAuth() {
  console.log('📋 Test 1: Checking authentication...');
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('⚠️  Not authenticated (this is OK for testing)');
    console.log('   Using anonymous access\n');
    return null;
  } else {
    console.log('✅ Authenticated as:', user.email);
    console.log('   User ID:', user.id, '\n');
    return user;
  }
}

// Test 2: Setup Realtime Subscription
async function setupRealtimeSubscription() {
  console.log('📋 Test 2: Setting up Realtime subscription...');
  
  const channel = supabase
    .channel('test-multiplayer-games')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'multiplayer_games',
      },
      (payload) => {
        updateCount++;
        console.log(`\n🔔 [${new Date().toLocaleTimeString()}] REALTIME EVENT RECEIVED!`);
        console.log('   Event Type:', payload.eventType);
        console.log('   Game ID:', payload.new?.id);
        console.log('   Status:', payload.new?.game_status);
        console.log('   FEN:', payload.new?.current_fen?.substring(0, 50) + '...');
        console.log('   Total events received:', updateCount, '\n');
      }
    )
    .subscribe((status, err) => {
      console.log('📊 Subscription Status:', status);
      
      if (err) {
        console.error('❌ Subscription Error:', err.message);
      }
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to realtime updates!');
        console.log('   Listening for INSERT, UPDATE, DELETE events on multiplayer_games\n');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ CHANNEL_ERROR - Realtime is likely NOT enabled on the table!');
        console.log('\n📝 To fix this:');
        console.log('   1. Go to: https://supabase.com/dashboard');
        console.log('   2. Select project: cxndvodvqizqdxztckps');
        console.log('   3. Navigate to: Database → Replication');
        console.log('   4. Find: multiplayer_games table');
        console.log('   5. Enable: INSERT, UPDATE, DELETE');
        console.log('   6. Save and run this script again\n');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Subscription timed out\n');
      }
    });

  return channel;
}

// Test 3: Create a test game
async function createTestGame(user) {
  console.log('📋 Test 3: Creating test game...');
  
  const testData = {
    variant_name: 'test-' + Date.now(),
    game_status: 'waiting',
    time_control: 600,
    current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    move_history: [],
    current_turn: 'w',
    white_time_remaining: 600,
  };

  if (user) {
    testData.white_player_id = user.id;
  }

  const { data, error } = await supabase
    .from('multiplayer_games')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating test game:', error.message);
    return null;
  } else {
    testGameId = data.id;
    console.log('✅ Created test game:', testGameId);
    console.log('   Variant:', data.variant_name);
    console.log('   Status:', data.game_status);
    console.log('   ⏳ Waiting for INSERT event... (should appear above)\n');
    return data;
  }
}

// Test 4: Update the test game
async function updateTestGame() {
  if (!testGameId) {
    console.log('⚠️  No test game to update\n');
    return;
  }

  console.log('📋 Test 4: Updating test game...');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  
  const { error } = await supabase
    .from('multiplayer_games')
    .update({ game_status: 'active' })
    .eq('id', testGameId);

  if (error) {
    console.error('❌ Error updating test game:', error.message, '\n');
  } else {
    console.log('✅ Updated test game status to "active"');
    console.log('   ⏳ Waiting for UPDATE event... (should appear above)\n');
  }
}

// Test 5: Cleanup
async function cleanup(channel) {
  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for events
  
  console.log('📋 Test 5: Cleanup...');
  
  if (testGameId) {
    const { error } = await supabase
      .from('multiplayer_games')
      .delete()
      .eq('id', testGameId);
    
    if (error) {
      console.log('⚠️  Could not delete test game:', error.message);
    } else {
      console.log('✅ Deleted test game\n');
    }
  }

  if (channel) {
    await supabase.removeChannel(channel);
    console.log('✅ Unsubscribed from channel\n');
  }
}

// Main test flow
async function runTests() {
  try {
    const user = await testAuth();
    const channel = await setupRealtimeSubscription();
    
    // Wait for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await createTestGame(user);
    await updateTestGame();
    await cleanup(channel);
    
    console.log('=================================');
    console.log('📊 FINAL RESULTS:');
    console.log('=================================');
    console.log('Total Realtime Events Received:', updateCount);
    console.log('Expected Events: 2 (1 INSERT + 1 UPDATE)');
    
    if (updateCount >= 2) {
      console.log('\n✅ SUCCESS! Realtime is working correctly! 🎉');
      console.log('   Your multiplayer chess should sync in real-time.\n');
    } else if (updateCount === 0) {
      console.log('\n❌ FAILED! No realtime events received.');
      console.log('\n🔧 SOLUTION:');
      console.log('   Realtime is NOT enabled on the multiplayer_games table.');
      console.log('\n📝 Steps to fix:');
      console.log('   1. Open: https://supabase.com/dashboard/project/cxndvodvqizqdxztckps/database/replication');
      console.log('   2. Find the "multiplayer_games" table');
      console.log('   3. Toggle ON for: INSERT, UPDATE, DELETE');
      console.log('   4. Click "Save" or it may auto-save');
      console.log('   5. Run this script again: npm run test:realtime\n');
    } else {
      console.log('\n⚠️  PARTIAL! Only received', updateCount, 'events.');
      console.log('   Expected 2 events. Check Supabase Replication settings.\n');
    }
    
    process.exit(updateCount >= 2 ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Test interrupted by user');
  process.exit(1);
});

// Run the tests
runTests();
