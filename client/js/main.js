///////////////////////////////////////////////////////////
////                     U T I L S                     ////
///////////////////////////////////////////////////////////

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const range = (n) => [...Array(n).keys()];

///////////////////////////////////////////////////////////
////                    C O N S T S                    ////
///////////////////////////////////////////////////////////

const screen_enter = document.querySelector('.enter-room');
const screen_main = document.querySelector('main');

const messages_div = document.querySelector('.messages');
const msg_input = document.getElementById('msg-inupt');
const btn_send_msg = document.getElementById('btn-send-msg');

const input_name = document.getElementById('your-name');
const input_room_id = document.getElementById('room-id');
const create_new_room = document.querySelector('.create-new-room');
const btn_enter = document.getElementById('btn-enter-room');

const action_leave = document.querySelector('.action-leave');
const action_room_count = document.querySelector('.action-room-count');
const action_room_id = document.querySelector('.action-room-id');

///////////////////////////////////////////////////////////
////                     D E B U G                     ////
///////////////////////////////////////////////////////////

// add a call to this function wherever
// (e.g. after btn_send_msg was clicked)

async function autoReplyForDebug() {
  window.quotesPromise ??= fetch('quotes.json').then((r) => r.json());

  const delay = (Math.random() * 2 + 1) * 1000; // 1 to 3 seconds

  const [quotes] = await Promise.all([quotesPromise, sleep(delay)]);

  appendMsg(random_choice(quotes).text, 'by-them');
}

///////////////////////////////////////////////////////////
////                 M E S S A G I N G                 ////
///////////////////////////////////////////////////////////

function appendMsg(name, text, { isByMe }) {
  const p = document.createElement('p');

  p.classList.add('msg', isByMe ? 'by-me' : 'by-them');

  // p.innerText = text;

  p.innerHTML = `
    <h1>${name}</h1>
    ${text}
  `;

  messages_div.appendChild(p);

  scrollMessagesToEnd();
}

function scrollMessagesToEnd() {
  // todo tofix there's some flickering...
  setTimeout(() => {
    window.scrollTo(0, messages_div.scrollHeight);
  }, 0);
}

msg_input.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btn_send_msg.click();
  }
});

///////////////////////////////////////////////////////////
////                 R A N D O M   I D                 ////
///////////////////////////////////////////////////////////

// [I, O, 0] are deliberately missing, to avoid confusion...
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ' + '123456789';

function randomID() {
  const numParts = 4;
  const partLength = 2;
  const res = [];
  for (let i = 0; i < numParts; i++) {
    const part = range(partLength).map(() => randChoice(alphabet));
    res.push(part.join(''));
  }
  return res.join('-');
}

create_new_room.addEventListener('click', async () => {
  const id = randomID();
  input_room_id.value = id;

  const link = `https://web-chat-rooms.herokuapp.com/${id}`;
  await navigator.clipboard.writeText(link);

  alert(`Room Link was Copied to Clipboard!`);
});

///////////////////////////////////////////////////////////
////                   G L O B A L S                   ////
///////////////////////////////////////////////////////////

let name = null;
let roomID = null;

///////////////////////////////////////////////////////////
////                E N T E R   R O O M                ////
///////////////////////////////////////////////////////////

function enterRoom(name, roomID) {

  messages_div.innerHTML = '';

  screen_enter.classList.add('hidden');
  screen_main.classList.remove('hidden');

  action_room_count.innerText = `Online`;

  window.name = name;
  window.roomID = roomID;
}

function exitRoom() {
  screen_enter.classList.remove('hidden');
  screen_main.classList.add('hidden');

  window.name = null;
}

///////////////////////////////////////////////////////////
////                    S O C K E T                    ////
///////////////////////////////////////////////////////////

const socket = io();

btn_enter.addEventListener('click', () => {
  const roomID = input_room_id.value.trim();
  const name = input_name.value.trim();

  if (!roomID) return alert('Please Fill In Room ID or Create New Room');
  if (!name) return alert('Please Fill In Your Name');

  socket.emit('enter', { name, roomID });

  enterRoom(name, roomID);
});

action_leave.addEventListener('click', () => {
  socket.emit('leave');
  exitRoom();
});

socket.on('chatter-joined', (name) => {
  console.log('chatter joined:', name);
});

socket.on('chatter-left', (name) => {
  console.log('chatter left:', name);
});

socket.on('update-participants', (participants) => {
  action_room_count.innerText = `Online: ${participants.length}`;
});

socket.on('message', ({ name, text }) => {
  // console.log('received: ', { name, text });
  appendMsg(name, text, { isByMe: false });
});

btn_send_msg.addEventListener('click', () => {
  const text = msg_input.value.trim();
  if (!text) return;

  msg_input.value = '';
  appendMsg(window.name, text, { isByMe: true });

  socket.emit('message', text);
});

///////////////////////////////////////////////////////////
////          R O O M   I D   F R O M   U R L          ////
///////////////////////////////////////////////////////////

const path = window.location.pathname.substring('/'.length);
if (path != 'index.html') {
  input_room_id.value = path;
}
