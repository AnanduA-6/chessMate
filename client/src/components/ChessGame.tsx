import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Square } from '../types/types';
import { socketService } from '../services/socket';
import { getPieceComponent } from './ChessPieces';

interface ChessGameProps {
  playerColor: 'white' | 'black' | null;
  roomId: string;
}

interface CapturedPiece {
  type: string;
  color: 'w' | 'b';
}




const ChessGame = ({ playerColor, roomId }: ChessGameProps) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{
    white: CapturedPiece[];
    black: CapturedPiece[];
  }>({ white: [], black: [] });



  const checkGameEnd = useCallback((currentGame: Chess) => {
    let result = null;

    if (currentGame.isCheckmate()) {
      const winner = currentGame.turn() === 'w' ? 'Black' : 'White';
      result = { winner, type: 'checkmate' };
    } else if (currentGame.isDraw()) {
      if (currentGame.isStalemate()) {
        result = { winner: 'Nobody', type: 'stalemate' };
      } else if (currentGame.isInsufficientMaterial()) {
        result = { winner: 'Nobody', type: 'insufficient material' };
      } else if (currentGame.isThreefoldRepetition()) {
        result = { winner: 'Nobody', type: 'threefold repetition' };
      } else {
        result = { winner: 'Nobody', type: 'draw' };
      }
    }

    if (result) {
      setGameResult(`${result.winner} wins by ${result.type}!`);
      socketService.emitGameOver({ roomId, ...result });
    }

    return result;
  }, [roomId]);



  // Socket effect for game updates
  useEffect(() => {
    const socket = socketService.getSocket();

    if (socket) {
      const handleOpponentMove = ({ move, fen, capturedPiece }) => {
        const newGame = new Chess(fen);
        setGame(newGame);
        setSelectedSquare(null);
        setPossibleMoves([]);



        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [capturedPiece.color === 'w' ? 'white' : 'black']: [
              ...prev[capturedPiece.color === 'w' ? 'white' : 'black'],
              capturedPiece
            ]
          }));
        }

        checkGameEnd(newGame);
      };



      socket.on('opponent_move', handleOpponentMove);


      return () => {
        socket.off('opponent_move', handleOpponentMove);
      };
    }
  }, [checkGameEnd]);

  const updateCapturedPieces = useCallback((capturedPiece: CapturedPiece | null) => {
    if (capturedPiece) {
      setCapturedPieces(prev => ({
        ...prev,
        [capturedPiece.color === 'w' ? 'white' : 'black']: [
          ...prev[capturedPiece.color === 'w' ? 'white' : 'black'],
          capturedPiece
        ]
      }));
    }
  }, []);

  const getLegalMoves = (square: Square): Square[] => {
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to as Square);
  };

  const makeMove = (sourceSquare: Square, targetSquare: Square): boolean => {
    try {
      const capturedPiece = game.get(targetSquare);
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      const newGame = new Chess(game.fen());
      setGame(newGame);

      const capturedPieceData = capturedPiece ? {
        type: capturedPiece.type,
        color: capturedPiece.color
      } : null;

      if (capturedPieceData) {
        updateCapturedPieces(capturedPieceData);
      }

      socketService.makeMove(roomId, {
        from: sourceSquare,
        to: targetSquare
      }, newGame.fen(), capturedPieceData);

      setSelectedSquare(null);
      setPossibleMoves([]);

      checkGameEnd(newGame);
      return true;
    } catch {
      return false;
    }
  };

  const handleSquareClick = (square: Square) => {
    if (gameResult || playerColor !== (game.turn() === 'w' ? 'white' : 'black')) {
      return;
    }

    const pieceOnSquare = game.get(square);

    if (!selectedSquare) {
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
        setPossibleMoves(getLegalMoves(square));
      }
    } else {
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else if (possibleMoves.includes(square)) {
        makeMove(selectedSquare, square);
      } else if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
        setPossibleMoves(getLegalMoves(square));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (gameResult || playerColor !== (game.turn() === 'w' ? 'white' : 'black')) {
      return false;
    }
    return makeMove(sourceSquare, targetSquare);
  };

  const customSquareStyles = () => {
    const styles: { [square: string]: React.CSSProperties } = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    possibleMoves.forEach((square) => {
      styles[square] = {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderRadius: '50%',
      };
    });

    return styles;
  };

  const CapturedPiecesDisplay = ({ pieces }: { pieces: CapturedPiece[] }) => (
    <div className="flex flex-wrap gap-1 h-12">
      {pieces.map((piece, index) => (
        <div key={index} className="w-8 h-8 flex items-center justify-center">
          {getPieceComponent(
            piece.type,
            piece.color === 'w' ? 'white' : 'black',
            28
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="w-full max-w-screen-lg mx-auto px-4 py-2 sm:px-2 sm:py-1">
        {/* Game Status for Desktop (Top) */}
        <div className="hidden sm:block text-center text-xl text-gray-300 sm:mb-4">
          {gameResult ? (
            <div className="font-bold text-blue-400">{gameResult}</div>
          ) : (
            <>
              {game.turn() === 'w' ? "White" : "Black"} to move
              {game.isCheck() && <span className="ml-2 text-red-400">Check!</span>}
            </>
          )}
        </div>

        {/* Captured Pieces for Mobile (Top) */}
        <div className="flex sm:hidden justify-between items-center mb-4">
          <div className="text-gray-300 text-lg sm:text-sm">
            <CapturedPiecesDisplay pieces={capturedPieces.white} />
          </div>
          <div className="text-gray-300 text-lg sm:text-sm">
            <CapturedPiecesDisplay pieces={capturedPieces.black} />
          </div>
        </div>

        {/* Main Content: Chessboard and Captured Pieces for Desktop */}
        <div className="flex sm:space-x-4 justify-center">
          {/* Captured Pieces for Desktop (Left) */}
          <div className="hidden sm:flex sm:flex-col justify-center items-center w-20">
            <div className="text-gray-300 text-lg sm:text-sm">
              <CapturedPiecesDisplay pieces={capturedPieces.white} />
            </div>
          </div>

          {/* Chessboard */}
          <div className="w-full sm:w-[calc(100%-160px)] aspect-square max-h-[calc(100vh-220px)] mx-auto sm:mx-0 sm:max-w-[500px]">
            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              onSquareClick={handleSquareClick}
              customSquareStyles={customSquareStyles()}
              boardOrientation={playerColor || 'white'}
            />
          </div>

          {/* Captured Pieces for Desktop (Right) */}
          <div className="hidden sm:flex sm:flex-col justify-center items-center w-20">
            <div className="text-gray-300 text-lg sm:text-sm">
              <CapturedPiecesDisplay pieces={capturedPieces.black} />
            </div>
          </div>
        </div>

        {/* Game Status for Mobile (Below Board) */}
        <div className="block sm:hidden mt-4 text-center text-xl text-gray-300">
          {gameResult ? (
            <div className="font-bold text-blue-400">{gameResult}</div>
          ) : (
            <>
              {game.turn() === 'w' ? "White" : "Black"} to move
              {game.isCheck() && <span className="ml-2 text-red-400">Check!</span>}
            </>
          )}
        </div>
      </div>
    </div>




  );
};

export default ChessGame;