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
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  
  connect() {
    if (!this.socket) {
      const backendUrl = process.env.VITE_BACKEND_URL;
      if (!backendUrl) {
        console.error('Backend URL not configured');
        return null;
      }

      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 10000,
        extraHeaders: {
          "Access-Control-Allow-Origin": "https://chess-mate-ivory.vercel.app"
        }
      });
      
      this.setupConnectionListeners();
    }
    return this.socket;
  }

  private setupConnectionListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', {
        id: this.socket?.id,
        timestamp: new Date().toISOString()
      });
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('Socket connection error:', {
        error: error.message,
        attempt: this.reconnectAttempts,
        timestamp: new Date().toISOString(),
        backendUrl: process.env.VITE_BACKEND_URL
      });

      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        timestamp: new Date().toISOString(),
        willReconnect: this.socket?.disconnected && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS
      });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', {
        error,
        timestamp: new Date().toISOString()
      });
    });
  }

  createRoom() {
    if (!this.ensureConnection()) return;
    
    console.log('Creating room...');
    this.socket!.emit('create_room');
  }

  joinRoom(roomId: string) {
    if (!this.ensureConnection()) return;
    
    console.log('Joining room:', roomId);
    this.socket!.emit('join_room', roomId);
  }

  makeMove(roomId: string, move: Move, fen: string, capturedPiece: CapturedPiece | null = null) {
    if (!this.ensureConnection()) return;
    
    console.log('Making move:', {
      roomId,
      move,
      fen,
      capturedPiece,
      timestamp: new Date().toISOString()
    });
    this.socket!.emit('make_move', { roomId, move, fen, capturedPiece });
  }

  emitGameOver(data: GameOverData) {
    if (!this.ensureConnection()) return;
    
    console.log('Game over:', {
      ...data,
      timestamp: new Date().toISOString()
    });
    this.socket!.emit('game_over', data);
  }

  onGameStart(callback: () => void) {
    if (!this.ensureConnection()) return;
    this.socket!.on('game_start', callback);
  }

  onOpponentMove(callback: (data: { move: Move; fen: string; capturedPiece: CapturedPiece | null }) => void) {
    if (!this.ensureConnection()) return;
    this.socket!.on('opponent_move', callback);
  }

  onGameEnd(callback: (data: { winner: string; type: string }) => void) {
    if (!this.ensureConnection()) return;
    this.socket!.on('game_ended', callback);
  }

  onOpponentDisconnect(callback: () => void) {
    if (!this.ensureConnection()) return;
    this.socket!.on('opponent_disconnected', callback);
  }

  onRoomCreated(callback: (roomId: string) => void) {
    if (!this.ensureConnection()) return;
    this.socket!.on('room_created', callback);
  }

  onRoomJoined(callback: (color: 'white' | 'black') => void) {
    if (!this.ensureConnection()) return;
    this.socket!.on('player_color', callback);
  }

  private ensureConnection(): boolean {
    if (!this.socket || !this.isConnected()) {
      console.error('Socket not connected. Attempting to reconnect...');
      this.connect();
      return false;
    }
    return true;
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
      this.reconnectAttempts = 0;
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