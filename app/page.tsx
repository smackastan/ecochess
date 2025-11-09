'use client';

import { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import ChessGame from '@/components/ChessGame';
import GameSelector from '@/components/GameSelector';
import UserProfile from '@/components/UserProfile';
import { GameVariant } from '@/types/game';

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState<GameVariant | null>(null);

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute top-4 right-4 z-10">
          <UserProfile />
        </div>
        <GameSelector onSelectGame={setSelectedVariant} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="absolute top-4 right-4 z-10">
        <UserProfile />
      </div>
      <GameProvider key={selectedVariant.name} variant={selectedVariant}>
        <ChessGame onBackToMenu={() => setSelectedVariant(null)} />
      </GameProvider>
    </div>
  );
}
