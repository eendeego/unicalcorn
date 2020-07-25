# Installation

## Setup Raspberry Pi for Unicalcorn

### Prepare SD

Start on laptop

Download Raspberry Pi OS (32-bit) Lite from [raspbberry pi official site](https://www.raspberrypi.org/downloads/raspberry-pi-os/)

```sh
cd <my work dir>
curl --remote-name -L https://downloads.raspberrypi.org/raspios_lite_armhf_latest
```

Dowloaded file is `raspios_lite_armhf_latest`. Unzip:

```sh
unzip raspios_lite_armhf_latest
```

Result is `2020-05-27-raspios-buster-lite-armhf.img`

"Burning" the SD:

```sh
diskutil list
```

Output:

```
(...)
/dev/disk2 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *15.9 GB    disk2
   1:             Windows_FAT_32 NO NAME                 15.9 GB    disk2s1
```

SD Card is **`/dev/disk2`**: Right capacity - 16GB, default FS is Fat 32.

Note that according to all disks mounted, eg, USB pens or disks this number may be different.

Continuing:

(Change `DEV` as appropriate)

```sh
export DEV=/dev/rdisk2
diskutil unmountDisk $DEV
```

Then, if you have homebrew's coreutils

```sh
sudo gdd bs=1M if=2020-05-27-raspios-buster-lite-armhf.img of=$DEV status=progress
sync
```

Otherwise

```sh
sudo dd bs=1m if=2020-05-27-raspios-buster-lite-armhf.img of=$DEV
# While waiting, press Ctrl-T to show progress
sync
```

To unmount and wrap up:

```sh
diskutil eject $DEV
rm 2020-05-27-raspios-buster-lite-armhf.img
```

**Don't forget to sync!**

### First boot

_Grab a keyboard and connect the Raspberry Pi to a display!_

First boot will resize partitions to use full SD card.

Then login as `pi`.

```
sudo raspi-config
```

- "Change User Password"
- Network
  - Hostname: "unicalcorn"
  - Wireless LAN: ...
- Boot Options
  - Desktop / CLI => Console
  - Wait for Network at Boot => Enable
- Localisation
  - Change Locale
    - Locales:
      - Disable:
        - en_GB.UTF-8
      - Enable:
        - en_US.UTF-8
      - (Note: Enabling more will make updates slower)
    - Default locale: en_US
  - Change Timezone
    - (eg. America > Los_Angeles)
  - Change Keyboard Layout
    - Generic 104-key PC > Ohter > English (US) > English (US)
    - Layouts:
      - AltGr > "The default for the keyboard layout"
      - Multi_key > No compose key
- Interfacing options
  - SSH > Enable
  - SPI > Yes
- Advanced Options
  - Memory Split > 16
- Update
- Exit

Reboot with new firmware options enabled

```sh
sudo reboot
```

_Make sure you can access the PI via SSH, then, unplug keyboard, display, and move PI to final location. All the instructions beyond this point are copy-paste easy / heavy._

---

Back to laptop:

```sh
ssh pi@unicalcorn
```

### Configuring permissions / devices

Disable powermanagement on Wi-Fi chip. (Default will aggressively disable network)

```sh
sudo vi /etc/rc.local
```

Before `exit 0`, add:

```sh
/sbin/iwconfig wlan0 power off
```

```sh
sudo reboot
```

After reconnecting:

```sh
iwconfig wlan0
```

Should show (among other things):

```
          Power Management:off
```

Enable access to PowerMate USB for regular users

```sh
sudo sh -c 'cat <<EOF >>/etc/udev/rules.d/99-powermate.rules
SUBSYSTEM=="input", GROUP="input", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="077d", ATTRS{idProduct}=="0410", MODE:="666", GROUP="plugdev"
EOF'
```

Enabling access to Bluetooth (for PowerMate Bluetooth)

```sh
sudo setcap 'cap_net_raw,cap_net_admin+eip' `which hcitool`
```

Detect PowerMate Bluetooth

```sh
hcitool lescan
```

Then press the PowerMate (multiple times: may take a while)

Example output:

```txt
11:22:33:44:55:66 PowerMate Bluetooth
```

(Save this mac address)

## Unicalcorn

### General development tools

```sh
sudo apt install git
```

### Node

Install `nvm`

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Then run the commands that it outputs

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

**Important**

`nvm` must be made available for non interactive scripts.

```sh
vi ~/.bashrc
```

Move these two lines to the begining of the file, before the `case $- in` statement:

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
```

---

Install Node 14+

```
nvm ls-remote | tail -n 5
```

Choose the latest version of node (assuming 14.6.0) **(Don't copy the "v" letter in the version number!)**, then:

```
export NODE_VERSION=14.6.0
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION
```

Add permissions for Bluetooth access:

```sh
sudo setcap 'cap_net_raw,cap_net_admin+eip' `which node`
```

### Unicalcorn

```sh
git clone https://github.com/eendeego/unicalcorn.git
cd unicalcorn
npm install
```

(Note: Couldn't figure out how to use github packages with yarn)

```sh
mkdir ~/.unicalcorn
cp config.json.sample ~/.unicalcorn/config.json
vi ~/.unicalcorn/config.json
```

Update calendar uri, and powermate-ble mac address.

Test it:

```sh
node src /home/pi/.unicalcorn/config.json
```

**Works!!**

Install Forever (Unix service support)

```sh
npm install -g forever
npm install -g forever-service
```

#### Configure / Test forever

```sh
sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v14.4.0/bin forever start -m 1 src /home/pi/.unicalcorn/config.json
```

**Works!!**

```sh
sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v14.4.0/bin forever list
```

```sh
sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v14.4.0/bin forever stop src
```

#### Configure / Test forever-service

```sh
su - pi -c /home/pi/.nvm/versions/node/v14.4.0/lib/node_modules/forever-service/bin/get-forever-config
```

// strace -s 512 -f \

```sh
sudo -s -- <<EOF
export PATH=$PATH:/home/pi/.nvm/versions/node/v$NODE_VERSION/bin
forever-service install unicalcorn \
 --foreverPath /home/pi/.nvm/versions/node/v$NODE_VERSION/bin \
 -e "UV_THREADPOOL_SIZE=128" \
 -r pi \
 -f " -m 1" \
 --script src \
 -o " /home/pi/.unicalcorn/config.json"
EOF
```

Start the service

```sh
sudo service unicalcorn start
```

To remove

```sh
sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v$NODE_VERSION/bin forever-service delete unicalcorn
```

**Works!!**

## Maintenance

### Configuration

To change network, use:

```
sudo raspi-config
```

- Networking
  - Wireless LAN
    > Set wi-fi SSID

### Updating Unicorncal

Login (via ssh)

Stop service

```sh
sudo service unicalcorn stop
```

```
cd ~/unicalcorn
git pull
```

Verify if configuration is still compatible:

```
cat ~/.unicalcorn/config.json
cat config.json.sample
```

Make necessary adjustments

Start in command line mode

```sh
node src /home/pi/.unicalcorn/config.json
```

If it's working, hit Ctrl-C to stop, then restart the service:

```
sudo service unicalcorn start
```

### Updating node.js

Stop service

```
sudo service unicalcorn stop
```

Save current version, pick new one

```
export OLD_NODE=$(node --version)
nvm ls-remote | tail -n 5
```

Eg. assuming 14.7.0, install new node. **Don't copy the "v" letter in the version number!**

```
export NODE_VERSION=14.7.0
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION
nvm copy-packages $OLD_NODE
```

Add permissions for Bluetooth access:

```sh
sudo setcap 'cap_net_raw,cap_net_admin+eip' `which node`
```

Rebuild modules

```
cd ~/unicalcorn
npm install
```

Start in command line mode

```sh
node src /home/pi/.unicalcorn/config.json
```

If it's working, hit Ctrl-C to stop, then let's update node, and, the service:

```
export OLD_NODE=$(node --version)
sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v$OLD_NODE/bin forever-service delete unicalcorn

sudo -s -- <<EOF
export PATH=$PATH:/home/pi/.nvm/versions/node/v$NODE_VERSION/bin
forever-service install unicalcorn \
 --foreverPath /home/pi/.nvm/versions/node/v\$NODE_VERSION/bin \
 -e "UV_THREADPOOL_SIZE=128" \
 -r pi \
 -f " -m 1" \
 --script src \
 -o " /home/pi/.unicalcorn/config.json"
EOF
```

Remove old node version

```
nvm uninstall $OLD_NODE
```
