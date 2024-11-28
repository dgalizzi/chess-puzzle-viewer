#!/usr/bin/env bash

npm run build
rm -rf docs
rsync -av dist/ docs/
