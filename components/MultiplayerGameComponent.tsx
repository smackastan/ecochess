'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { multiplayerService, MultiplayerGame } from '@/lib/multiplayerService';
import { EcoChessGame, coordsToSquare, squareToCoords } from '@/lib/ecoChess';
import { GameVariant } from '@/types/game';
import SimpleChessboard from './SimpleChessboard';

interface MultiplayerGameComponentProps {
  gameId: string;
  variant: GameVariant;
  onExit: () => void;
}

export default function MultiplayerGameComponent({
  gameId,
  variant,
  onExit,
}: MultiplayerGameComponentProps) {
  const { user } = useAuth();
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [chessGame, setChessGame] = useState<EcoChessGame | null>(null);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveTimeRef = useRef<number>(Date.now());

  const isWhitePlayer = game?.white_player_id === user?.id;
  const isMyTurn = game?.current_turn === (isWhitePlayer ? 'w' : 'b');
  const myColor = isWhitePlayer ? 'w' : 'b';

  useEffect(() => {
    console.log('[Multiplayer] Loading game:', gameId);
    loadGame();

    // Subscribe to real-time updates
    console.log('[Multiplayer] Setting up realtime subscription for game:', gameId);
    const channel = multiplayerService.subscribeToGame(gameId, (updatedGame) => {
      console.log('[Multiplayer] Received game update:', updatedGame);
      setGame(updatedGame);
      if (chessGame) {
        // Update the chess game state with the new FEN
        // Note: You might need to add a method to your EcoChessGame class to load from FEN
        updateChessGameFromFen(updatedGame.current_fen);
      }
      lastMoveTimeRef.current = Date.now();
    });

    return () => {
      console.log('[Multiplayer] Cleaning up subscription for game:', gameId);
      multiplayerService.unsubscribeFromGame();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId]);

  useEffect(() => {
    if (game) {
      setWhiteTime(game.white_time_remaining || 0);
      setBlackTime(game.black_time_remaining || 0);

      // Start timer
      if (game.game_status === 'active' && !timerRef.current) {
        startTimer();
      }
    }
  }, [game]);

  const loadGame = async () => {
    const { data } = await multiplayerService.getGame(gameId);
    if (data) {
      setGame(data);
      // Initialize chess game with current FEN
      const newChessGame = new EcoChessGame(variant);
      if (data.current_fen) {
        // Load position from FEN
        newChessGame.loadFromFen(data.current_fen);
      }
      setChessGame(newChessGame);
      lastMoveTimeRef.current = data.last_move_at ? new Date(data.last_move_at).getTime() : Date.now();
    }
  };

  const updateChessGameFromFen = (fen: string) => {
    if (!chessGame) return;
    
    // Load the FEN into the existing chess game
    chessGame.loadFromFen(fen);
    // Force a re-render by creating a new instance
    const newChessGame = new EcoChessGame(variant);
    newChessGame.loadFromFen(fen);
    setChessGame(newChessGame);
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!game || game.game_status !== 'active') return;

      const now = Date.now();
      const lastMove = lastMoveTimeRef.current;
      const elapsedSeconds = Math.floor((now - lastMove) / 1000);

      if (game.current_turn === 'w') {
        const newTime = Math.max(0, (game.white_time_remaining || 0) - elapsedSeconds);
        setWhiteTime(newTime);
        if (newTime === 0 && isWhitePlayer) {
          handleTimeout();
        }
      } else {
        const newTime = Math.max(0, (game.black_time_remaining || 0) - elapsedSeconds);
        setBlackTime(newTime);
        if (newTime === 0 && !isWhitePlayer) {
          handleTimeout();
        }
      }
    }, 100);
  };

  const handleTimeout = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const winnerColor = myColor === 'w' ? 'b' : 'w';
    await multiplayerService.endGame(gameId, winnerColor, 'timeout');
  };

  const handleMove = async (sourceSquare: string, targetSquare: string) => {
    if (!chessGame || !game || !isMyTurn || game.game_status !== 'active') {
      console.log('[Multiplayer] Move blocked:', { 
        hasChessGame: !!chessGame, 
        hasGame: !!game, 
        isMyTurn, 
        gameStatus: game?.game_status 
      });
      return false;
    }

    console.log('[Multiplayer] Attempting move:', { sourceSquare, targetSquare });
    const moveSuccessful = chessGame.makeMove(sourceSquare, targetSquare);
    if (!moveSuccessful) {
      console.log('[Multiplayer] Move failed - invalid move');
      return false;
    }

    const newFen = chessGame.getCurrentFen();
    const moveNotation = `${sourceSquare}${targetSquare}`;
    const timeRemaining = myColor === 'w' ? whiteTime : blackTime;

    console.log('[Multiplayer] Sending move to server:', { newFen, moveNotation, timeRemaining });
    const result = await multiplayerService.makeMove(gameId, newFen, moveNotation, timeRemaining);
    
    if (result.error) {
      console.error('[Multiplayer] Error sending move:', result.error);
    } else {
      console.log('[Multiplayer] Move sent successfully');
    }

    // Check for game end
    const gameState = chessGame.getGameState();
    if (gameState.gameStatus !== 'playing') {
      const winnerColor = gameState.winner || (myColor === 'w' ? 'w' : 'b');
      await multiplayerService.endGame(gameId, winnerColor, 'completed');
    }

    return true;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!chessGame || !game || !isMyTurn || game.game_status !== 'active') {
      return;
    }

    const gameState = chessGame.getGameState();
    const piece = gameState.board[row][col];
    
    // If no square selected, select this square (if it has a piece of the current player)
    if (!selectedSquare) {
      if (piece && piece.color === gameState.currentPlayer) {
        setSelectedSquare([row, col]);
      }
      return;
    }
    
    // If clicking the same square, deselect
    if (selectedSquare[0] === row && selectedSquare[1] === col) {
      setSelectedSquare(null);
      return;
    }
    
    // Try to make a move
    const fromSquare = coordsToSquare(selectedSquare[0], selectedSquare[1]);
    const toSquare = coordsToSquare(row, col);
    
    handleMove(fromSquare, toSquare);
    setSelectedSquare(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!game || !chessGame) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const gameStatusText = () => {
    if (game.game_status === 'waiting') return 'Waiting for opponent...';
    if (game.game_status === 'timeout') return `Time out! ${game.winner_color === 'w' ? 'White' : 'Black'} wins!`;
    if (game.game_status === 'completed') return `Game over! ${game.winner_color === 'w' ? 'White' : 'Black'} wins!`;
    if (game.game_status === 'forfeit') return `${game.winner_color === 'w' ? 'White' : 'Black'} wins by forfeit!`;
    if (isMyTurn) return "Your turn";
    return "Opponent's turn";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{variant.name}</h1>
            <p className="text-gray-600">{gameStatusText()}</p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Exit Game
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chessboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              {chessGame && (
                <div style={{ transform: !isWhitePlayer ? 'rotate(180deg)' : 'none' }}>
                  <SimpleChessboard
                    board={chessGame.getGameState().board}
                    onSquareClick={handleSquareClick}
                    selectedSquare={selectedSquare}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-4">
            {/* Black Player */}
            <div className={`bg-white rounded-lg shadow-lg p-4 ${game.current_turn === 'b' ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Black</p>
                    <p className="text-xs text-gray-500">{!isWhitePlayer ? 'You' : 'Opponent'}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${blackTime < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                  {formatTime(blackTime)}
                </div>
              </div>
            </div>

            {/* White Player */}
            <div className={`bg-white rounded-lg shadow-lg p-4 ${game.current_turn === 'w' ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-800"></div>
                  <div>
                    <p className="font-semibold text-gray-800">White</p>
                    <p className="text-xs text-gray-500">{isWhitePlayer ? 'You' : 'Opponent'}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${whiteTime < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                  {formatTime(whiteTime)}
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Move History</h3>
              <div className="max-h-64 overflow-y-auto">
                {game.move_history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No moves yet</p>
                ) : (
                  <div className="space-y-1">
                    {game.move_history.map((move, index) => (
                      <div key={index} className="text-sm text-gray-700 font-mono">
                        {Math.floor(index / 2) + 1}. {move}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Game Status */}
            {game.game_status !== 'active' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-center font-semibold text-blue-800">
                  {gameStatusText()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
