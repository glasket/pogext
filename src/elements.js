const pogCtor = (src) => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'PogChamp';
  img.className = 'chat-image chat-line__message--emote';
  return img;
};

const pogPickerCtor = (pog) => {
  const img = pog.cloneNode();
  img.className = 'emote-picker__image';
  return img;
};

const bigPogCtor = (pog) => {
  const img = pog.cloneNode();
  img.className = 'emote-card__big-emote tw-image';
  img.setAttribute('data-test-selector', 'big-emote');
  return img;
};

export { pogCtor, pogPickerCtor, bigPogCtor };
