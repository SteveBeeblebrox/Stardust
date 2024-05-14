#!/bin/bash

# https://github.com/iovisor/bcc/blob/master/INSTALL.md

cd `dirname $0`
apt-get install flex bison libssl-dev libelf-dev dwarves

KERNEL_VERSION=$(uname -r | cut -d '-' -f 1)
git clone --depth 1 https://github.com/microsoft/WSL2-Linux-Kernel.git -b linux-msft-wsl-$KERNEL_VERSION
cd WSL2-Linux-Kernel

cp Microsoft/config-wsl .config
echo >> .config
echo 'CONFIG_IKHEADERS=m' >> .config
make oldconfig && make prepare
make scripts
make modules
sudo make modules_install

mkdir -p /lib/modules/$KERNEL_VERSION-microsoft-standard-WSL2/
mv /lib/modules/$KERNEL_VERSION-microsoft-standard-WSL2+/* /lib/modules/$KERNEL_VERSION-microsoft-standard-WSL2/
# sudo rm -rf /lib/modules/5.15.146.1-microsoft-standard-WSL2+


# sudo apt-get install bpfcc-tools

# sudo apt-get install libbpfcc-dev