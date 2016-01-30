
VPN Protocol
---

TCP

```
------------------------Request------------------------

+---------+--------------+-------+---------+-----------+------+
| IP TYPE | PAYLOAD TYPE | FLAGS | DEST IP | DEST PORT | IV   |
+---------+--------------+-------+---------+-----------+------+
| 1       | 1            | 1     | 4 / 16  | 2         | 8-16 |
+---------+--------------+-------+---------+-----------+------+

IP TYPE: IPv4, IPv6
PAYLOAD TYPE: TCP(0x06), UDP(0x11)
FLAGS: Data flow direction (1bit)
DEST IP: Destination IP
DEST PORT: Destination Port
IV: Client Required IV

FLAGS:

+----------+
| 00000000 |
+----------+
| D------- |
+----------| 

Data flow Direction:
0b10000000 Out
0b00000000 In

--------------------Response--------------------

+--------+--------+
| RESULT | REASON |
+--------+--------+
| 1      | 1      |
+--------+--------+

RESULT: Connection result. SUCCEED(0x01), FAILED(0x00)
REASON: The reason of failure
```

UDP

```
--------------------------Request--------------------------

+---------+--------------+---------+-----------+----------+
| IP TYPE | PAYLOAD TYPE | DEST IP | DEST PORT | PAYLOAD  |
+---------+--------------+---------+-----------+----------+
| 1       | 1            | 4 / 16  | 2         | VARIABLE |
+---------+--------------+---------+-----------+----------+

--------------------Response--------------------

+------+----------+
| IV   | PAYLOAD  |
+------+----------+
| 8-16 | VARIABLE |
+------+----------+
```