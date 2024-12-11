import React from 'react';
import { Square, File, Rank } from '../types/types';

const ChessBoard = () => {
  const files: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks: Rank[] = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Unicode chess pieces
  const pieces = {
    whitePawn: '♙',
    whiteRook: '♖',
    whiteKnight: '♘',
    whiteBishop: '♗',
    whiteQueen: '♕',
    whiteKing: '♔',
    blackPawn: '♟',
    blackRook: '♜',
    blackKnight: '♞',
    blackBishop: '♝',
    blackQueen: '♛',
    blackKing: '♚',
  };

  const initialBoard = {
    a8: pieces.blackRook, b8: pieces.blackKnight, c8: pieces.blackBishop, d8: pieces.blackQueen,
    e8: pieces.blackKing, f8: pieces.blackBishop, g8: pieces.blackKnight, h8: pieces.blackRook,
    a7: pieces.blackPawn, b7: pieces.blackPawn, c7: pieces.blackPawn, d7: pieces.blackPawn,
    e7: pieces.blackPawn, f7: pieces.blackPawn, g7: pieces.blackPawn, h7: pieces.blackPawn,
    a2: pieces.whitePawn, b2: pieces.whitePawn, c2: pieces.whitePawn, d2: pieces.whitePawn,
    e2: pieces.whitePawn, f2: pieces.whitePawn, g2: pieces.whitePawn, h2: pieces.whitePawn,
    a1: pieces.whiteRook, b1: pieces.whiteKnight, c1: pieces.whiteBishop, d1: pieces.whiteQueen,
    e1: pieces.whiteKing, f1: pieces.whiteBishop, g1: pieces.whiteKnight, h1: pieces.whiteRook,
  };

  const getSquareColor = (file: File, rank: Rank): string => {
    const fileIndex = files.indexOf(file);
    const rankIndex = ranks.indexOf(rank);
    return (fileIndex + rankIndex) % 2 === 0 ? 'bg-neutral-200' : 'bg-neutral-500';
  };

  const getPiece = (square: Square): string => {
    return initialBoard[square as keyof typeof initialBoard] || '';
  };

  return (
    <div className="flex flex-col items-center p-8">
      <div className="w-[560px] h-[560px] border-2 border-neutral-700">
        <div className="grid grid-cols-8 h-full">
          {ranks.map((rank) => (
            files.map((file) => {
              const square: Square = `${file}${rank}` as Square;
              return (
                <div
                  key={square}
                  className={`
                    ${getSquareColor(file, rank)}
                    flex items-center justify-center
                    text-4xl cursor-pointer
                    hover:opacity-75 transition-opacity
                  `}
                >
                  {getPiece(square)}
                </div>
              );
            })
          ))}
        </div>
      </div>
      <div className="mt-4 text-xl font-semibold">
        White to move
      </div>
    </div>
  );
};

export default ChessBoard;