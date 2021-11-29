#!/bin/bash

# start homeassistant
docker run -d \
  --name homeassistant \
  --privileged \
  --restart=unless-stopped \
  -e TZ=Europe/Berlin \
  -v $PWD/config:/config \
  --network=host \
  ghcr.io/home-assistant/home-assistant:stable
