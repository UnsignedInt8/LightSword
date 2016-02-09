
VPN Protocol
---

TCP (UDP over TCP)

```
------------------------------Request-------------------------------

+--------+--------------+-------+---------+-----------+-----------+
| IP VER | PAYLOAD TYPE | FLAGS | DEST IP | DEST PORT | IV/Data   |
+--------+--------------+-------+---------+-----------+-----------+
| 1      | 1            | 1     | 4 / 16  | 2         | 8-16-Var  |
+--------+--------------+-------+---------+-----------+-----------+

IP TYPE: IPv4, IPv6
PAYLOAD TYPE: TCP(0x06), UDP(0x11)
FLAGS: Option flags
DEST IP: Destination IP
DEST PORT: Destination Port
IV: Client Required IV (TCP) or Data (UDP)

FLAGS:

+----------+
| 00000000 |
+----------+
| D------- |
+----------+ 

0b00000000 Authentication
0b10000000 Data flow

--------------------TCP Response--------------------

+--------+--------+----------+
| RESULT | REASON | PADDING  |
+--------+--------+----------+
| 1      | 1      | 0-255    |
+--------+--------+----------+

RESULT: Connection result. SUCCEED(0x01), FAILED(0x00)
REASON: The reason of failure

--------------------UDP Response--------------------

+------+-----+----------+
| IV   | LEN | PAYLOAD  |
+------+-----+----------+
| 8-16 | 2   | VARIABLE |
+------+-----+----------+
```
