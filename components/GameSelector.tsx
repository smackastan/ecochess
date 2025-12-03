'use client';

import React, { useState } from 'react';
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
      <p className="text-gray-600 mb-4 text-center min-h-[3rem] text-balance">{description}</p>
      
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
  const [showAbout, setShowAbout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
      {/* Top Buttons - Outside container to reach edges */}
      <div className="flex justify-between items-center mb-8 px-8">
        {/* Left side - Settings */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md font-semibold"
            title="Settings"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Right side - About and Profile */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md font-semibold"
            title="About"
          >
            ℹ️ About
          </button>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md font-semibold"
            title="Profile"
          >
            👤 Profile
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌱 Eco Chess
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master chess through constraint-based mini-games.<br />
            Choose your challenge and race to victory!
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <GameCard
            title="Pawn Race"
            description="All 8 pawns race to promotion. Classic endgame training!"
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
            description="Only 3 pawns per side. Fast-paced tactical race!"
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
            description="Can 3 black pawns promote before the bishop hunts them?"
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

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">ℹ️ About Eco Chess</h2>
            <div className="space-y-3 text-gray-600 mb-6">
              <p>
                <strong className="text-gray-800">Eco Chess</strong> is a minimalist chess variant game focusing on pawn-only battles.
              </p>
              <p>
                Race your pawns to the opposite end of the board to promote and win! Play against friends or challenge our bot opponent.
              </p>
            </div>

            {/* What is Eco Chess Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 What is Eco Chess?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">🎲</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Constraint-Based</h4>
                  <p className="text-gray-600 text-sm">
                    Each game removes pieces and adds unique rules, focusing your skills on specific scenarios.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Quick Games</h4>
                  <p className="text-gray-600 text-sm">
                    Finish a complete game in minutes. Perfect for learning or a quick chess fix!
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🧠</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Skill Building</h4>
                  <p className="text-gray-600 text-sm">
                    Master specific endgame patterns and tactics through focused practice.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mb-4">
              Version 1.0.0 • Created with Next.js & TypeScript
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProfile(false)}>
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">👤 Player Profile</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Player Name</p>
                <p className="text-lg font-semibold text-gray-800">Guest Player</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Games Played</p>
                <p className="text-lg font-semibold text-gray-800">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Wins</p>
                <p className="text-lg font-semibold text-green-600">0</p>
              </div>
              <p className="text-xs text-gray-500 text-center pt-2">
                Stats are stored locally in your browser
              </p>
            </div>
            <button
              onClick={() => setShowProfile(false)}
              className="mt-6 w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">⚙️ Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-800 font-medium">Sound Effects</span>
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-semibold">
                  Coming Soon
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-800 font-medium">Board Theme</span>
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-semibold">
                  Default
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-800 font-medium">Animation Speed</span>
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-semibold">
                  Normal
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
