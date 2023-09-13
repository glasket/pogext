chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    console.log(details);
    chrome.tabs.sendMessage(details.tabId, { status: 'changed' });
  },
  { url: [{ hostEquals: 'twitch.tv' }, { hostEquals: 'www.twitch.tv' }] },
);
