
TCP
---

```
------------------Request---------------------

+------+------+------+----------+------------+
| IV   | TYPE | PLEN | RPADDING | PAYLOAD    |
+------+------+------+----------+------------+
| 8-16 | 1    | 1    | 0-255    | VARIABLE   |
+------+------+------+----------+------------+
| RAW  | ENCRYPTED                           |
+------+-------------------------------------+

IV: Initialization Vector, 8-16 Bytes.
TYPE: VPN Type, 1 Byte.
PLEN: Random Padding Length, 1 Byte. For OS X, it is used as XOR operator
RPADDING: Random Padding Bytes, 0-255 Bytes.
SOCKS5DATA: Encrypted Socks5 Protocol Data, Variable Bytes.

---------------Response-----------------

+------+------+----------+-------------+
| IV   | PLEN | RPADDING | PAYLOAD     |
+------+------+----------+-------------+
| 8-16 | 1    | 0-255    | VARIABLE    |
+------+------+----------+-------------+
| RAW  | ENCRYPTED                     |
+------+-------------------------------+

IV: Initialization Vector, 8-16 Bytes.
PLEN: Random Padding Length, 1 Byte. For OS X, it's used as XOR operator
RPADDING: Random Padding Bytes, 0-255 Bytes.
SOCKS5REPLAY: Encrypted Socks5 Reply Data, Variable Bytes.

```

UDP
---

```

----------------Request----------------

+------+------+----------+------------+
| IV   | PLEN | RPADDING | SOCKETDATA |
+------+------+----------+------------+
| 8-16 | 1    | 0-255    | VARIABLE   |
+------+------+----------+------------+
| RAW  | ENCRYPTED                    |
+------+------------------------------+


----------------Response---------------

+-----------+
| UDP DGRAM |
+-----------+
| VARIABLE  |
+-----------+
| ENCRYPTED |
+-----------+

```