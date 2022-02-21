# Installation as an isolated user

## Setup

On personal machine/laptop:

```sh
export PI="unicalcorn"
export UNAME="unicalcorn"
```

### Create service user:

```sh
ssh pi@$PI <<EOF
echo Creating User: $UNAME
sudo adduser --quiet --disabled-password $UNAME < /dev/null
sudo adduser $UNAME spi
sudo adduser $UNAME input
sudo adduser $UNAME plugdev
EOF
```

### Setup SSH

```sh
ssh-keygen -t ed25519 -a 100 -q -N '' -f ~/.ssh/unicalcorn
```

Copy to PI admin user

```sh
cat ~/.ssh/unicalcorn.pub | ssh pi@$PI 'mkdir .ssh;cat >> .ssh/authorized_keys'
```

Copy to PI service ($UNAME) user

```sh
ssh pi@$PI "sudo -u $UNAME bash -c \"mkdir ~/.ssh\""
cat ~/.ssh/unicalcorn.pub |\
  ssh pi@$PI "sudo -u $UNAME -- bash -c \"cat >> ~/.ssh/authorized_keys\""
ssh pi@$PI "sudo -u $UNAME -- bash -c \"chmod 0700 ~/.ssh;chmod 0444 ~/.ssh/authorized_keys\""
```

### Install NVM

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash"
```

**Important**: `nvm` must be made available for non interactive scripts.

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
grep -i nvm .bashrc > /tmp/nvmrc
echo "" >> /tmp/nvmrc
grep -v -i nvm .bashrc > /tmp/bashrc-nonvm
sed '/# If not running interactively/e cat /tmp/nvmrc' /tmp/bashrc-nonvm > .bashrc
rm /tmp/{nvmrc,bashrc-nonvm}
EOF
```

#### Install latest version of Node 14

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
nvm install 14
EOF
```

`npm install` will also make this version the default

#### Permissions for Node Bluetooth access

```sh
export NODE_BIN=`ssh -i ~/.ssh/unicalcorn $UNAME@$PI 'which node'`
ssh pi@$PI <<EOF
sudo setcap 'cap_net_raw,cap_net_admin+eip' $NODE_BIN
EOF
```

### Unicalcorn

Install from github

```sh
ssh pi@$PI <<EOF
sudo apt-get install -y libusb-1.0-0-dev libudev-dev
EOF
```

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
#git clone https://github.com/eendeego/unicalcorn.git
cd unicalcorn
npm install
EOF
```

#### Configuration

export ICAL_URL="my-ical-url"
export POWERMATE_BLE="my-powermate-ble-mac-address"

```sh
export ESCAPED_ICAL_URL=`echo -n $ICAL_URL | perl -pe 's/\\@/\\\\@/g'`
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
mkdir ~/.unicalcorn
perl -pe\
 's|https://calendar.google.com/calendar/ical/|$ESCAPED_ICAL_URL|;s|<mac-address>|$POWERMATE_BLE|'\
 <unicalcorn/config.json.sample\
 >~/.unicalcorn/config.json
EOF
```

Test it:

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
cd ~/unicalcorn
node src /home/$UNAME/.unicalcorn/config.json
EOF
```

### Configure / Test Forever

Forever runs in Node, and we need to use the pi admin user to execute it, so, install node for `pi`:

```sh
ssh pi@$PI "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash"
```

**Important**: `nvm` must be made available for non interactive scripts.

```sh
ssh pi@$PI <<EOF
grep -i nvm .bashrc > /tmp/nvmrc
echo "" >> /tmp/nvmrc
grep -v -i nvm .bashrc > /tmp/bashrc-nonvm
sed '/# If not running interactively/e cat /tmp/nvmrc' /tmp/bashrc-nonvm > .bashrc
rm /tmp/{nvmrc,bashrc-nonvm}
EOF
```

Install node and forever

```sh
ssh pi@$PI <<EOF
nvm install 14
npm install -g forever-service
EOF
```

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
npm install -g forever forever-monitor
EOF
```

`forever` currently ignores "--plain" (seems to be bug [#958](https://github.com/foreversd/forever/issues/958)), which in turn breaks `forever-service`.

```sh
ssh pi@$PI sudo apt-get install -y colorized-logs
```

#### Run it!

```sh
ssh pi@$PI <<EOF
sudo -u $UNAME -- bash -c "\
 PATH=`dirname $NODE_BIN`:\$PATH forever start -m 1 --sourceDir ~$UNAME/unicalcorn --workingDir ~$UNAME/unicalcorn --minUptime 5000 --spinSleepTime 50000 src ~$UNAME/.unicalcorn/config.json"
EOF
```

It should be working. When that is done, run:

```sh
ssh -i ~/.ssh/unicalcorn $UNAME@$PI <<EOF
 pkill -u $UNAME --signal 9 node
EOF
```

#### Install service

Forever service has a bug installing the service with the `--runAsUser` option: it won't cd to the right directory, so, the path to `index.js` here needs to be the full path.

```sh
export PI_NODE_BIN=`ssh pi@$PI 'which node'`
ssh pi@$PI "sudo bash <<EOF
  PATH=`dirname $PI_NODE_BIN`:\$PATH \
  forever-service install \
    --foreverPath `dirname $NODE_BIN` \
    --envVars \"UV_THREADPOOL_SIZE=128\" \
    --noGracefulShutdown\
    --foreverOptions \" -m 1 --sourceDir /home/$UNAME/unicalcorn --workingDir /home/$UNAME/unicalcorn --minUptime 5000 --spinSleepTime 10000 --killSignal SIGKILL\" \
    --script /home/$UNAME/unicalcorn/src/index.js \
    --scriptOptions \" /home/$UNAME/.unicalcorn/config.json\" \
    --runAsUser $UNAME \
    unicalcorn
EOF"
```

Fix permissions and init script

(`ansi2txt` is part of `colorized-logs` above)

```sh
ssh pi@$PI "sudo bash <<EOF
  chown unicalcorn.unicalcorn -R /home/$UNAME/.forever
  perl -pi -e 's|cd /home/pi|cd /home/$UNAME|;s|/home/$UNAME/unicalcorn/src/index.js|src/index.js|;s/(--plain list)/\\\$1 | ansi2txt/g' /etc/init.d/unicalcorn
  systemctl daemon-reload
EOF"
```

Start it!

```sh
ssh pi@$PI "sudo service unicalcorn start"
```

Use only on failure

```sh
export PI_NODE_BIN=`ssh pi@$PI 'which node'`
ssh pi@$PI "sudo bash <<EOF
  PATH=`dirname $PI_NODE_BIN`:\$PATH \
  forever-service delete unicalcorn
EOF"
```

```sh
ssh pi@$PI "sudo service unicalcorn stop"
```
