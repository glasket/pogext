const listeners = {
  card: false,
  picker: false,
  scroll: false,
  chat: false,
  vod: false,
}; // Used for tracking subscriptions

// Have to be let because they change on navigation
let cardHolder = null;
let chatList = null;
let pickerParentBlock = null;

// PogChamp emote for chat
const pog = document.createElement('img');
pog.alt = 'PogChamp';
pog.className = 'chat-image chat-line__message--emote';
pog.src = chrome.runtime.getURL('images/128.png');

// PogChamp for emote picker
const pogPicker = pog.cloneNode();
pogPicker.className = 'emote-picker__image';

// PogChamp for emote card
const bigPog = pog.cloneNode();
bigPog.className = 'emote-card__big-emote tw-image';
bigPog.setAttribute('data-test-selector', 'big-emote');

// Card
// Timeouts help with delay in loading, 50ms is arbitrary limit
const waitForImage = (newNode, val) => {
  // Give up after ~50ms
  if (val === 49) {
    return;
  }
  setTimeout(() => {
    const emoteImg = newNode.getElementsByTagName('IMG')[0];
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

const runCard = () => {
  if (cardHolder && !listeners['card']) {
    cardObserver.observe(cardHolder, { childList: true });
    listeners['card'] = true;
  }
};
// End Card

// Picker
const swapPogButtons = (newNode) => {
  const pogButtons = newNode.querySelectorAll('button[name="PogChamp"]');
  if (pogButtons.length > 0) {
    for (let x = 0, l = pogButtons.length; x < l; x++) {
      const pbImg = pogButtons[x].children[0].children[0];
      pbImg.replaceWith(pogPicker.cloneNode());
      pbImg.className += 'pogswap'; // ensures we don't waste cycles on buttons that have been changed.
    }
  }
};

const scrollObserver = new MutationObserver((muts, obs) => {
  muts.forEach((mut) => {
    if (mut.type === 'childList') {
      mut.addedNodes.forEach((node) => {
        swapPogButtons(node);
      });
    }
  });
});

const pickerObserver = new MutationObserver((muts, obs) => {
  muts.forEach((mut) => {
    if (mut.type === 'childList') {
      swapPogButtons(mut.addedNodes[0]);
      pickerObserver.disconnect();
      listeners['picker'] = false;
      scrollObserver.observe(
        mut.addedNodes[0].getElementsByClassName(
          'simplebar-content emote-picker__scroll-container'
        )[0].children[0],
        { childList: true, subtree: true }
      );
      listeners['scroll'] = true;
    }
  });
});

const runPicker = () => {
  const emoteContent = pickerParentBlock.getElementsByClassName(
    'emote-picker__content-block'
  );
  if (emoteContent.length > 0) {
    for (let x = 0, l = emoteContent.length; x < l; x++) {
      swapPogButtons(emoteContent[x]);
    }
    scrollObserver.observe(
      pickerParentBlock.children[0].getElementsByClassName(
        'simplebar-content emote-picker__scroll-container'
      )[0].children[0],
      { childList: true, subtree: true }
    );
    listeners['scroll'] = true;
  } else if (pickerParentBlock && !listeners['picker']) {
    pickerObserver.observe(pickerParentBlock, { childList: true });
    listeners['picker'] = true;
  }
};
// End Picker

// Live Chat
const getAndSwapEmotes = (chatMessage) => {
  const emotes = chatMessage.getElementsByClassName(
    'chat-line__message--emote-button'
  );
  for (let x = 0, l = emotes.length; x < l; x++) {
    const img = emotes[x].children[0].children[0].children[0];
    if (img.alt === 'PogChamp') img.replaceWith(pog.cloneNode());
  }
};

const chatObserver = new MutationObserver((muts, observer) => {
  muts.forEach((mut) => {
    if (mut.type === 'childList' && mut.addedNodes.length > 0) {
      mut.addedNodes.forEach((node) => {
        getAndSwapEmotes(node);
      });
    }
  });
});

const runLive = () => {
  runPicker();

  chatObserver.observe(chatList, { childList: true });
  // Get messages that had already loaded.
  // Preload may catch messages already read by the observer, but this is minor and ensures no messages are missed.
  for (let x = 0, preload = chatList.children.length; x < preload; x++) {
    getAndSwapEmotes(chatList.children[x]);
  }
  listeners['chat'] = true;

  runCard();
};
// End Live

// VOD Chat : Entirely different from Live Chat for some reason
const vodChatLoaded = (vodChat) => {
  const getAndSwapVodEmotes = (chatMessage) => {
    const emotes = chatMessage.getElementsByClassName('chat-image__container');
    for (let x = 0, l = emotes.length; x < l; x++) {
      const img = emotes[x].children[0];
      if (img.alt === 'PogChamp') img.replaceWith(pog.cloneNode());
    }
  };

  const vodChatObserver = new MutationObserver((muts, obs) => {
    muts.forEach((mut) => {
      if (mut.type === 'childList' && mut.addedNodes.length > 0) {
        mut.addedNodes.forEach((node) => {
          getAndSwapVodEmotes(node);
        });
      }
    });
  });

  vodChatObserver.observe(vodChat, { childList: true });
  for (let x = 0, preload = vodChat.children.length; x < preload; x++) {
    getAndSwapVodEmotes(vodChat.children[x]);
  }
};

const runVod = () => {
  const vodChatParent = document.getElementsByClassName(
    'video-chat__message-list-wrapper'
  )[0].children[0];

  const vodWaitForLoadObserver = new MutationObserver((muts, obs) => {
    muts.forEach((mut) => {
      if (mut.type === 'childList') {
        if (vodChatParent.firstElementChild.tagName === 'UL') {
          vodWaitForLoadObserver.disconnect();
          vodChatLoaded(vodChatParent.firstElementChild);
        }
      }
    });
  });

  if (vodChatParent.firstElementChild.tagName === 'UL') {
    vodChatLoaded(vodChatParent.firstElementChild);
  } else {
    vodWaitForLoadObserver.observe(vodChatParent, { childList: true });
  }
};

const fetchElements = (ctr) => {
  if (!cardHolder) {
    cardHolder = document.querySelector(
      'div.tw-full-height.tw-full-width.tw-relative.tw-z-above.viewer-card-layer'
    );
  }

  if (!pickerParentBlock) {
    pickerParentBlock = document.querySelector(
      'div.tw-block.tw-relative.tw-z-default'
    );
  }

  if (!chatList) {
    chatList = document.getElementsByClassName(
      'chat-scrollable-area__message-container'
    )[0];
  }

  if (ctr >= 10) {
    return;
  }

  if (!cardHolder || !pickerParentBlock || !chatList) {
    setTimeout(fetchElements, ctr * 1000, ctr++);
  } else {
    runLive();
  }
};

const start = () => {
  const loc = window.location.pathname.split('/')[1];
  if (loc) {
    if (loc === 'videos') {
      runVod();
    } else {
      fetchElements(1);
    }
  }
};

// TODO Fix broken tooltip when swapping image
// TODO Add configuration for the timeouts

let waiters = 0;
chrome.runtime.onMessage.addListener((msg) => {
  waiters++;
  if (msg.status === 'changed') {
    for (const key in listeners) {
      if (listeners[key]) {
        switch (key) {
          case 'card':
            cardObserver.disconnect();
            cardHolder = null;
            break;
          case 'picker':
            pickerObserver.disconnect();
            pickerParentBlock = null;
            break;
          case 'scroll':
            scrollObserver.disconnect();
            pickerParentBlock = null;
            break;
          case 'chat':
            chatObserver.disconnect();
            chatList = null;
            break;
          case 'vod':
            vodChatObserver.disconnect();
            break;
          default:
        }
        listeners[key] = false;
      }
    }
    setTimeout(() => {
      waiters--; // For debouncing, sort of
      if (waiters !== 0) {
        return;
      }
      start();
    }, 3000);
  }
});

start();
