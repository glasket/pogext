const listeners = {
  card: false,
  pickerD: false,
  picker: false,
  scroll: false,
  chat: false,
  vod: false,
  search: false,
}; // Used for tracking subscriptions

// TODO Add support for WYSIWYG editor

// Have to be let because they change on navigation
let cardHolder = null;
let chatList = null;
let pickerParentBlock = null;
let picker = null;

let searching = false;

// PogChamp emote for chat
const pog = document.createElement('img');
pog.alt = 'PogChamp';
pog.className = 'chat-image chat-line__message--emote';
pog.src = chrome.runtime.getURL('images/128.webp');

// PogChamp for emote picker
const pogPicker = pog.cloneNode();
pogPicker.className = 'emote-picker__image';

// PogChamp for emote card
const bigPog = pog.cloneNode();
bigPog.className = 'emote-card__big-emote tw-image';
bigPog.setAttribute('data-test-selector', 'big-emote');

// Card
// Timeouts help with delay in loading, 50ms is arbitrary limit
const waitForImage = (newNode, waitTime) => {
  // Give up once wait times are getting absurd
  // TODO Maybe config option
  if (waitTime > 3000) {
    return;
  }

  setTimeout(() => {
    const emoteImg = newNode.getElementsByTagName('IMG')[0];
    if (emoteImg && emoteImg.getAttribute('alt') === 'PogChamp') {
      emoteImg.replaceWith(bigPog);
    } else {
      waitForImage(newNode, waitTime * 2);
    }
  }, waitTime);
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
    if (mut.type === 'childList' && mut.addedNodes.length > 0) {
      swapPogButtons(mut.addedNodes[0]);

      if (!listeners['scroll']) {
        const scrollContent = picker.getElementsByClassName(
          'simplebar-content emote-picker__scroll-container',
        )[0];
        scrollObserver.observe(scrollContent.children[0], {
          childList: true,
          subtree: true,
        });
        listeners['scroll'] = true;
      }
    }
  });
  if (searching) {
    searchObserver.observe(
      muts[2].addedNodes[0].getElementsByClassName(
        'emote-picker__content-block',
      )[0].children[1],
      { childList: true },
    );
  } else {
    searchObserver.disconnect();
    listeners['search'] = false;
  }
});

const pickerVisObserver = new MutationObserver((muts, obs) => {
  muts.forEach((mut) => {
    if (mut.type === 'attributes') {
      searching = false;
      searchObserver.disconnect();
      listeners['search'] = false;
    }
  });
});

const searchObserver = new MutationObserver((muts, obs) => {
  muts.forEach((mut) => {
    if (mut.type === 'childList' && mut.addedNodes.length > 0) {
      const pogButton = mut.addedNodes[0].querySelector(
        'button[name="PogChamp"]',
      );
      if (pogButton) {
        const pbImg = pogButton.children[0].children[0];
        pbImg.replaceWith(pogPicker.cloneNode());
        pbImg.className += 'pogswap'; // ensures we don't waste cycles on buttons that have been changed.
      }
    }
  });
});

const pickerDialogObserver = new MutationObserver((muts, obs) => {
  muts.forEach((mut) => {
    // Picker button clicked for the first time
    if (mut.type === 'childList') {
      pickerDialogObserver.disconnect();
      listeners['pickerD'] = false;
      picker = document.getElementsByClassName('emote-picker')[0];
      picker
        .querySelector('input[type="search"]')
        .addEventListener('input', (e) => {
          if (e.target.value.length > 0 && !searching) {
            searching = true;
          } else if (e.target.value.length === 0) {
            searching = false;
          }
        });
      const scrollContent = mut.addedNodes[0].getElementsByClassName(
        'simplebar-content emote-picker__scroll-container',
      )[0];
      if (scrollContent != null) {
        swapPogButtons(mut.addedNodes[0]);
        scrollObserver.observe(scrollContent.children[0], {
          childList: true,
          subtree: true,
        });
        listeners['scroll'] = true;
      }
      pickerObserver.observe(picker, { childList: true });
      pickerVisObserver.observe(pickerParentBlock.children[0], {
        attributes: true,
        attributeFilter: ['class'],
      });
      listeners['picker'] = true;
    }
  });
});

const runPicker = () => {
  const emoteContent = pickerParentBlock.getElementsByClassName(
    'emote-picker__content-block',
  );
  if (emoteContent.length > 0) {
    for (let x = 0, l = emoteContent.length; x < l; x++) {
      swapPogButtons(emoteContent[x]);
    }
    scrollObserver.observe(
      pickerParentBlock.children[0].getElementsByClassName(
        'simplebar-content emote-picker__scroll-container',
      )[0].children[0],
      { childList: true, subtree: true },
    );
    listeners['scroll'] = true;
  } else if (pickerParentBlock && !listeners['pickerD']) {
    pickerDialogObserver.observe(pickerParentBlock, { childList: true });
    listeners['pickerD'] = true;
  }
};
// End Picker

// Live Chat
const getAndSwapEmotes = (chatMessage) => {
  const emotes = chatMessage.getElementsByClassName(
    'chat-line__message--emote',
  );
  for (let x = 0, l = emotes.length; x < l; x++) {
    const img = emotes[x];
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
  if (pickerParentBlock) {
    runPicker();
  }

  chatObserver.observe(chatList, { childList: true });
  // Get messages that had already loaded.
  // Preload may catch messages already read by the observer, but this is minor and ensures no messages are missed.
  for (let x = 0, preload = chatList.children.length; x < preload; x++) {
    getAndSwapEmotes(chatList.children[x]);
  }
  listeners['chat'] = true;

  if (cardHolder) {
    runCard();
  }
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
    'video-chat__message-list-wrapper',
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
    cardHolder = document.getElementsByClassName('viewer-card-layer')[0];
  }

  if (!pickerParentBlock) {
    pickerParentBlock =
      document.getElementsByClassName('chat-input')[0]?.children[1]
        ?.children[0];
  }

  if (!chatList) {
    chatList = document.getElementsByClassName(
      'chat-scrollable-area__message-container',
    )[0];
  }

  if (ctr >= 6) {
    if (chatList) {
      console.log(
        `Running live, card: ${!!cardHolder} | picker: ${!!pickerParentBlock}`,
      );
      runLive();
    }
    return;
  }

  if (!cardHolder || !pickerParentBlock || !chatList) {
    setTimeout(fetchElements, ctr * 1000, ctr + 1);
  } else {
    console.log('Running live');
    runLive();
  }
};

const start = () => {
  const loc = window.location.pathname.split('/')[1];
  if (loc) {
    if (loc === 'videos') {
      console.log('vod');
      runVod();
    } else {
      console.log('live');
      fetchElements(1);
    }
  }
};

let waiters = 0;
chrome.runtime.onMessage.addListener((msg) => {
  console.log('message received');
  waiters++;
  if (msg.status === 'changed') {
    for (const key in listeners) {
      if (listeners[key]) {
        switch (key) {
          case 'card':
            cardObserver.disconnect();
            cardHolder = null;
            break;
          case 'pickerD':
            pickerDialogObserver.disconnect();
            pickerParentBlock = null;
            break;
          case 'picker':
            pickerObserver.disconnect();
            pickerVisObserver.disconnect();
            picker = null;
          case 'scroll':
            scrollObserver.disconnect();
            pickerParentBlock = null;
            break;
          case 'search':
            searchObserver.disconnect();
            searching = false;
          case 'chat':
            chatObserver.disconnect();
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
console.log('Loaded Pog');
start();
