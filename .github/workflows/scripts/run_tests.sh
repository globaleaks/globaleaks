#!/bin/bash
set -e

echo "Running setup"
sudo apt-get update
sudo apt-get install -y tor

cd $GITHUB_WORKSPACE/backend  # to install backend dependencies
python3 -mvenv env
source env/bin/activate
pip3 install coverage
pip3 install -r requirements/requirements-$(lsb_release -cs).txt

cd $GITHUB_WORKSPACE/client  # to install frontend dependencies
npm install -d
./node_modules/grunt/bin/grunt build_for_testing

cd $GITHUB_WORKSPACE/backend && coverage run -m twisted.trial globaleaks.tests
cd $GITHUB_WORKSPACE/backend && coverage lcov -o $GITHUB_WORKSPACE/backend/lcov.info

cd $GITHUB_WORKSPACE/backend && coverage run --append ./bin/globaleaks -z -n &

sleep 5

# Running client tests locally
echo "Running client tests locally collecting code coverage"
cd $GITHUB_WORKSPACE/client && npm test

sleep 5

sudo killall coverage --wait

cd $GITHUB_WORKSPACE/backend && coverage lcov -o $GITHUB_WORKSPACE/backend/lcov.info
sed -i 's|SF:globaleaks/|SF:backend/globaleaks/|g' $GITHUB_WORKSPACE/backend/lcov.info
bash <(curl -Ls https://coverage.codacy.com/get.sh) report -l Python -r $GITHUB_WORKSPACE/backend/lcov.info

sed -i 's|SF:dist/|SF:client/|g' $GITHUB_WORKSPACE/client/cypress/coverage/lcov.info
bash <(curl -Ls https://coverage.codacy.com/get.sh) report -l TypeScript -r $GITHUB_WORKSPACE/client/cypress/coverage/lcov.info
