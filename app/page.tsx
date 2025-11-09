'use client';

import { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import ChessGame from '@/components/ChessGame';
import GameSelector from '@/components/GameSelector';
import UserProfile from '@/components/UserProfile';
import GameHistory from '@/components/GameHistory';
import { useAuth } from '@/contexts/AuthContext';
import { GameVariant } from '@/types/game';

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState<GameVariant | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {user && (
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>📚</span>
              <span>Game History</span>
            </button>
          )}
          <UserProfile />
        </div>
        <GameSelector onSelectGame={setSelectedVariant} />
        {showHistory && <GameHistory onClose={() => setShowHistory(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        {user && (
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>📚</span>
            <span>History</span>
          </button>
        )}
        <UserProfile />
      </div>
      <GameProvider key={selectedVariant.name} variant={selectedVariant}>
        <ChessGame onBackToMenu={() => setSelectedVariant(null)} />
      </GameProvider>
      {showHistory && <GameHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
}
