

const chatList = document.getElementsByClassName('chat-scrollable-area__message-container')[0];

const config = {childList: true};

const pog = document.createElement('img');
pog.setAttribute('alt', 'PogChamp');
pog.className = 'chat-image chat-line__message--emote';
pog.setAttribute('src', 'https://www.streamscheme.com/wp-content/uploads/2020/04/Pogchamp.png')

const getAndSwapEmotes(chatMessage) {
  const emotes = chatMessage.getElementsByClassName('chat-line__message--emote-button');
  for (let x = 0; x < emotes.length; x++) {
    emotes[x].children[0].children[0].replaceChild(pog, emotes[x].children[0].children[0].firstChild)
  };
}

const observer = new MutationObserver((muts, observer) => {
  muts.forEach(mut => {
    if (mut.type === 'childList') {
      getAndSwapEmotes(mut.target.lastChild);
    }
  });
})

const preload = chatList.children.length;
observer.observe(chatList, config);

for (let x = 0; x < preload; x++) {
  getAndSwapEmotes(chatList.children[x]);
}
// TODO Observe chatroom viewer card to swap the big image after button pressed
// TODO Emote picker image