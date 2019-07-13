#!/bin/bash

unset BUNDLE_PATH
unset BUNDLE_BIN

bundle --path vendor/bundle

exec "$@"