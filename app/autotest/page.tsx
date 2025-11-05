'use client';

import React, { useEffect } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import SimpleChessboard from '@/components/SimpleChessboard';

function AutoTestGame() {
  const { gameState, makeMove } = useGame();

  useEffect(() => {
    // Auto-play some moves after component mounts
    const autoPlay = async () => {
      console.log('=== AUTO TEST STARTING ===');
      console.log('Initial state:', gameState);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('\n1. Moving white pawn e2 to e4');
      const move1 = makeMove('e2', 'e4');
      console.log('Move 1 result:', move1);
      console.log('State after move 1:', gameState);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('\n2. Moving black pawn e7 to e5');
      const move2 = makeMove('e7', 'e5');
      console.log('Move 2 result:', move2);
      console.log('State after move 2:', gameState);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('\n3. Moving white pawn d2 to d4');
      const move3 = makeMove('d2', 'd4');
      console.log('Move 3 result:', move3);
      console.log('State after move 3:', gameState);
      
      console.log('\n=== AUTO TEST COMPLETE ===');
    };
    
    autoPlay();
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🧪 Auto Test - Pawn Race
        </h1>
        <p className="text-gray-600">
          Watch the console for automated test results
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 min-w-96 text-center">
        <h2 className="text-xl font-semibold mb-2">Game Status</h2>
        <p className="text-lg font-medium">
          Current Player: {gameState.currentPlayer === 'w' ? 'White' : 'Black'}
        </p>
        <p className="text-sm text-gray-600">
          Status: {gameState.gameStatus}
        </p>
      </div>

      <SimpleChessboard
        board={gameState.board}
        onSquareClick={() => {}}
        selectedSquare={null}
      />

      <div className="bg-white rounded-lg shadow-md p-4 w-96">
        <h3 className="text-lg font-semibold mb-2">Move History</h3>
        <div className="max-h-32 overflow-y-auto">
          {gameState.moveHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No moves yet</p>
          ) : (
            <div className="text-sm font-mono">
              {gameState.moveHistory.map((move, index) => (
                <div key={index}>
                  {Math.floor(index / 2) + 1}. {move}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AutoTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <GameProvider>
        <AutoTestGame />
      </GameProvider>
    </div>
  );
}
