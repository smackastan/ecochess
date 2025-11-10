'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RealtimeTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const supabase = createClient();
    
    addLog('🚀 Starting Realtime test...');

    // Test 1: Check authentication
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        addLog('❌ Not authenticated - please log in first');
        return;
      }
      addLog(`✅ Authenticated as: ${user.email}`);
    });

    // Test 2: Subscribe to multiplayer_games table
    addLog('📡 Subscribing to multiplayer_games table...');
    
    const channel = supabase
      .channel('multiplayer-games-test')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'multiplayer_games',
        },
        (payload) => {
          addLog(`🔔 Received ${payload.eventType} event!`);
          addLog(`   Data: ${JSON.stringify(payload.new).substring(0, 100)}...`);
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe((status, err) => {
        addLog(`📊 Subscription status: ${status}`);
        if (err) {
          addLog(`❌ Subscription error: ${err.message}`);
        }
        if (status === 'SUBSCRIBED') {
          addLog('✅ Successfully subscribed to realtime updates!');
          setIsSubscribed(true);
        } else if (status === 'CHANNEL_ERROR') {
          addLog('❌ Channel error - Realtime may not be enabled');
        } else if (status === 'TIMED_OUT') {
          addLog('❌ Subscription timed out');
        }
      });

    return () => {
      addLog('🔌 Unsubscribing from channel...');
      supabase.removeChannel(channel);
    };
  }, []);

  const testUpdate = async () => {
    const supabase = createClient();
    
    addLog('🧪 Creating a test game to trigger realtime event...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addLog('❌ Please log in to test updates');
      return;
    }

    // Create a test game
    const { data, error } = await supabase
      .from('multiplayer_games')
      .insert({
        variant_name: 'standard',
        game_status: 'waiting',
        time_control: 600,
        current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        move_history: [],
        current_turn: 'w',
        white_player_id: user.id,
        white_time_remaining: 600,
      })
      .select()
      .single();

    if (error) {
      addLog(`❌ Error creating test game: ${error.message}`);
    } else {
      addLog(`✅ Created test game with ID: ${data.id}`);
      addLog('⏳ Waiting for realtime event... (should appear above)');
      
      // Update the game after 2 seconds
      setTimeout(async () => {
        addLog('🔄 Updating test game...');
        const { error: updateError } = await supabase
          .from('multiplayer_games')
          .update({ game_status: 'active' })
          .eq('id', data.id);
        
        if (updateError) {
          addLog(`❌ Error updating game: ${updateError.message}`);
        } else {
          addLog('✅ Updated test game - should trigger realtime event');
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Supabase Realtime Test</h1>
          <p className="text-gray-600 mb-4">
            This page tests if Realtime is working for the multiplayer_games table.
          </p>
          
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isSubscribed ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Updates received: {updateCount}</span>
            </div>
          </div>

          <button
            onClick={testUpdate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Create & Update
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 rounded-lg shadow-xl p-6 font-mono text-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Console Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">📋 Debugging Checklist:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✓ Check if you're logged in</li>
            <li>✓ Verify subscription status shows "SUBSCRIBED"</li>
            <li>✓ Click "Test Create & Update" to trigger events</li>
            <li>✓ Watch for realtime events in the logs</li>
            <li>✓ If no events appear, check Supabase Dashboard → Database → Replication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
