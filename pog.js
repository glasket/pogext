window.addEventListener('load', () => {
  // Grab page elements for observation
  const chatList = document.getElementsByClassName(
    'chat-scrollable-area__message-container'
  )[0];
  const pickerParentBlock = document.querySelector(
    'div.tw-block.tw-relative.tw-z-default'
  );
  const emotePickerButton = document.querySelector(
    'button[data-a-target="emote-picker-button"]'
  );
  const cardHolder = document.querySelector(
    'div.tw-full-height.tw-full-width.tw-relative.tw-z-above.viewer-card-layer'
  );

  // Create the PogChamp emote image
  const pog = document.createElement('img');
  pog.setAttribute('alt', 'PogChamp');
  pog.className = 'chat-image chat-line__message--emote';
  pog.setAttribute('src', chrome.runtime.getURL('images/128.png'));

  // TODO Fix broken tooltip when swapping image
  // TODO Add configuration for the timeouts

  // Used for the chat messages
  const getAndSwapEmotes = (chatMessage) => {
    const emotes = chatMessage.getElementsByClassName(
      'chat-line__message--emote-button'
    );
    for (let x = 0; x < emotes.length; x++) {
      const img = emotes[x].children[0].children[0].children[0];
      if (img.getAttribute('alt') === 'PogChamp')
        img.replaceWith(pog.cloneNode());
    }
  };

  const chatObserver = new MutationObserver((muts, observer) => {
    muts.forEach((mut) => {
      if (mut.type === 'childList') {
        getAndSwapEmotes(mut.target.lastChild);
      }
    });
  });

  const preload = chatList.children.length;
  chatObserver.observe(chatList, { childList: true });

  // Get messages that had already loaded
  for (let x = 0; x < preload; x++) {
    getAndSwapEmotes(chatList.children[x]);
  }

  // Emote Picker
  const pogPicker = pog.cloneNode();
  pogPicker.className = 'emote-picker__image';

  const swapPogButtons = (newNode) => {
    setTimeout(() => {
      const pogButtons = newNode.querySelectorAll(
        'button[name="PogChamp"]:not(.pogswap)'
      );
      if (pogButtons.length > 0) {
        for (let y = 0; y < pogButtons.length; y++) {
          const pbImg = pogButtons[y].children[0].children[0];
          pbImg.replaceWith(pogPicker.cloneNode());
          pbImg.className += 'pogswap';
        }
      }
    }, 1);
  };

  const pickerObserver = new MutationObserver((muts, obs) => {
    muts.forEach((mut) => {
      if (mut.type === 'childList') {
        swapPogButtons(mut.addedNodes[0]);
        pickerObserver.disconnect();
      }
    });
  });
  pickerObserver.observe(pickerParentBlock, { childList: true });
  // End Emote Picker

  // Emote Card
  const bigPog = pog.cloneNode();
  bigPog.className = 'emote-card__big-emote tw-image';
  bigPog.setAttribute('data-test-selector', 'big-emote');

  // Timeouts help with delay in loading, 50ms is arbitrary limit
  const waitForImage = (newNode, val) => {
    // Give up after 50ms
    if (val === 49) {
      return;
    }
    setTimeout(() => {
      const emoteImg = newNode.querySelector('img');
      if (emoteImg && emoteImg.getAttribute('alt') === 'PogChamp') {
        emoteImg.replaceWith(bigPog);
      } else {
        waitForImage(newNode, val++);
      }
    }, 1);
  };

  const cardObserver = new MutationObserver((muts, obs) => {
    muts.forEach((mut) => {
      if (mut.type === 'childList' && mut.addedNodes.length > 0) {
        waitForImage(mut.addedNodes[0], 0);
      }
    });
  });

  cardObserver.observe(cardHolder, { childList: true });
  // End Emote Card
}, false);
