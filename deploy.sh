#!/bin/bash
if [ ! -d "dist" ]; then
  mkdir dist
fi
#: ${deploytarget:=nagbert}

#tar -zcf dist/nagbert.tar.gz node_modules index.js package.json
echo 'Wrote package dist/nagbert.tar.gz'

#scp dist/nagbert.tar.gz ${deploytarget}:.
#scp nagbert.service ${deploytarget}:.
echo 'Copied tarball to destination'

#ssh -X ${deploytarget} 'mkdir -p nagbert && tar -xzf nagbert.tar.gz -C nagbert'
#ssh -X ${deploytarget} 'sudo systemctl stop nagbert.service'
#ssh -X ${deploytarget} 'sudo cp nagbert.service /etc/systemd/system/nagbert.service'
#ssh -X ${deploytarget} 'sudo systemctl start nagbert.service'

echo 'Installed service nagbert'
