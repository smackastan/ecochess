import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MultiplayerGame {
  id: string;
  variant_name: string;
  game_status: 'waiting' | 'active' | 'completed' | 'timeout' | 'forfeit';
  winner_color?: 'w' | 'b';
  time_control: number;
  current_fen: string;
  move_history: string[];
  current_turn: 'w' | 'b';
  white_player_id?: string;
  black_player_id?: string;
  white_time_remaining?: number;
  black_time_remaining?: number;
  last_move_at?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface GameInvite {
  id: string;
  from_user_id: string;
  from_user_email?: string; // Deprecated: use sender_email instead
  sender_email?: string; // From game_invites_with_users view
  to_user_email: string;
  to_user_id?: string; // Auto-populated by database trigger
  variant_name: string;
  time_control: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  game_id?: string;
  created_at: string;
  expires_at: string;
}

export class MultiplayerService {
  private supabase = createClient();
  private gameChannel: RealtimeChannel | null = null;

  // Create a new game and invite a friend
  async createGameInvite(
    toUserEmail: string,
    variantName: string,
    timeControl: number = 600
  ): Promise<{ data: GameInvite | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Note: We can't query auth.users directly from the client
    // Instead, we'll just store the email and let the recipient claim it when they log in
    const inviteData = {
      from_user_id: user.id,
      to_user_email: toUserEmail.toLowerCase().trim(), // Normalize email
      variant_name: variantName,
      time_control: timeControl,
    };

    const { data, error } = await this.supabase
      .from('game_invites')
      .insert(inviteData)
      .select()
      .single();

    return { data, error };
  }

  // Get pending invites for current user (with sender email)
  async getMyInvites(): Promise<{ data: any[] | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Use the view that includes sender email
    const { data, error } = await this.supabase
      .from('game_invites_with_users')
      .select('*')
      .or(`to_user_email.eq.${user.email},from_user_id.eq.${user.id}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  // Accept a game invite
  async acceptInvite(
    inviteId: string,
    initialFen: string
  ): Promise<{ data: MultiplayerGame | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get the invite
    const { data: invite, error: inviteError } = await this.supabase
      .from('game_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return { data: null, error: inviteError || new Error('Invite not found') };
    }

    // Create the multiplayer game
    const gameData = {
      variant_name: invite.variant_name,
      time_control: invite.time_control,
      current_fen: initialFen,
      white_player_id: invite.from_user_id,
      black_player_id: user.id,
      white_time_remaining: invite.time_control,
      black_time_remaining: invite.time_control,
      game_status: 'active' as const,
      last_move_at: new Date().toISOString(),
    };

    const { data: game, error: gameError } = await this.supabase
      .from('multiplayer_games')
      .insert(gameData)
      .select()
      .single();

    if (gameError || !game) {
      return { data: null, error: gameError };
    }

    // Update invite status
    await this.supabase
      .from('game_invites')
      .update({ status: 'accepted', game_id: game.id })
      .eq('id', inviteId);

    return { data: game, error: null };
  }

  // Decline an invite
  async declineInvite(inviteId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('game_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    return { error };
  }

  // Get a specific game
  async getGame(gameId: string): Promise<{ data: MultiplayerGame | null; error: any }> {
    const { data, error } = await this.supabase
      .from('multiplayer_games')
      .select('*')
      .eq('id', gameId)
      .single();

    return { data, error };
  }

  // Get active games for current user
  async getMyGames(): Promise<{ data: MultiplayerGame[] | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await this.supabase
      .from('multiplayer_games')
      .select('*')
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .in('game_status', ['waiting', 'active'])
      .order('created_at', { ascending: false });

    return { data, error };
  }

  // Make a move in a multiplayer game
  async makeMove(
    gameId: string,
    newFen: string,
    move: string,
    timeRemaining: number
  ): Promise<{ data: MultiplayerGame | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get current game state
    const { data: game, error: getError } = await this.getGame(gameId);
    if (getError || !game) {
      return { data: null, error: getError || new Error('Game not found') };
    }

    // Determine whose turn it is and update times
    const isWhite = game.white_player_id === user.id;
    const newTurn = game.current_turn === 'w' ? 'b' : 'w';
    
    const updateData: any = {
      current_fen: newFen,
      move_history: [...game.move_history, move],
      current_turn: newTurn,
      last_move_at: new Date().toISOString(),
    };

    // Update the time for the player who just moved
    if (isWhite) {
      updateData.white_time_remaining = timeRemaining;
    } else {
      updateData.black_time_remaining = timeRemaining;
    }

    const { data, error } = await this.supabase
      .from('multiplayer_games')
      .update(updateData)
      .eq('id', gameId)
      .select()
      .single();

    return { data, error };
  }

  // End game (checkmate, timeout, forfeit)
  async endGame(
    gameId: string,
    winnerColor: 'w' | 'b',
    endType: 'completed' | 'timeout' | 'forfeit'
  ): Promise<{ data: MultiplayerGame | null; error: any }> {
    const { data, error } = await this.supabase
      .from('multiplayer_games')
      .update({
        game_status: endType,
        winner_color: winnerColor,
        completed_at: new Date().toISOString(),
      })
      .eq('id', gameId)
      .select()
      .single();

    return { data, error };
  }

  // Subscribe to game updates
  subscribeToGame(
    gameId: string,
    callback: (game: MultiplayerGame) => void
  ): RealtimeChannel {
    this.gameChannel = this.supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'multiplayer_games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          callback(payload.new as MultiplayerGame);
        }
      )
      .subscribe();

    return this.gameChannel;
  }

  // Unsubscribe from game updates
  unsubscribeFromGame() {
    if (this.gameChannel) {
      this.supabase.removeChannel(this.gameChannel);
      this.gameChannel = null;
    }
  }

  // Subscribe to invites
  async subscribeToInvites(callback: (invite: GameInvite) => void): Promise<RealtimeChannel> {
    const { data: { user } } = await this.supabase.auth.getUser();

    const channel = this.supabase
      .channel('invites')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_invites',
        },
        (payload) => {
          const invite = payload.new as GameInvite;
          callback(invite);
        }
      )
      .subscribe();

    return channel;
  }
}

export const multiplayerService = new MultiplayerService();
