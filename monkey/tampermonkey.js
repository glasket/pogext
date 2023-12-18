import { start, stop, init } from '../src/pog';

init('https://raw.githubusercontent.com/glasket/pogext/master/images/128.png');

if (window.onurlchange === null) {
  window.onurlchange = () => {
    stop();
  };
}
start();
