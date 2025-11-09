import { createClient } from '@/lib/supabase/client';
import { GameState } from '@/types/game';

export interface SavedGame {
  id: string;
  user_id: string;
  variant_name: string;
  game_status: 'playing' | 'white-wins' | 'black-wins' | 'draw';
  winner?: 'w' | 'b';
  move_history: string[];
  final_fen?: string;
  moves_count: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export class GameService {
  private supabase = createClient();

  async saveGame(
    variantName: string,
    gameState: GameState,
    finalFen?: string
  ): Promise<{ data: SavedGame | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const gameData = {
      user_id: user.id,
      variant_name: variantName,
      game_status: gameState.gameStatus,
      winner: gameState.winner,
      move_history: gameState.moveHistory,
      final_fen: finalFen,
      moves_count: gameState.moveHistory.length,
      completed_at: gameState.gameStatus !== 'playing' ? new Date().toISOString() : null,
    };

    const { data, error } = await this.supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    return { data, error };
  }

  async updateGame(
    gameId: string,
    gameState: GameState,
    finalFen?: string
  ): Promise<{ data: SavedGame | null; error: any }> {
    const updateData = {
      game_status: gameState.gameStatus,
      winner: gameState.winner,
      move_history: gameState.moveHistory,
      final_fen: finalFen,
      moves_count: gameState.moveHistory.length,
      completed_at: gameState.gameStatus !== 'playing' ? new Date().toISOString() : null,
    };

    const { data, error } = await this.supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId)
      .select()
      .single();

    return { data, error };
  }

  async getUserGames(limit = 50): Promise<{ data: SavedGame[] | null; error: any }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await this.supabase
      .from('games')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  async getGame(gameId: string): Promise<{ data: SavedGame | null; error: any }> {
    const { data, error } = await this.supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    return { data, error };
  }

  async deleteGame(gameId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('games')
      .delete()
      .eq('id', gameId);

    return { error };
  }

  async getGameStats(): Promise<{
    data: {
      total: number;
      wins: number;
      losses: number;
      draws: number;
    } | null;
    error: any;
  }> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await this.supabase
      .from('games')
      .select('game_status, winner')
      .eq('user_id', user.id);

    if (error) return { data: null, error };

    const stats = {
      total: data?.length || 0,
      wins: data?.filter((g) => g.game_status === 'white-wins' && g.winner === 'w').length || 0,
      losses: data?.filter((g) => g.game_status === 'black-wins' && g.winner === 'b').length || 0,
      draws: data?.filter((g) => g.game_status === 'draw').length || 0,
    };

    return { data: stats, error: null };
  }
}

export const gameService = new GameService();
