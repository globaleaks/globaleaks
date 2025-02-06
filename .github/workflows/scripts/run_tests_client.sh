#!/bin/bash

client_test_failed=0

setupBackend() {
  cd $GITHUB_WORKSPACE/backend  # to install backend dependencies
  pip3 install -r requirements/requirements-$(lsb_release -cs).txt
}

setupClient() {
  cd $GITHUB_WORKSPACE/client  # to install frontend dependencies
  npm install -d
  ./node_modules/grunt/bin/grunt build_for_testing
}

echo "Running setup"
sudo apt-get update
sudo apt-get install -y tor
npm install -g grunt grunt-cli
setupBackend
setupClient

$GITHUB_WORKSPACE/backend/bin/globaleaks -z
sleep 5

# Running client tests locally
echo "Running client tests locally collecting code coverage"
cd $GITHUB_WORKSPACE/client && npm test
if [ $? -ne 0 ]; then
  client_test_failed=1
fi

sed -i 's|SF:dist/|SF:client/|g' $GITHUB_WORKSPACE/client/cypress/coverage/lcov.info

bash <(curl -Ls https://coverage.codacy.com/get.sh) report -l TypeScript -r $GITHUB_WORKSPACE/client/cypress/coverage/lcov.info

if [ $client_test_failed -eq 1 ]; then
  echo "Client tests: FAILED"
  exit 1
else
  echo "Client tests: PASSED"
  exit 0
fi
