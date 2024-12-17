import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Square } from '../types/types';
import { socketService } from '../services/socket';
import { getPieceComponent } from './chessPieces';

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

  const checkGameEnd = (currentGame: Chess) => {
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
      socketService.emitGameOver({
        roomId,
        ...result
      });
    }

    return result;
  };

  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (socket) {
      const handleOpponentMove = ({ move, fen, capturedPiece }) => {
        console.log('Received opponent move:', move, 'FEN:', fen);
        console.log('Captured piece:', capturedPiece);
        
        const newGame = new Chess(fen);
        setGame(newGame);
        setSelectedSquare(null);
        setPossibleMoves([]);

        if (capturedPiece) {
          setCapturedPieces(prev => {
            // Determine which array to update based on the captured piece's color
            if (capturedPiece.color === 'w') {
              return {
                ...prev,
                white: [...prev.white, capturedPiece]
              };
            } else {
              return {
                ...prev,
                black: [...prev.black, capturedPiece]
              };
            }
          });
        }

        checkGameEnd(newGame);
      };

      const handleGameEnded = ({ winner, type }) => {
        console.log('Game ended:', winner, type);
        setGameResult(`${winner} wins by ${type}!`);
      };

      socket.on('opponent_move', handleOpponentMove);
      socket.on('game_ended', handleGameEnded);

      return () => {
        socket.off('opponent_move', handleOpponentMove);
        socket.off('game_ended', handleGameEnded);
      };
    }
  }, [roomId]);

  const updateCapturedPieces = useCallback((capturedPiece: CapturedPiece | null) => {
    if (capturedPiece) {
      setCapturedPieces(prev => {
        if (capturedPiece.color === 'w') {
          return {
            ...prev,
            white: [...prev.white, capturedPiece]
          };
        } else {
          return {
            ...prev,
            black: [...prev.black, capturedPiece]
          };
        }
      });
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

      const gameEndResult = checkGameEnd(newGame);
      if (gameEndResult) {
        setGameResult(`${gameEndResult.winner} wins by ${gameEndResult.type}!`);
      }

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
        boxShadow: 'inset 0 0 0 2px rgba(0, 255, 0, 0.4)',
      };
    });

    return styles;
  };

  const CapturedPiecesDisplay = ({ pieces }: { pieces: CapturedPiece[] }) => {
    return (
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded min-h-[100px]">
        {pieces.map((piece, index) => (
          <div key={index} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow">
            {getPieceComponent(
              piece.type,
              piece.color === 'w' ? 'white' : 'black',
              30
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-start justify-center gap-8 p-8">
      <div className="w-32">
        <h3 className="text-center mb-2 font-semibold">Captured White Pieces</h3>
        <CapturedPiecesDisplay pieces={capturedPieces.white} />
      </div>

      <div className="w-[560px]">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={handleSquareClick}
          customSquareStyles={customSquareStyles()}
          boardOrientation={playerColor || 'white'}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        />
        
        {gameResult ? (
          <div className="mt-4 text-xl font-bold text-center p-4 bg-blue-100 rounded">
            {gameResult}
          </div>
        ) : (
          <div className="mt-4 text-xl font-semibold text-center">
            {game.turn() === 'w' ? "White" : "Black"} to move
            {game.isCheck() && " - Check!"}
          </div>
        )}
      </div>

      <div className="w-32">
        <h3 className="text-center mb-2 font-semibold">Captured Black Pieces</h3>
        <CapturedPiecesDisplay pieces={capturedPieces.black} />
      </div>
    </div>
  );
};

export default ChessGame;