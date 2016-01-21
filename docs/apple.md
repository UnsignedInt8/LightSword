
VPN
---

```
--------------------Request---------------------

+---------+--------------+---------+-----------+
| IP TYPE | PAYLOAD TYPE | DEST IP | DEST PORT |
+---------+--------------+---------+-----------+
| 1       | 1            | 4 - 16  | 2         |
+---------+--------------+---------+-----------+

IP TYPE: IPv4, IPv6
PAYLOAD TYPE: TCP, UDP
DEST IP: Destination IP
DEST PORT: Destination Port

--------------------Response--------------------

+--------+--------+
| RESULT | REASON |
+--------+--------+
| 1      | 1      |
+--------+--------+

RESULT: Connection result. SUCCEED, FAILED
REASON: The reason of failure
```