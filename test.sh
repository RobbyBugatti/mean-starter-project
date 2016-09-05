#!/bin/sh
####################
#   URLITE TESTING #
####################

### Start a docker container, using test credentials

echo "Starting Test Database"
container=$(sudo docker run -d mongo)

echo "Database started. Begiinning Test Suite"
./node_modules/.bin/mocha --reporter spec

echo "Test Suite Completed"
echo "Shutting down Database Server"

sudo docker stop "$container"

echo "Mongo Container shut down"
echo "Test Environment Finished"
