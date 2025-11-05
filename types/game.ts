// Game types for ecological chess variants

export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface GamePiece {
  type: PieceType;
  color: Color;
}

export interface GameState {
  board: (GamePiece | null)[][];
  currentPlayer: Color;
  gameStatus: 'playing' | 'white-wins' | 'black-wins' | 'draw';
  winner?: Color;
  moveHistory: string[];
}

export interface GameVariant {
  name: string;
  description: string;
  initialBoard: (GamePiece | null)[][];
  allowedPieces: PieceType[];
  winCondition: (gameState: GameState) => 'playing' | 'white-wins' | 'black-wins' | 'draw';
  isValidMove: (from: string, to: string, gameState: GameState) => boolean;
}

export interface Move {
  from: string;
  to: string;
  piece: GamePiece;
  captured?: GamePiece;
  promotion?: PieceType;
}
