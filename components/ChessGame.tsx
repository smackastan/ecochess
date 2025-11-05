'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import SimpleChessboard from './SimpleChessboard';
import { coordsToSquare } from '@/lib/ecoChess';

export default function ChessGame() {
  const { gameState, makeMove, resetGame } = useGame();
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);

  useEffect(() => {
    console.log('Game state updated:', gameState);
  }, [gameState]);

  const handleSquareClick = (row: number, col: number) => {
    const piece = gameState.board[row][col];
    
    console.log(`\n=== SQUARE CLICKED ===`);
    console.log(`Clicked: row=${row}, col=${col}, square=${coordsToSquare(row, col)}`);
    console.log(`Piece at square:`, piece);
    console.log(`Current player:`, gameState.currentPlayer);
    console.log(`Selected square:`, selectedSquare);
    
    // If no square selected, select this square (if it has a piece of the current player)
    if (!selectedSquare) {
      console.log(`No square selected yet`);
      if (piece && piece.color === gameState.currentPlayer) {
        setSelectedSquare([row, col]);
        console.log(`✅ Selected square: ${coordsToSquare(row, col)}`);
      } else if (piece) {
        console.log(`❌ Cannot select: piece is ${piece.color}, current player is ${gameState.currentPlayer}`);
      } else {
        console.log(`❌ Cannot select: no piece at this square`);
      }
      console.log(`=== END SQUARE CLICK ===\n`);
      return;
    }
    
    // If clicking the same square, deselect
    if (selectedSquare[0] === row && selectedSquare[1] === col) {
      console.log(`Deselecting square`);
      setSelectedSquare(null);
      console.log(`=== END SQUARE CLICK ===\n`);
      return;
    }
    
    // Try to make a move
    const fromSquare = coordsToSquare(selectedSquare[0], selectedSquare[1]);
    const toSquare = coordsToSquare(row, col);
    
    console.log(`Attempting move: ${fromSquare} to ${toSquare}`);
    const success = makeMove(fromSquare, toSquare);
    console.log(`Move ${success ? 'succeeded ✅' : 'failed ❌'}`);
    
    // Clear selection after attempting move
    setSelectedSquare(null);
    console.log(`=== END SQUARE CLICK ===\n`);
  };

  const getStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'white-wins':
        return '🎉 White wins by promotion!';
      case 'black-wins':
        return '🎉 Black wins by promotion!';
      case 'draw':
        return '🤝 Game is a draw';
      default:
        return `${gameState.currentPlayer === 'w' ? 'White' : 'Black'} to move`;
    }
  };

  const getPlayerColor = (player: 'w' | 'b') => {
    return player === 'w' ? 'text-blue-600' : 'text-red-600';
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Game Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🌱 Eco Chess: Pawn Race
        </h1>
        <p className="text-gray-600 max-w-md">
          Only pawns remain! Race to promote your pawn first to win.
        </p>
      </div>

      {/* Game Status */}
      <div className="bg-white rounded-lg shadow-md p-4 min-w-96 text-center">
        <h2 className="text-xl font-semibold mb-2">Game Status</h2>
        <p className={`text-lg font-medium ${
          gameState.gameStatus === 'playing' 
            ? getPlayerColor(gameState.currentPlayer)
            : 'text-green-600'
        }`}>
          {getStatusMessage()}
        </p>
        
        {gameState.gameStatus !== 'playing' && (
          <button
            onClick={resetGame}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        )}
      </div>

      {/* Chess Board */}
      <div className="flex justify-center">
        <SimpleChessboard
          board={gameState.board}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
        />
      </div>

      {/* Move History */}
      {gameState.moveHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 w-96">
          <h3 className="text-lg font-semibold mb-2">Move History</h3>
          <div className="max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {gameState.moveHistory.map((move, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-500 w-8">
                    {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                  </span>
                  <span className={index % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                    {move}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
