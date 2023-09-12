build_deps = pog.js background.js manifest.template.json webpack.config.js images/128.png node_modules

.PHONY: all build

all: firefox.zip chrome.zip

firefox.zip: dist/firefox
	cd dist/firefox && zip -r ../../firefox.zip *

chrome.zip: dist/chrome
	cd dist/chrome && zip -r ../../chrome.zip *

dist/firefox: $(build_deps)
	npm run build --if-present

dist/chrome: $(build_deps)
	npm run build-chrome --if-present

node_modules: package-lock.json
	npm ci

build: dist/firefox dist/chrome

clean:
	rm -rf dist firefox.zip chrome.zip
