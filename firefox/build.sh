#!/usr/bin/env bash

npm ci
npm run build --if-present
cd dist
zip -r ../pogext.zip *