'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameService, SavedGame } from '@/lib/gameService';

interface GameHistoryProps {
  onClose: () => void;
  onLoadGame?: (game: SavedGame) => void;
}

export default function GameHistory({ onClose, onLoadGame }: GameHistoryProps) {
  const { user } = useAuth();
  const [games, setGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, draws: 0 });

  useEffect(() => {
    loadGames();
    loadStats();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    const { data, error } = await gameService.getUserGames();
    if (data) {
      setGames(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const { data } = await gameService.getGameStats();
    if (data) {
      setStats(data);
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    const { error } = await gameService.deleteGame(gameId);
    if (!error) {
      setGames(games.filter((g) => g.id !== gameId));
      loadStats(); // Refresh stats
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'white-wins':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Win</span>;
      case 'black-wins':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Loss</span>;
      case 'draw':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Draw</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Game History</h2>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
            <div className="text-sm text-gray-600">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
            <div className="text-sm text-gray-600">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.draws}</div>
            <div className="text-sm text-gray-600">Draws</div>
          </div>
        </div>

        {/* Games List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No games played yet</p>
              <p className="text-gray-400 text-sm mt-2">Start playing to see your game history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{game.variant_name}</h3>
                        {getStatusBadge(game.game_status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {formatDate(game.created_at)}</span>
                        <span>🎯 {game.moves_count} moves</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Uncomment if you want to add a view/load feature later
                      {onLoadGame && (
                        <button
                          onClick={() => onLoadGame(game)}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                      )}
                      */}
                      <button
                        onClick={() => deleteGame(game.id)}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Move History Preview */}
                  {game.move_history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Moves:</p>
                      <p className="text-sm text-gray-700 font-mono truncate">
                        {game.move_history.slice(0, 10).join(', ')}
                        {game.move_history.length > 10 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
