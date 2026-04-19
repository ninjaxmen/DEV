import { Server } from 'socket.io';

export function createSocketServer(httpServer, origin) {
  const io = new Server(httpServer, {
    cors: {
      origin,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.info(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
