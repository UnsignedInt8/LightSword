#! /bin/sh
# /etc/init.d/lsserver.sh
#

# Carry out specific functions when asked to by the system
case "$1" in
  start)
    lsserver -m aes-128-cfb -f
    ;;
  stop)
    lsserver -d stop
    ;;
  *)
    echo "Usage: /etc/init.d/lsserver.sh {start|stop}"
    exit 1
    ;;
esac

exit 0