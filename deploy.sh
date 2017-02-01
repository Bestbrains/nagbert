#!/bin/bash
if [ ! -d "dist" ]; then
  mkdir dist
fi

tar -zcf dist/nagbert.tar.gz node_modules index.js package.json
echo 'Wrote package dist/nagbert.tar.gz'

scp dist/nagbert.tar.gz nagbert:.
scp nagbert.service nagbert:.
echo 'Copied tarball to destination'

ssh -X nagbert 'mkdir -p nagbert && tar -xzf nagbert.tar.gz -C nagbert'
ssh -X nagbert 'sudo systemctl stop nagbert.service'
ssh -X nagbert 'sudo cp nagbert.service /etc/systemd/system/nagbert.service'
ssh -X nagbert 'sudo systemctl start nagbert.service'

echo 'Installed service nagbert'
