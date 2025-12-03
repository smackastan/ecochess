'use client';

import React from 'react';
import { GamePiece } from '@/types/game';

interface SimpleChessboardProps {
  board: (GamePiece | null)[][];
  onSquareClick: (row: number, col: number) => void;
  selectedSquare: [number, number] | null;
}

const pieceSymbols: Record<string, string> = {
  'wp': '♙',
  'wn': '♘',
  'wb': '♗',
  'wr': '♖',
  'wq': '♕',
  'wk': '♔',
  'bp': '♟',
  'bn': '♞',
  'bb': '♝',
  'br': '♜',
  'bq': '♛',
  'bk': '♚',
};

export default function SimpleChessboard({ board, onSquareClick, selectedSquare }: SimpleChessboardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;
  
  const isSelected = (row: number, col: number) => 
    selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;

  return (
    <div className="inline-block border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((piece, colIndex) => {
            const lightSquare = isLightSquare(rowIndex, colIndex);
            const selected = isSelected(rowIndex, colIndex);
            
            return (
              <div
                key={colIndex}
                onClick={() => onSquareClick(rowIndex, colIndex)}
                className={`
                  w-16 h-16 flex items-center justify-center cursor-pointer
                  transition-all duration-150
                  ${lightSquare ? 'bg-amber-100' : 'bg-amber-700'}
                  ${selected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                  hover:brightness-110
                `}
              >
                {piece && (
                  <span className={`text-5xl select-none ${piece.color === 'w' ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]' : 'text-black'}`}>
                    {pieceSymbols[`${piece.color}${piece.type}`]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Coordinates */}
      <div className="flex justify-around bg-gray-800 text-white text-xs py-1">
        {files.map(file => (
          <span key={file} className="w-16 text-center">{file}</span>
        ))}
      </div>
    </div>
  );
}
