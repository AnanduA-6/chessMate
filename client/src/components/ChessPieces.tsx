// ChessPieces.tsx
import React from 'react';

interface PieceProps {
  size?: number;
  color: 'white' | 'black';
}

const Pawn = ({ size = 45, color }: PieceProps) => (
  <svg width={size} height={size} viewBox="0 0 45 45">
    <g
      fill={color === 'white' ? '#fff' : '#000'}
      stroke={color === 'white' ? '#000' : '#000'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
    </g>
  </svg>
);

const Rook = ({ size = 45, color }: PieceProps) => (
  <svg width={size} height={size} viewBox="0 0 45 45">
    <g
      fill={color === 'white' ? '#fff' : '#000'}
      stroke={color === 'white' ? '#000' : '#000'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter" />
      <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
    </g>
  </svg>
);

const Knight = ({ size = 45, color }: PieceProps) => (
  <svg width={size} height={size} viewBox="0 0 45 45">
    <g
      fill={color === 'white' ? '#fff' : '#000'}
      stroke={color === 'white' ? '#000' : '#000'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" />
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" />
    </g>
  </svg>
);

const Bishop = ({ size = 45, color }: PieceProps) => (
  <svg width={size} height={size} viewBox="0 0 45 45">
    <g
      fill={color === 'white' ? '#fff' : '#000'}
      stroke={color === 'white' ? '#000' : '#000'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g fill="none" strokeLinecap="butt">
        <path d="M9,36c3.39-.97,10.11.43,13.5-2c3.39,2.43,10.11,1.03,13.5,2c0,0,1.65.54,3,2c-1,1.5-1,1-.3,1.3c.91.33.48.81-.08,1.09c-1,.5-2,.5-3,.5c-7.33,0-12.33,0-19.66,0c-1,0-2,0-3-.5c-.56-.28-.99-.76-.08-1.09c.7-.3.7-.3-.3-1.3c1.34-1.46,3-2,3-2"/>
        <path d="M15,32c2.5,2.5,12.5,2.5,15,0c.5-1.5,0-2,0-2c0-2.5-2.5-4-2.5-4c5.5-1.5,6-11.5-5-15.5c-11,4-10.5,14-5,15.5c0,0-2.5,1.5-2.5,4c0,0-.5.5,0,2z"/>
        <path d="M25,8a2.5,2.5,0,1,1,-5,0,2.5,2.5,0,1,1,5,0z"/>
      </g>
      <path d="M17.5,26h10M15,30h15m-7.5-14.5v5M20,18h5" strokeLinejoin="miter"/>
    </g>
  </svg>
);

const Queen = ({ size = 45, color }: PieceProps) => (
  <svg width={size} height={size} viewBox="0 0 45 45">
    <g
      fill={color === 'white' ? '#fff' : '#000'}
      stroke={color === 'white' ? '#000' : '#000'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8,12a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M24.5,7.5a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M41,12a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M16,8.5a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M33,9a2,2,0,1,1,4,0a2,2,0,1,1,-4,0"/>
      <path d="M9,26c8.5-1.5,21-1.5,27,0l2-12l-7,11V11l-5.5,13.5l-3-15l-3,15l-5.5-14V25L7,14l2,12z" strokeLinecap="butt"/>
      <path d="M9,26c0,2,1.5,2,2.5,4c1,1.5,1,1,0.5,3.5c-1.5,1-1.5,2.5-1.5,2.5c-1.5,1.5,0.5,2.5,0.5,2.5c6.5,1,16.5,1,23,0c0,0,1.5-1,0-2.5c0,0,0.5-1.5-1-2.5c-0.5-2.5-0.5-2,0.5-3.5c1-2,2.5-2,2.5-4c-8.5-1.5-18.5-1.5-27,0z" strokeLinecap="butt"/>
      <path d="M11.5,30c3.5-1,18.5-1,22,0M12,33.5c6-1,15-1,21,0" fill="none"/>
    </g>
  </svg>
);

const King = ({ size = 45, color }: PieceProps) => (
  <svg width={size} height={size} viewBox="0 0 45 45">
    <g
      fill={color === 'white' ? '#fff' : '#000'}
      stroke={color === 'white' ? '#000' : '#000'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.5,11.63V6M20,8h5" strokeLinejoin="miter"/>
      <path d="M22.5,25s4.5-7.5,3-10.5c0,0-1-2.5-3-2.5s-3,2.5-3,2.5c-1.5,3,3,10.5,3,10.5"/>
      <path d="M11.5,37c5.5,3.5,15.5,3.5,21,0v-7s9-4.5,6-10.5c-4-6.5-13.5-3.5-16,4V27v-3.5c-3.5-7.5-13-10.5-16-4c-3,6,5,10,5,10V37z"/>
      <path d="M11.5,30c5.5-3,15.5-3,21,0M11.5,33.5c5.5-3,15.5-3,21,0M11.5,37c5.5-3,15.5-3,21,0"/>
    </g>
  </svg>
);

export const ChessPieces = {
  Pawn,
  Rook,
  Knight,
  Bishop,
  Queen,
  King
};

// Helper function to get piece component by type
export const getPieceComponent = (type: string, color: 'white' | 'black', size?: number) => {
  const pieceType = type.toLowerCase();
  const Component = {
    'p': ChessPieces.Pawn,
    'r': ChessPieces.Rook,
    'n': ChessPieces.Knight,
    'b': ChessPieces.Bishop,
    'q': ChessPieces.Queen,
    'k': ChessPieces.King
  }[pieceType];

  return Component ? <Component color={color} size={size} /> : null;
};

export default ChessPieces;