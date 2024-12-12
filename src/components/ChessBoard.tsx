import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Square, File, Rank } from '../types/types';

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  const getLegalMoves = (square: Square): Square[] => {
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to as Square);
  };

  const handleSquareClick = (square: Square) => {
    const pieceOnSquare = game.get(square);
    const currentColor = game.turn() === 'w' ? 'white' : 'black';
    
    if (!selectedSquare) {
      if (pieceOnSquare && pieceOnSquare.color === (currentColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        setPossibleMoves(getLegalMoves(square));
      }
    } else {
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else if (possibleMoves.includes(square)) {
        try {
          game.move({ from: selectedSquare, to: square });
          setGame(new Chess(game.fen()));
          setSelectedSquare(null);
          setPossibleMoves([]);
        } catch (error) {
          console.error('Invalid move:', error);
        }
      } else if (pieceOnSquare && pieceOnSquare.color === (currentColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        setPossibleMoves(getLegalMoves(square));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  // Custom square rendering for highlights
  const customSquareStyles = () => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Style for selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Style for possible moves
    possibleMoves.forEach((square) => {
      styles[square] = {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 0 2px rgba(0, 255, 0, 0.4)',
      };
    });

    return styles;
  };

  return (
    <div className="flex flex-col items-center p-8">
      <div className="w-[560px]">
        <Chessboard 
          position={game.fen()}
          boardWidth={560}
          customSquareStyles={customSquareStyles()}
          onSquareClick={handleSquareClick}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          boardOrientation="white"
        />
      </div>
      <div className="mt-4 text-xl font-semibold">
        {game.turn() === 'w' ? "White" : "Black"} to move
        {game.isCheck() && " - Check!"}
      </div>
    </div>
  );
};

export default ChessBoard;