'use client';

import { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
import ChessGame from '@/components/ChessGame';
import GameSelector from '@/components/GameSelector';
import UserProfile from '@/components/UserProfile';
import GameHistory from '@/components/GameHistory';
import SendInviteModal from '@/components/SendInviteModal';
import GameInvites from '@/components/GameInvites';
import MultiplayerGameComponent from '@/components/MultiplayerGameComponent';
import { useAuth } from '@/contexts/AuthContext';
import { GameVariant } from '@/types/game';
import { pawnRaceVariant, threePawnsVariant, bishopHuntVariant } from '@/lib/ecoChess';

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState<GameVariant | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [multiplayerGameId, setMultiplayerGameId] = useState<string | null>(null);
  const { user } = useAuth();

  const allVariants = [pawnRaceVariant, threePawnsVariant, bishopHuntVariant];

  // If in multiplayer game
  if (multiplayerGameId && selectedVariant) {
    return (
      <MultiplayerGameComponent
        gameId={multiplayerGameId}
        variant={selectedVariant}
        onExit={() => {
          setMultiplayerGameId(null);
          setSelectedVariant(null);
        }}
      />
    );
  }

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {user && (
            <>
              <button
                onClick={() => setShowInvites(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>📬</span>
                <span>Invites</span>
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>🎮</span>
                <span>Play Online</span>
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>📚</span>
                <span>Game History</span>
              </button>
            </>
          )}
          <UserProfile />
        </div>
        <GameSelector onSelectGame={setSelectedVariant} />
        {showHistory && <GameHistory onClose={() => setShowHistory(false)} />}
        {showInviteModal && (
          <SendInviteModal
            onClose={() => setShowInviteModal(false)}
            onInviteSent={() => setShowInvites(true)}
            variants={allVariants}
          />
        )}
        {showInvites && (
          <GameInvites
            onClose={() => setShowInvites(false)}
            onAcceptInvite={(gameId) => {
              setMultiplayerGameId(gameId);
              // Find variant from game
              setSelectedVariant(allVariants[0]); // TODO: Get from game data
            }}
          />
        )}
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
