<p>
<a href="https://chrome.google.com/webstore/detail/actual-pogchamp/gbkjnejppojphhgjpfnbbmnohmgbbbdg"><img src="https://img.shields.io/chrome-web-store/v/gbkjnejppojphhgjpfnbbmnohmgbbbdg"></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/actual-pogchamp/"><img src="https://img.shields.io/amo/v/actual-pogchamp"></a>
</p>

# Actual PogChamp

A web extension that replaces the current PogChamp emote on twitch.tv with the original Gootecks version of the emote

## Why?

The original PogChamp emote is iconic and some will never be happy with Twitch's replacement(s). This extension helps with that, by providing the original PogChamp emote entirely locally.

## How?

MutationObservers. Using these, we can keep an eye on key sections of the Twitch website (like the chat window) and swap the emotes as they come in.

### Ok, but _how?_

By swapping the twitch image tags with ones provided in the script. They point to an included version of the original PogChamp emote, and are coded to match the original Twitch versions when it comes to CSS classes.

## How do I install it?

Check out the extension on the [Chrome Web Store](https://chrome.google.com/webstore/detail/actual-pogchamp/gbkjnejppojphhgjpfnbbmnohmgbbbdg) or on [AMO](https://addons.mozilla.org/en-US/firefox/addon/actual-pogchamp/).\
\
You can also check the [releases page](https://github.com/Glasket/pogext/releases), the latest version will always be there with instructions on how to install it manually.

## Can I use this in TamperMonkey?

__Yes__. The gist for the script can be found [here](https://gist.github.com/Glasket/b9e7138024f902dce85e95d06c6bb8e8).\
\
The script runs version 1.2 of the extension, so sitewide on twitch without refreshing.\
_However_, it will be considered out of scope beyond this point. If it breaks for some reason then updates aren't guaranteed as with the extension.

## How can I help?

Send suggestions, open issues, and report bugs. If you really want to you can even contribute here on GitHub.\
\
[Contact](mailto:temperdesignllc@gmail.com)


