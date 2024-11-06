#!/bin/bash

. ../.env

# Download the WebUI files since our swarm is not connected to the public IPFS network
mkdir -p webui
pushd webui
curl $IPFS_WEB_TAR_URL | tar -xf -
wget -O bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q.dag -c "$IPFS_WEB_DAG_URL"
popd
