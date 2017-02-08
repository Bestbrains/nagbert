#!/bin/bash
if [ ! -d "dist" ]; then
  mkdir dist
fi
: ${deploytarget:=nagbert}

tar -zcf dist/nagbert.tar.gz node_modules index.js package.json _info.json
echo 'Wrote package dist/nagbert.tar.gz'

scp dist/nagbert.tar.gz ${deploytarget}:. >> deploy.log
scp nagbert.service ${deploytarget}:. >> deploy.log
echo 'Copied tarball to destination'

ssh -X ${deploytarget} 'mkdir -p nagbert && tar -xzf nagbert.tar.gz -C nagbert' >> deploy.log
ssh -X ${deploytarget} 'sudo systemctl stop nagbert.service' >> deploy.log
ssh -X ${deploytarget} 'sudo cp nagbert.service /etc/systemd/system/nagbert.service' >> deploy.log
ssh -X ${deploytarget} 'sudo systemctl start nagbert.service' >> deploy.log

echo 'Installed service nagbert'
scp deploy.log ${deploytarget}:.
