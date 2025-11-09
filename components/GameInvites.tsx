'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { multiplayerService, GameInvite } from '@/lib/multiplayerService';

interface GameInvitesProps {
  onClose: () => void;
  onAcceptInvite: (gameId: string) => void;
}

export default function GameInvites({ onClose, onAcceptInvite }: GameInvitesProps) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvites();

    // Subscribe to new invites AND invite updates (for when they're accepted)
    const subscribeToUpdates = async () => {
      const insertChannel = await multiplayerService.subscribeToInvites((invite) => {
        if (invite.to_user_id === user?.id) {
          loadInvites(); // Refresh the list
        }
      });

      const updateChannel = await multiplayerService.subscribeToInviteUpdates((invite) => {
        // If one of MY sent invites was accepted, reload the list
        if (invite.from_user_id === user?.id && invite.status === 'accepted') {
          loadInvites();
          // Auto-navigate to the game
          if (invite.game_id) {
            onAcceptInvite(invite.game_id);
            onClose();
          }
        }
      });

      return () => {
        insertChannel.unsubscribe();
        updateChannel.unsubscribe();
      };
    };

    const cleanup = subscribeToUpdates();

    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.());
    };
  }, [user, onAcceptInvite, onClose]);

  const loadInvites = async () => {
    setLoading(true);
    const { data } = await multiplayerService.getMyInvites();
    if (data) {
      setInvites(data);
    }
    setLoading(false);
  };

  const handleAccept = async (inviteId: string, variantName: string) => {
    // TODO: Get initial FEN from variant
    const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    const { data, error } = await multiplayerService.acceptInvite(inviteId, initialFen);
    if (data && !error) {
      onAcceptInvite(data.id);
      onClose();
    }
  };

  const handleDecline = async (inviteId: string) => {
    await multiplayerService.declineInvite(inviteId);
    loadInvites();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const receivedInvites = invites.filter((inv) => inv.to_user_email === user?.email && inv.status === 'pending');
  const sentInvites = invites.filter((inv) => inv.from_user_id === user?.id && inv.status === 'pending');
  const acceptedInvites = invites.filter((inv) => inv.from_user_id === user?.id && inv.status === 'accepted');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Game Invitations</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Received Invites */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Received ({receivedInvites.length})
                </h3>
                {receivedInvites.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending invitations</p>
                ) : (
                  <div className="space-y-3">
                    {receivedInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🎮</span>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Challenge from {invite.sender_email || invite.from_user_email || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {invite.variant_name} • {formatTime(invite.time_control)} per player
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Sent {formatDate(invite.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(invite.id, invite.variant_name)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(invite.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Invites */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Sent ({sentInvites.length})
                </h3>
                {sentInvites.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending sent invitations</p>
                ) : (
                  <div className="space-y-3">
                    {sentInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">⏳</span>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Waiting for {invite.to_user_email}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {invite.variant_name} • {formatTime(invite.time_control)} per player
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Sent {formatDate(invite.created_at)}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accepted Invites - Ready to Join */}
              {acceptedInvites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Ready to Play ({acceptedInvites.length})
                  </h3>
                  <div className="space-y-3">
                    {acceptedInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="border border-green-200 rounded-lg p-4 bg-green-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">✅</span>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {invite.to_user_email} accepted!
                                </p>
                                <p className="text-sm text-gray-600">
                                  {invite.variant_name} • {formatTime(invite.time_control)} per player
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Accepted {formatDate(invite.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (invite.game_id) {
                                onAcceptInvite(invite.game_id);
                                onClose();
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Join Game
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
