import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // Accept connections from any origin in development, or specific origin in production
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

interface GameRoom {
  roomId: string;
  players: {
    white?: string;
    black?: string;
  };
  gameState: string;
  currentFen: string;
}

const games = new Map<string, GameRoom>();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', () => {
    const roomId = generateRoomId();
    const game = {
      roomId,
      players: {
        white: socket.id
      },
      gameState: 'waiting',
      currentFen: 'start'
    };
    
    games.set(roomId, game);
    socket.join(roomId);
    console.log('Room created:', roomId);
    socket.emit('room_created', roomId);
  });

  socket.on('join_room', (roomId: string) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    const game = games.get(roomId);
    
    if (!game) {
      socket.emit('room_not_found');
      return;
    }
    
    if (game.players.black) {
      socket.emit('room_full');
      return;
    }

    game.players.black = socket.id;
    game.gameState = 'playing';
    socket.join(roomId);
    socket.emit('player_color', 'black');
    io.to(roomId).emit('game_start');
    console.log(`Game started in room ${roomId}`);
  });

  socket.on('make_move', ({ roomId, move, fen, capturedPiece }) => {
    console.log(`Move in room ${roomId}:`, move, 'FEN:', fen, 'Captured:', capturedPiece);
    const game = games.get(roomId);
    if (game) {
        game.currentFen = fen;
        socket.to(roomId).emit('opponent_move', { move, fen, capturedPiece });
        console.log('Move broadcasted to opponent');
    }
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    games.forEach((game, roomId) => {
      if (game.players.white === socket.id || game.players.black === socket.id) {
        io.to(roomId).emit('opponent_disconnected');
        games.delete(roomId);
        console.log(`Game in room ${roomId} ended due to disconnection`);
      }
    });
  });

  socket.on('game_over', ({ roomId, winner, type }) => {
    console.log(`Game over in room ${roomId}. ${winner} wins by ${type}`);
    // Broadcast to all players in the room, including sender
    io.to(roomId).emit('game_ended', { winner, type });
  });
});

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});