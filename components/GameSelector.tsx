'use client';

import React from 'react';
import { GameVariant } from '@/types/game';

interface GameSelectorProps {
  onSelectGame: (variant: GameVariant) => void;
}

interface GameCardProps {
  title: string;
  description: string;
  emoji: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: string;
  estimatedTime: string;
  onClick: () => void;
}

function GameCard({ title, description, emoji, difficulty, playerCount, estimatedTime, onClick }: GameCardProps) {
  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800',
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-green-400 transform hover:-translate-y-1 p-6"
    >
      <div className="text-6xl mb-4 text-center">{emoji}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{title}</h3>
      <p className="text-gray-600 mb-4 text-center min-h-[3rem]">{description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Difficulty:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Players:</span>
          <span className="font-medium text-gray-700">{playerCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Time:</span>
          <span className="font-medium text-gray-700">{estimatedTime}</span>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors">
        Play Now
      </button>
    </div>
  );
}

export default function GameSelector({ onSelectGame }: GameSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌱 Eco Chess
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master chess through constraint-based mini-games. Choose your challenge and race to victory!
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <GameCard
            title="Pawn Race"
            description="All 8 pawns race to promotion. Classic endgame training with full board action!"
            emoji="♟️"
            difficulty="Easy"
            playerCount="2 Players"
            estimatedTime="5-10 min"
            onClick={() => {
              // We'll import the variant dynamically
              import('@/lib/ecoChess').then(({ pawnRaceVariant }) => {
                onSelectGame(pawnRaceVariant);
              });
            }}
          />
          
          <GameCard
            title="Three Pawns Sprint"
            description="Only 3 pawns per side on the kingside. Fast-paced tactical race!"
            emoji="🏃"
            difficulty="Medium"
            playerCount="2 Players"
            estimatedTime="3-5 min"
            onClick={() => {
              import('@/lib/ecoChess').then(({ threePawnsVariant }) => {
                onSelectGame(threePawnsVariant);
              });
            }}
          />
          
          <GameCard
            title="Bishop Hunt"
            description="Can 3 black pawns promote before the white bishop hunts them all down?"
            emoji="♗"
            difficulty="Hard"
            playerCount="2 Players"
            estimatedTime="5-8 min"
            onClick={() => {
              import('@/lib/ecoChess').then(({ bishopHuntVariant }) => {
                onSelectGame(bishopHuntVariant);
              });
            }}
          />
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 What is Eco Chess?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🎲</div>
              <h3 className="font-semibold text-gray-800 mb-2">Constraint-Based</h3>
              <p className="text-gray-600 text-sm">
                Each game removes pieces and adds unique rules, focusing your skills on specific scenarios.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Quick Games</h3>
              <p className="text-gray-600 text-sm">
                Finish a complete game in minutes. Perfect for learning or a quick chess fix!
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-semibold text-gray-800 mb-2">Skill Building</h3>
              <p className="text-gray-600 text-sm">
                Master specific endgame patterns and tactics through focused practice.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">🔮 Coming Soon</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">Knights Only</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">King & Pawns Endgame</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">Bishops vs Knights</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">Rook Endgame Trainer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
