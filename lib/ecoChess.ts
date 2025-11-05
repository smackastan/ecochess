import { Chess, Square } from 'chess.js';
import { GameState, GameVariant, PieceType, Color, GamePiece } from '@/types/game';

// Utility functions
export function squareToCoords(square: string): [number, number] {
  const file = square.charCodeAt(0) - 97; // a-h to 0-7
  const rank = parseInt(square[1]) - 1;   // 1-8 to 0-7
  return [7 - rank, file]; // Convert to array indices (top-left origin)
}

export function coordsToSquare(row: number, col: number): string {
  const file = String.fromCharCode(97 + col); // 0-7 to a-h
  const rank = (8 - row).toString(); // Convert from array indices
  return file + rank;
}

// Convert chess.js board to our format
export function chessJsToGameBoard(chess: Chess): (GamePiece | null)[][] {
  const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = coordsToSquare(row, col) as Square;
      const piece = chess.get(square);
      if (piece) {
        board[row][col] = {
          type: piece.type as PieceType,
          color: piece.color as Color
        };
      }
    }
  }
  
  return board;
}

// Pawn Race Game Variant - only pawns, first to promote wins
export const pawnRaceVariant: GameVariant = {
  name: "Pawn Race",
  description: "Only pawns remain. First player to promote a pawn wins!",
  initialBoard: (() => {
    // Create initial board with only pawns
    const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // White pawns on rank 2 (index 6)
    for (let col = 0; col < 8; col++) {
      board[6][col] = { type: 'p', color: 'w' };
    }
    
    // Black pawns on rank 7 (index 1)
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'p', color: 'b' };
    }
    
    return board;
  })(),
  allowedPieces: ['p'],
  winCondition: (gameState: GameState) => {
    // Check if any pawn has reached the promotion rank
    for (let col = 0; col < 8; col++) {
      // White pawn promotion (reaches rank 8, index 0)
      if (gameState.board[0][col]?.type === 'p' && gameState.board[0][col]?.color === 'w') {
        return 'white-wins';
      }
      // Black pawn promotion (reaches rank 1, index 7)
      if (gameState.board[7][col]?.type === 'p' && gameState.board[7][col]?.color === 'b') {
        return 'black-wins';
      }
    }
    
    // Check if current player has no legal moves (stalemate)
    // This would require implementing move validation, for now just return playing
    return 'playing';
  },
  isValidMove: (from: string, to: string, gameState: GameState) => {
    const [fromRow, fromCol] = squareToCoords(from);
    const [toRow, toCol] = squareToCoords(to);
    
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];
    
    console.log(`\n=== VALIDATING MOVE ===`);
    console.log(`Move: ${from} (row ${fromRow}, col ${fromCol}) -> ${to} (row ${toRow}, col ${toCol})`);
    console.log(`Piece at source:`, piece);
    console.log(`Piece at target:`, targetPiece);
    console.log(`Current player:`, gameState.currentPlayer);
    
    // Must be moving your own piece
    if (!piece) {
      console.log(`❌ Failed: No piece at source`);
      return false;
    }
    
    if (piece.color !== gameState.currentPlayer) {
      console.log(`❌ Failed: Not current player's piece (piece is ${piece.color}, current player is ${gameState.currentPlayer})`);
      return false;
    }
    
    // Only pawns allowed in this variant
    if (piece.type !== 'p') {
      console.log(`❌ Failed: Not a pawn (type is ${piece.type})`);
      return false;
    }
    
    // Pawn move validation
    const direction = piece.color === 'w' ? -1 : 1; // White moves up (negative), black moves down (positive)
    const startRank = piece.color === 'w' ? 6 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    console.log(`Pawn validation: color=${piece.color}, direction=${direction}, startRank=${startRank}`);
    console.log(`Move differences: rowDiff=${rowDiff}, colDiff=${colDiff}, fromRow=${fromRow}`);
    
    // Forward move (1 square)
    console.log(`Checking forward 1: colDiff=${colDiff}===0? rowDiff=${rowDiff}===direction(${direction})? targetPiece=${targetPiece}===null?`);
    if (colDiff === 0 && rowDiff === direction && !targetPiece) {
      console.log(`✅ Valid: Forward 1 square`);
      return true;
    }
    
    // Forward move (2 squares from starting position)
    console.log(`Checking forward 2: colDiff=${colDiff}===0? rowDiff=${rowDiff}===2*direction(${2*direction})? fromRow=${fromRow}===startRank(${startRank})? targetPiece=${targetPiece}===null?`);
    if (colDiff === 0 && rowDiff === 2 * direction && fromRow === startRank && !targetPiece) {
      // Check if path is clear
      const middleRow = fromRow + direction;
      const middlePiece = gameState.board[middleRow][fromCol];
      console.log(`Checking middle square: row ${middleRow}, piece=${middlePiece}`);
      if (!middlePiece) {
        console.log(`✅ Valid: Forward 2 squares from start`);
        return true;
      } else {
        console.log(`❌ Path blocked by piece at row ${middleRow}`);
      }
    }
    
    // Diagonal capture
    console.log(`Checking diagonal capture: colDiff=${colDiff}===1? rowDiff=${rowDiff}===direction(${direction})? targetPiece exists? targetPiece.color !== piece.color?`);
    if (colDiff === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
      console.log(`✅ Valid: Diagonal capture`);
      return true;
    }
    
    console.log(`❌ Failed: No valid move pattern matched`);
    console.log(`=== END VALIDATION ===\n`);
    return false;
  }
};

// Three Pawns Game Variant - only 3 rightmost pawns, first to promote wins
export const threePawnsVariant: GameVariant = {
  name: "Three Pawns Sprint",
  description: "Only the 3 rightmost pawns remain. A faster, more intense race to promotion!",
  initialBoard: (() => {
    // Create initial board with only the 3 rightmost pawns (f, g, h files)
    const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // White pawns on rank 2 (index 6), columns 5, 6, 7 (f, g, h files)
    for (let col = 5; col < 8; col++) {
      board[6][col] = { type: 'p', color: 'w' };
    }
    
    // Black pawns on rank 7 (index 1), columns 5, 6, 7 (f, g, h files)
    for (let col = 5; col < 8; col++) {
      board[1][col] = { type: 'p', color: 'b' };
    }
    
    return board;
  })(),
  allowedPieces: ['p'],
  winCondition: (gameState: GameState) => {
    // Check if any pawn has reached the promotion rank
    for (let col = 5; col < 8; col++) {
      // White pawn promotion (reaches rank 8, index 0)
      if (gameState.board[0][col]?.type === 'p' && gameState.board[0][col]?.color === 'w') {
        return 'white-wins';
      }
      // Black pawn promotion (reaches rank 1, index 7)
      if (gameState.board[7][col]?.type === 'p' && gameState.board[7][col]?.color === 'b') {
        return 'black-wins';
      }
    }
    
    return 'playing';
  },
  isValidMove: (from: string, to: string, gameState: GameState) => {
    const [fromRow, fromCol] = squareToCoords(from);
    const [toRow, toCol] = squareToCoords(to);
    
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];
    
    console.log(`\n=== VALIDATING MOVE ===`);
    console.log(`Move: ${from} (row ${fromRow}, col ${fromCol}) -> ${to} (row ${toRow}, col ${toCol})`);
    console.log(`Piece at source:`, piece);
    console.log(`Piece at target:`, targetPiece);
    console.log(`Current player:`, gameState.currentPlayer);
    
    // Must be moving your own piece
    if (!piece) {
      console.log(`❌ Failed: No piece at source`);
      return false;
    }
    
    if (piece.color !== gameState.currentPlayer) {
      console.log(`❌ Failed: Not current player's piece (piece is ${piece.color}, current player is ${gameState.currentPlayer})`);
      return false;
    }
    
    // Only pawns allowed in this variant
    if (piece.type !== 'p') {
      console.log(`❌ Failed: Not a pawn (type is ${piece.type})`);
      return false;
    }
    
    // Pawn move validation (same as pawn race)
    const direction = piece.color === 'w' ? -1 : 1;
    const startRank = piece.color === 'w' ? 6 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    console.log(`Pawn validation: color=${piece.color}, direction=${direction}, startRank=${startRank}`);
    console.log(`Move differences: rowDiff=${rowDiff}, colDiff=${colDiff}, fromRow=${fromRow}`);
    
    // Forward move (1 square)
    if (colDiff === 0 && rowDiff === direction && !targetPiece) {
      console.log(`✅ Valid: Forward 1 square`);
      return true;
    }
    
    // Forward move (2 squares from starting position)
    if (colDiff === 0 && rowDiff === 2 * direction && fromRow === startRank && !targetPiece) {
      const middleRow = fromRow + direction;
      const middlePiece = gameState.board[middleRow][fromCol];
      if (!middlePiece) {
        console.log(`✅ Valid: Forward 2 squares from start`);
        return true;
      }
    }
    
    // Diagonal capture
    if (colDiff === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
      console.log(`✅ Valid: Diagonal capture`);
      return true;
    }
    
    console.log(`❌ Failed: No valid move pattern matched`);
    console.log(`=== END VALIDATION ===\n`);
    return false;
  }
};

export class EcoChessGame {
  private chess: Chess;
  private variant: GameVariant;
  private gameState: GameState;

  constructor(variant: GameVariant) {
    this.chess = new Chess();
    this.variant = variant;
    this.gameState = {
      board: JSON.parse(JSON.stringify(variant.initialBoard)), // Deep copy
      currentPlayer: 'w',
      gameStatus: 'playing',
      moveHistory: []
    };
    
    this.setupBoard();
  }

  private setupBoard() {
    this.chess.clear();
    
    console.log('Setting up board, gameState.board:', this.gameState.board);
    
    // Set up the custom board position for FEN display
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameState.board[row][col];
        if (piece) {
          const square = coordsToSquare(row, col) as Square;
          console.log(`Putting ${piece.color}${piece.type} on ${square}`);
          this.chess.put({ type: piece.type, color: piece.color }, square);
        }
      }
    }
    
    const fen = this.chess.fen();
    console.log('Final FEN:', fen);
  }

  public makeMove(from: string, to: string): boolean {
    if (this.gameState.gameStatus !== 'playing') {
      return false;
    }

    if (!this.variant.isValidMove(from, to, this.gameState)) {
      return false;
    }

    // Manually update the board state
    const [fromRow, fromCol] = squareToCoords(from);
    const [toRow, toCol] = squareToCoords(to);
    
    const piece = this.gameState.board[fromRow][fromCol];
    if (!piece) {
      return false;
    }

    // Make the move on our board
    this.gameState.board[toRow][toCol] = piece;
    this.gameState.board[fromRow][fromCol] = null;
    
    // Update chess.js board for FEN display
    this.chess.clear();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.gameState.board[row][col];
        if (p) {
          const square = coordsToSquare(row, col) as Square;
          this.chess.put({ type: p.type, color: p.color }, square);
        }
      }
    }
    
    // Add move to history (simple notation)
    const captureSymbol = this.gameState.board[toRow][toCol] ? 'x' : '';
    this.gameState.moveHistory.push(`${from}${captureSymbol}${to}`);
    
    // Switch player
    this.gameState.currentPlayer = this.gameState.currentPlayer === 'w' ? 'b' : 'w';
    
    // Check win condition
    this.gameState.gameStatus = this.variant.winCondition(this.gameState);
    if (this.gameState.gameStatus === 'white-wins') {
      this.gameState.winner = 'w';
    } else if (this.gameState.gameStatus === 'black-wins') {
      this.gameState.winner = 'b';
    }
    
    return true;
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getCurrentFen(): string {
    return this.chess.fen();
  }

  public resetGame(): void {
    this.gameState = {
      board: JSON.parse(JSON.stringify(this.variant.initialBoard)),
      currentPlayer: 'w',
      gameStatus: 'playing',
      moveHistory: []
    };
    this.setupBoard();
  }
}
