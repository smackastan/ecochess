'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { multiplayerService } from '@/lib/multiplayerService';

export default function AutoTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const log = (message: string, isError = false) => {
    const prefix = isError ? '❌' : '✅';
    const logMessage = `${prefix} ${message}`;
    console.log(logMessage);
    setResults(prev => [...prev, logMessage]);
  };

  const runTests = async () => {
    setResults([]);
    setTesting(true);
    log('🧪 Starting automated tests...');

    try {
      // Test 1: Supabase Connection
      log('Test 1: Checking Supabase connection...');
      const supabase = createClient();
      const { data: testData, error: testError } = await supabase
        .from('multiplayer_games')
        .select('*')
        .limit(1);
      
      if (testError) {
        log(`Supabase connection FAILED: ${testError.message}`, true);
      } else {
        log('Supabase connection OK');
      }

      // Test 2: Authentication
      log('Test 2: Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        log('Not authenticated - Please log in first', true);
      } else {
        log(`Authenticated as: ${user.email}`);
      }

      // Test 3: Check Realtime Status
      log('Test 3: Checking Realtime configuration...');
      const channels = supabase.getChannels();
      log(`Active channels: ${channels.length}`);

      // Test 4: Test Realtime Subscription
      log('Test 4: Testing Realtime subscription...');
      let messageReceived = false;
      
      const testChannel = supabase
        .channel('test-channel')
        .on('broadcast', { event: 'test' }, (payload) => {
          messageReceived = true;
          log('Realtime broadcast received!');
        })
        .subscribe((status) => {
          log(`Channel status: ${status}`);
        });

      // Wait 2 seconds for subscription
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Send test broadcast
      await testChannel.send({
        type: 'broadcast',
        event: 'test',
        payload: { message: 'test' },
      });

      // Wait for message
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (messageReceived) {
        log('Realtime is working!');
      } else {
        log('Realtime NOT working - broadcasts not received', true);
      }

      await supabase.removeChannel(testChannel);

      // Test 5: Check if multiplayer_games has Realtime enabled
      log('Test 5: Checking multiplayer_games Realtime...');
      
      // Create a test subscription
      const gameChannel = supabase
        .channel('game-test')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'multiplayer_games',
          },
          (payload) => {
            log('✅ Received multiplayer_games UPDATE event!');
            log(`Updated game: ${payload.new.id}`);
          }
        )
        .subscribe((status) => {
          log(`multiplayer_games channel status: ${status}`);
        });

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (gameChannel.state === 'joined') {
        log('multiplayer_games Realtime subscription active');
      } else {
        log(`multiplayer_games subscription state: ${gameChannel.state}`, true);
      }

      await supabase.removeChannel(gameChannel);

      // Test 6: Test game creation
      if (user) {
        log('Test 6: Testing game operations...');
        
        // Try to get active games
        const { data: games, error: gamesError } = await multiplayerService.getMyGames();
        
        if (gamesError) {
          log(`Error fetching games: ${gamesError.message}`, true);
        } else {
          log(`Found ${games?.length || 0} active games`);
          if (games && games.length > 0) {
            log(`Latest game: ${games[0].variant_name} - ${games[0].game_status}`);
          }
        }
      }

      // Test 7: Check network connectivity
      log('Test 7: Checking network connectivity...');
      try {
        const response = await fetch('https://www.google.com', { mode: 'no-cors' });
        log('Network connectivity: OK');
      } catch (e) {
        log('Network connectivity: FAILED', true);
      }

      log('🎉 All tests complete!');
      log('');
      log('📋 Summary:');
      log('If all tests passed, realtime should work.');
      log('If realtime subscription failed, check Supabase dashboard.');
      log('Go to Database → Replication → Enable Realtime for multiplayer_games');

    } catch (error: any) {
      log(`Fatal error: ${error.message}`, true);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">🧪 Multiplayer Diagnostics</h1>
          
          <p className="text-gray-600 mb-6">
            This page runs automated tests to diagnose multiplayer issues.
          </p>

          <button
            onClick={runTests}
            disabled={testing}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              testing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {testing ? 'Running Tests...' : 'Run Diagnostic Tests'}
          </button>

          {results.length > 0 && (
            <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
              {results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">📖 Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Make sure you're logged in first</li>
              <li>Click "Run Diagnostic Tests"</li>
              <li>Check the console output for detailed results</li>
              <li>If Realtime fails, go to Supabase dashboard:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Database → Replication</li>
                  <li>Enable Realtime for <code className="bg-blue-100 px-1 rounded">multiplayer_games</code></li>
                  <li>Click "Save"</li>
                </ul>
              </li>
              <li>Run tests again to verify</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Common Issues:</h2>
            <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
              <li>Not logged in → Log in first</li>
              <li>Realtime not enabled → Enable in Supabase dashboard</li>
              <li>RLS policies blocking → Check Supabase policies</li>
              <li>Network issues → Check internet connection</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Game
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
