#! /bin/sh
# /etc/init.d/lsserver.sh

### BEGIN INIT INFO
# Provides:          LightSword
# Required-Start:    
# Required-Stop:     
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: LightSword Server
# Description:       LightSword Secure Socks5 Proxy
### END INIT INFO

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