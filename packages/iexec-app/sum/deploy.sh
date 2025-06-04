#!/bin/bash
set -e

# Set chain to bellecour (id: 134)
echo "Setting chain to bellecour..."
iexec chains edit --chain bellecour

echo "Deploying iApp to Bellecour..."
IAPP_ADDRESS=$(iexec app deploy --chain bellecour | grep -oE '0x[a-fA-F0-9]{40}')
echo "iApp deployed at: $IAPP_ADDRESS"

echo "Running test job with mock-surveys.json..."
iexec app run $IAPP_ADDRESS --chain bellecour --args mock-surveys.json

echo "Done. Check the iExec Explorer or use the CLI to monitor your task and download results." 