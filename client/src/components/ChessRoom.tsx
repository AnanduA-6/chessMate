import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import ChessGame from './ChessGame';

const ChessRoom: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [joined, setJoined] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('room_created', (generatedRoomId: string) => {
      setRoomId(generatedRoomId);
      setPlayerColor('white');
      setJoined(true);
    });

    socket.on('player_color', (color: 'white' | 'black') => {
      setPlayerColor(color);
      setJoined(true);
    });

    socket.on('game_start', () => {
      setGameStarted(true);
    });

    socket.on('room_full', () => {
      setError('Room is full');
    });

    socket.on('room_not_found', () => {
      setError('Room not found');
    });

    socket.on('opponent_disconnected', () => {
      setError('Opponent disconnected');
      setGameStarted(false);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    socketService.createRoom();
    setIsCreatingRoom(true);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      socketService.joinRoom(roomId);
    }
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        {!isCreatingRoom ? (
          <>
            <button 
              onClick={handleCreateRoom}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create New Room
            </button>
            <div className="text-center my-4">OR</div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="px-4 py-2 border rounded"
              />
              <button 
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Join Room
              </button>
            </div>
          </>
        ) : null}
        {error && <div className="text-red-500">{error}</div>}
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="text-center p-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Room ID:</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="px-4 py-2 bg-gray-100 rounded">{roomId}</span>
            <button
              onClick={() => navigator.clipboard.writeText(roomId)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="text-lg">Waiting for opponent to join...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-gray-600">Room ID: {roomId}</div>
        <div className="font-semibold">Playing as {playerColor}</div>
      </div>
      <ChessGame playerColor={playerColor} roomId={roomId} />
    </div>
  );
};

export default ChessRoom;