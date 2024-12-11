// src/types/chess.types.ts
export type Square = `${File}${Rank}`
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
export type Piece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type Color = 'white' | 'black'

export interface PieceData {
  type: Piece
  color: Color
  symbol: string
}