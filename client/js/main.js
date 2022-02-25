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
const action_room_id = document.querySelector('.action-room-id');
const action_room_count = document.querySelector('.action-room-count');

///////////////////////////////////////////////////////////
////                     D E B U G                     ////
///////////////////////////////////////////////////////////

const quotesPromise = fetch('quotes.json').then((res) => res.json());

async function autoReplyForDebug() {
  const delay = (Math.random() * 2 + 1) * 1000;
  const [quotes] = await Promise.all([quotesPromise, sleep(delay)]);
  appendMsg(random_choice(quotes).text, 'by-them');
}

///////////////////////////////////////////////////////////
////                 M E S S A G I N G                 ////
///////////////////////////////////////////////////////////

function appendMsg(text, sender = 'by-me') {
  const p = document.createElement('p');
  p.classList.add('msg');
  p.classList.add(sender);
  p.innerText = text;

  messages_div.appendChild(p);

  scrollMessagesToEnd();
}

function scrollMessagesToEnd() {
  // todo tofix there's some flickering...
  setTimeout(() => {
    window.scrollTo(0, messages_div.scrollHeight);
  }, 0);
}

btn_send_msg.addEventListener('click', () => {
  const msg = msg_input.value.trim();
  if (!msg) return;

  msg_input.value = '';
  appendMsg(msg, 'by-me');

  // autoReplyForDebug();
});

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

create_new_room.addEventListener('click', () => {
  const id = randomID();
  input_room_id.value = id;
  setTimeout(() => {
    alert('RoomID was Copied to Clipboard!');
  }, 0);
});

///////////////////////////////////////////////////////////
////                E N T E R   R O O M                ////
///////////////////////////////////////////////////////////

function enterRoom(name, roomID) {
  screen_enter.classList.add('hidden');
  screen_main.classList.remove('hidden');

  action_leave.innerText = `Leave as ${name}`;
  action_room_id.innerText = `Room: ${roomID}`;
  action_room_count.innerText = `Online: ...`;
}

function exitRoom() {
  screen_enter.classList.remove('hidden');
  screen_main.classList.add('hidden');
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

socket.on('message', ({ name, text }) => {
  console.log('received: ', { name, text });
});

socket.on('chatter-joined', (name) => {
  console.log('chatter joined:', name);
});

socket.on('update-participants', (participants) => {
  action_room_count.innerText = `Online: ${participants.length}`;
});
