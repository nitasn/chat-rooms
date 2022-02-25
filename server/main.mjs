import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const names = Object.create(null); // (socket.id -> name) dict
const rooms = Object.create(null); // (socket.id -> roomID) dict

io.on('connection', (socket) => {
  console.log('client connected! socket.id ==', socket.id);

  socket.on('enter', ({ name, roomID }) => {
    names[socket.id] = name;
    rooms[socket.id] = roomID;
    socket.join(roomID);

    console.log(name, 'joined room', roomID);
    socket.to(roomID).emit('chatter-joined', name);

    updateParticipants();
  });

  function updateParticipants() {
    const room_sockets = io.sockets.adapter.rooms.get(rooms[socket.id]);
    const participants = [...room_sockets.values()].map((id) => names[id]);
    io.to(rooms[socket.id]).emit('update-participants', participants);
  }

  function leave() {
    socket.to(rooms[socket.id]).emit('chatter-left', names[socket.id]);
    delete names[socket.id];
    delete rooms[socket.id];

    updateParticipants;
  }

  socket.on('message', (text) => {
    socket
      .to(rooms[socket.id])
      .emit('message', { name: names[socket.id], text });
  });

  socket.on('leave', () => {
    console.log(names[socket.id], 'left room', rooms[socket.id]);
    leave();
  });
  socket.on('disconnect', () => {
    socket.id in rooms && leave();
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
