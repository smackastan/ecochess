'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Chessboard = dynamic(() => import('react-chessboard').then(mod => mod.Chessboard), {
  ssr: false,
});

export default function TestPage() {
  const testFen = '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1';
  
  const handleDrop = (from: string, to: string) => {
    console.log('Piece moved from', from, 'to', to);
    return true;
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Page - Only Pawns</h1>
      <p className="mb-4">FEN: {testFen}</p>
      <div className="w-[500px] h-[500px]">
        <Chessboard
          {...({
            position: testFen,
            onPieceDrop: handleDrop,
            boardWidth: 500,
          } as any)}
        />
      </div>
    </div>
  );
}
