import { start, stop, init } from './pog';

init(chrome.runtime.getURL('images/128.png'));

chrome.runtime.onMessage.addListener((msg) => {
  console.log('message received');
  if (msg.status === 'changed') {
    stop();
  }
});

console.log('starting');
start();
