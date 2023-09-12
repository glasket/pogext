Instructions are for Linux distributions.

Download the latest Node LTS [from nodejs](https://nodejs.org/en/download) or via your package manager or nvm.

Run:

```bash
make firefox.zip
# Or
npm ci
npm run build --if-present
cd dist/firefox
zip -r ../../firefox.zip *
```

If using the build.sh, then run from the root project directory. You may have to use `chmod +x build.sh`.

The final extension zip will be in the root project directory.
