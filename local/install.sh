# https://github.com/iovisor/bpftrace/issues/2168#issuecomment-1230499942
echo "deb http://ddebs.ubuntu.com $(lsb_release -cs) main restricted universe multiverse
deb http://ddebs.ubuntu.com $(lsb_release -cs)-updates main restricted universe multiverse
deb http://ddebs.ubuntu.com $(lsb_release -cs)-proposed main restricted universe multiverse" | \
sudo tee -a /etc/apt/sources.list.d/ddebs.list
sudo apt install ubuntu-dbgsym-keyring
sudo apt update
sudo apt install bpftrace-dbgsym