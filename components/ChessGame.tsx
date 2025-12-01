'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import SimpleChessboard from './SimpleChessboard';
import { coordsToSquare } from '@/lib/ecoChess';

interface ChessGameProps {
  onBackToMenu?: () => void;
}

export default function ChessGame({ onBackToMenu }: ChessGameProps) {
  const { gameState, makeMove, resetGame, variantName } = useGame();
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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

  const getHowToPlayContent = () => {
    switch (variantName) {
      case 'Pawn Race':
        return {
          objective: {
            white: 'Promote one of your pawns to a queen by reaching the 8th rank (top of the board).',
            black: 'Promote one of your pawns to a queen by reaching the 1st rank (bottom of the board).',
          },
          rules: [
            'All 8 pawns start in their normal positions',
            'Pawns move forward one square (or two squares from starting position)',
            'Pawns capture diagonally one square',
            'En passant captures are allowed',
            'First player to promote a pawn wins!',
          ],
        };
      case 'Three Pawns Sprint':
        return {
          objective: {
            white: 'Promote one of your 3 pawns to a queen by reaching the 8th rank.',
            black: 'Promote one of your 3 pawns to a queen by reaching the 1st rank.',
          },
          rules: [
            'Only 3 pawns per side on the kingside (f, g, h files)',
            'Pawns move forward one square (or two squares from starting position)',
            'Pawns capture diagonally one square',
            'En passant captures are allowed',
            'Faster-paced with fewer pawns to manage!',
          ],
        };
      case 'Two Pawns Duel':
        return {
          objective: {
            white: 'Promote one of your 2 pawns to a queen by reaching the 8th rank.',
            black: 'Promote one of your 2 pawns to a queen by reaching the 1st rank.',
          },
          rules: [
            'Only 2 pawns per side (e and d files)',
            'Pawns move forward one square (or two squares from starting position)',
            'Pawns capture diagonally one square',
            'En passant captures are allowed',
            'Ultra-tactical endgame with minimal material!',
          ],
        };
      default:
        return {
          objective: {
            white: 'Promote your pawn to win the game.',
            black: 'Promote your pawn to win the game.',
          },
          rules: [
            'Move your pawns strategically to reach the opposite end',
            'First to promote wins!',
          ],
        };
    }
  };

  const howToPlay = getHowToPlayContent();

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Chess Board and Logo */}
      <div className="flex-1 flex flex-col">
        {/* Top Section with Logo */}
        <div className="p-4">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg transition-colors flex items-center gap-2 shadow-sm text-xl font-bold"
            >
              🌱 Eco Chess
            </button>
          )}
        </div>

        {/* Chess Board */}
        <div className="flex-1 flex items-center justify-center p-8">
          <SimpleChessboard
            board={gameState.board}
            onSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
          />
        </div>
      </div>

      {/* Right Side Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Game Status */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Game Status</h2>
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
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
            >
              Play Again
            </button>
          )}
        </div>

        {/* How to Play Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold">How to Play</h3>
            <span className="text-2xl text-gray-400">
              {showHowToPlay ? '−' : '+'}
            </span>
          </button>
          
          {showHowToPlay && (
            <div className="px-6 pb-6 space-y-4">
              {/* Objective */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Objective:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-blue-600 font-medium">White:</span>
                    <span className="text-gray-600">{howToPlay.objective.white}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-600 font-medium">Black:</span>
                    <span className="text-gray-600">{howToPlay.objective.black}</span>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Rules:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {howToPlay.rules.map((rule, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-green-600">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Move History */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Move History</h3>
          {gameState.moveHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No moves yet</p>
          ) : (
            <div className="space-y-1">
              {gameState.moveHistory.map((move, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-gray-500 w-12 text-sm">
                    {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                  </span>
                  <span className={`text-sm font-medium ${index % 2 === 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {move}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
