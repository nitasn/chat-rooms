const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const msg_input = document.getElementById('msg-inupt');
const btn_send_msg = document.getElementById('btn-send-msg');
const messages_div = document.querySelector('.messages');

const quotesPromise = fetch('quotes.json').then((res) => res.json());

async function autoReplyForDebug() {
  const delay = (Math.random() * 2 + 1) * 1000;
  const [quotes] = await Promise.all([quotesPromise, sleep(delay)]);
  appendMsg(random_choice(quotes).text, 'by-them');
}

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

function random_choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

btn_send_msg.addEventListener('click', () => {
  const msg = msg_input.value.trim();
  if (!msg) return;

  msg_input.value = '';
  appendMsg(msg, 'by-me');

  autoReplyForDebug();
});

msg_input.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btn_send_msg.click();
  }
});
