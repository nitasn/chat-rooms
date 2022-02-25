import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

console.log = () => {};

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const sockets = Object.create(null); // socket.id -> { name, roomID }

function socketIDsInRoom(roomID) {
  return [...io.sockets.adapter.rooms.get(roomID).values()];
}

io.on('connection', (socket) => {
  console.log(`client connected! socket.id == ${socket.id}`);

  socket.on('enter', ({ name, roomID }) => {
    socket.join(roomID);

    sockets[socket.id] = { name, roomID };

    console.log(name, 'joined room', roomID);

    socket.to(roomID).emit('chatter-joined', name);

    broadcastNewRoomCount();
  });

  function broadcastNewRoomCount() {
    const { roomID } = sockets[socket.id];

    const participants = socketIDsInRoom(roomID).map((id) => sockets[id].name);

    io.to(roomID).emit('update-participants', participants);
  }

  function leaveRoom() {
    const { name, roomID } = sockets[socket.id];

    socket.to(roomID).emit('chatter-left', name);

    broadcastNewRoomCount();

    socket.leave(roomID);

    delete sockets[socket.id];
  }

  socket.on('message', (text) => {
    const { name, roomID } = sockets[socket.id];

    socket.to(roomID).emit('message', { name, text });
  });

  socket.on('leave', () => {
    const { name, roomID } = sockets[socket.id];
    console.log(name, 'leaving room', roomID);

    leaveRoom();
  });

  socket.on('disconnect', () => {
    // const { name, roomID } = dict[socket.id];
    // console.log(name, 'from room', roomID, 'disconnected!');

    try {
      // todo this crashes the server every time user closes thier browser
      socket.id in sockets && leaveRoom();
    } catch (e) {
      console.error(e);
    }
  });
});

// servse static files - from the folder `client`
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../client')));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`server started on http://localhost:${port}`);
});
