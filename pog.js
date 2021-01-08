// Grab page elements for observation
const chatList = document.getElementsByClassName('chat-scrollable-area__message-container')[0];
const pickerParentBlock = document.querySelector('div.tw-block.tw-relative.tw-z-default');
const emotePickerButton = document.querySelector('button[data-a-target="emote-picker-button"]');

// Create the PogChamp emote image
const pog = document.createElement('img');
pog.setAttribute('alt', 'PogChamp');
pog.className = 'chat-image chat-line__message--emote';
pog.setAttribute('src', 'https://www.streamscheme.com/wp-content/uploads/2020/04/Pogchamp.png')


// TODO Fix broken tooltip when swapping image

// Used for the chat messages
const getAndSwapEmotes = (chatMessage) => {
  const emotes = chatMessage.getElementsByClassName('chat-line__message--emote-button');
  for (let x = 0; x < emotes.length; x++) {
    const img = emotes[x].children[0].children[0].children[0];
    if (img.getAttribute('alt') === 'PogChamp')
      img.replaceWith(pog.cloneNode());
  };
}

const chatObserver = new MutationObserver((muts, observer) => {
  muts.forEach(mut => {
    if (mut.type === 'childList') {
      getAndSwapEmotes(mut.target.lastChild);
    }
  });
})

const preload = chatList.children.length;
chatObserver.observe(chatList, {childList: true});

// Get messages that had already loaded
for (let x = 0; x < preload; x++) {
  getAndSwapEmotes(chatList.children[x]);
}
// TODO Observe chatroom viewer card to swap the big image after button pressed

// Emote Picker
const pogPicker = pog.cloneNode();
pogPicker.className = 'emote-picker__image';

const pickerObserver = new MutationObserver((muts, obs) => {
  muts.forEach(mut => {
    if (mut.type === 'childList') {
      
      const pogButtons = mut.addedNodes[0].querySelectorAll('button[name="PogChamp"]');
      console.log(pogButtons)
      for (let x = 0; x < pogButtons.length; x++) {
        const pbImg = pogButtons[x].children[0].children[0];
        pbImg.replaceWith(pogPicker.cloneNode());
      }
      pickerObserver.disconnect(); //TODO Add another observer to the picker box itself for scroll loads
    }
  })
});
pickerObserver.observe(pickerParentBlock, {childList: true});
// End Emote Picker
