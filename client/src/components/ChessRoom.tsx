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
  const [copied, setCopied] = useState(false);

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

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 w-full">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Chess Arena
          </h1>
          
          {!isCreatingRoom ? (
            <div className="space-y-6">
              <button
                onClick={handleCreateRoom}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white transition-all rounded-lg font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
              >
                Create New Game
              </button>

              <div className="relative flex items-center gap-2">
                <span className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                <span className="bg-gray-800 px-4 text-gray-400 text-sm relative">OR</span>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room Code"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleJoinRoom}
                  className="w-full py-4 px-6 bg-green-600 hover:bg-green-500 text-white transition-all rounded-lg font-semibold text-lg shadow-lg shadow-green-600/30 hover:shadow-green-500/40 transform hover:-translate-y-0.5"
                >
                  Join Game
                </button>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 w-full">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Waiting for Opponent</h2>
          
          <div className="mb-8">
            <div className="text-gray-400 mb-2">Room Code</div>
            <div className="flex items-center justify-center gap-3">
              <span className="px-6 py-3 bg-gray-700/50 rounded-lg font-mono text-xl text-white">
                {roomId}
              </span>
              <button
                onClick={handleCopyRoomId}
                className={`p-2 rounded-lg transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <CopyIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-300">Waiting for opponent to join...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gray-700/50 rounded-lg font-mono text-gray-300">
              Room: {roomId}
            </div>
            <div className="px-4 py-2 bg-gray-700/50 rounded-lg text-gray-300">
              Playing as{' '}
              <span className={`font-semibold ${playerColor === 'white' ? 'text-amber-400' : 'text-blue-400'}`}>
                {playerColor}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopyRoomId}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all flex items-center gap-2 text-sm"
          >
            {copied ? 'Copied!' : 'Copy Room Code'}
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
          </button>
        </div>

        <ChessGame playerColor={playerColor} roomId={roomId} />
      </div>
    </div>
  );
};

const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CopyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export default ChessRoom;