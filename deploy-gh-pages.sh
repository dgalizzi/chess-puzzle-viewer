#!/usr/bin/env bash

npm run gh
rm -rf docs
rsync -av dist/ docs/
