#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <iAppAddress>"
  exit 1
fi

IAPP_ADDRESS="$1"

echo "Running test job with mock-surveys.json on TDX workerpool..."
EXPERIMENTAL_TDX_APP=true iapp run $IAPP_ADDRESS --args mock-surveys.json

echo "Done. Use 'iapp debug <taskId>' to check logs and results."