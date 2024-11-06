#!/bin/sh
set -e

# Check if swarm key file exists
if [ ! -f /data/ipfs/swarm.key ]; then
  echo "Swarm key does not exist. Generating..."
  echo "/key/swarm/psk/1.0.0/" >> /data/ipfs/swarm.key 
  echo "/base16/" >> /data/ipfs/swarm.key
  echo $IPFS_SWARM_KEY >> /data/ipfs/swarm.key
  ipfs init
  SETUP_WEBUI=true
fi

ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:5001", "http://127.0.0.1:8080", "http://0.0.0.0:5001", "http://0.0.0.0:8080", "http://localhost:5001", "http://localhost:8080"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'

ipfs bootstrap rm --all
ipfs bootstrap add /ip4/$(hostname -i)/tcp/4001/ipfs/$(ipfs config show | grep "PeerID" |  sed 's/^.*: "\(.*\)"$/\1/')
ipfs daemon &
if [[ -d /webui && "$SETUP_WEBUI" = true ]]; then
  echo "WebUI does not exist. Setting it up..."
  sleep 5
  ipfs add -r /webui/bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q
  ipfs dag import /webui/bafybeibozpulxtpv5nhfa2ue3dcjx23ndh3gwr5vwllk7ptoyfwnfjjr4q.dag
fi
tail -f /dev/null
