#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <iAppAddress>"
  exit 1
fi

IAPP_ADDRESS="$1"

echo "Running app on TDX workerpool..."
EXPERIMENTAL_TDX_APP=true iapp run $IAPP_ADDRESS

echo "Done. Use 'iapp debug <taskId>' to check logs and results."