'use client';

import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { GameState, Color } from '@/types/game';
import { EcoChessGame, pawnRaceVariant } from '@/lib/ecoChess';

interface GameContextType {
  gameState: GameState;
  makeMove: (from: string, to: string) => boolean;
  resetGame: () => void;
  getCurrentFen: () => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction = 
  | { type: 'MAKE_MOVE'; from: string; to: string }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_STATE'; gameState: GameState };

interface GameProviderState {
  game: EcoChessGame;
  gameState: GameState;
}

function gameReducer(state: GameProviderState, action: GameAction): GameProviderState {
  switch (action.type) {
    case 'MAKE_MOVE':
      console.log('GameContext: Making move', action.from, 'to', action.to);
      console.log('GameContext: Current state before move:', JSON.stringify(state.gameState));
      const success = state.game.makeMove(action.from, action.to);
      console.log('GameContext: Move success?', success);
      if (success) {
        const newState = state.game.getGameState();
        console.log('GameContext: New state after move:', JSON.stringify(newState));
        return {
          ...state,
          gameState: newState
        };
      }
      console.log('GameContext: Move failed, returning old state');
      return state;
    
    case 'RESET_GAME':
      state.game.resetGame();
      return {
        ...state,
        gameState: state.game.getGameState()
      };
    
    case 'UPDATE_STATE':
      return {
        ...state,
        gameState: action.gameState
      };
    
    default:
      return state;
  }
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Initialize game instance only once with useMemo
  const game = useMemo(() => new EcoChessGame(pawnRaceVariant), []);
  
  const [state, dispatch] = useReducer(gameReducer, {
    game,
    gameState: game.getGameState()
  });

  const makeMove = (from: string, to: string): boolean => {
    // Use the reducer to handle the move
    // Note: We can't get the return value synchronously due to useReducer's async nature
    // So we check the game instance directly first
    const gameBefore = state.game.getGameState();
    const isValid = state.game.makeMove(from, to);
    
    // Update React state to match the game instance state
    dispatch({ type: 'UPDATE_STATE', gameState: state.game.getGameState() });
    
    return isValid;
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const getCurrentFen = () => {
    return state.game.getCurrentFen();
  };

  const contextValue: GameContextType = {
    gameState: state.gameState,
    makeMove,
    resetGame,
    getCurrentFen
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
