import express from 'express';
import http from 'http';

const app = express();

const server = http.createServer(app);

// servse static files - from the folder `client`
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'client')));

import { Server } from 'socket.io';
const io = new Server(server);
