import { io, Socket } from 'socket.io-client';

interface Move {
  from: string;
  to: string;
}

interface CapturedPiece {
  type: string;
  color: 'w' | 'b';
}

interface GameOverData {
  roomId: string;
  winner: string;
  type: string;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() { }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (!this.socket) {
      console.log('Attempting to connect to:', import.meta.env.VITE_BACKEND_URL);
      
      this.socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ['polling'], // Force polling only
        secure: false,
        rejectUnauthorized: false,
        path: '/socket.io/',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error details:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    }
    return this.socket;
}

  createRoom() {
    if (this.socket) {
      console.log('Creating room...');
      this.socket.emit('create_room');
    } else {
      console.error('Socket not connected');
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      console.log('Joining room:', roomId);
      this.socket.emit('join_room', roomId);
    } else {
      console.error('Socket not connected');
    }
  }

  makeMove(roomId: string, move: Move, fen: string, capturedPiece: CapturedPiece | null = null) {
    if (this.socket) {
      console.log('Emitting move:', {
        roomId,
        move,
        fen,
        capturedPiece
      });
      this.socket.emit('make_move', { roomId, move, fen, capturedPiece });
    } else {
      console.error('Socket not connected');
    }
  }

  emitGameOver(data: GameOverData) {
    if (this.socket) {
      console.log('Emitting game over:', data);
      this.socket.emit('game_over', data);
    } else {
      console.error('Socket not connected');
    }
  }

  onGameStart(callback: () => void) {
    if (this.socket) {
      this.socket.on('game_start', callback);
    }
  }

  onOpponentMove(callback: (data: { move: Move; fen: string; capturedPiece: CapturedPiece | null }) => void) {
    if (this.socket) {
      this.socket.on('opponent_move', callback);
    }
  }

  onGameEnd(callback: (data: { winner: string; type: string }) => void) {
    if (this.socket) {
      this.socket.on('game_ended', callback);
    }
  }

  onOpponentDisconnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('opponent_disconnected', callback);
    }
  }

  onRoomCreated(callback: (roomId: string) => void) {
    if (this.socket) {
      this.socket.on('room_created', callback);
    }
  }

  onRoomJoined(callback: (color: 'white' | 'black') => void) {
    if (this.socket) {
      this.socket.on('player_color', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = SocketService.getInstance();
export default socketService;