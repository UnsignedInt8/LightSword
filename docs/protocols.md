# LightSword Protocols

```
------------------Request---------------------

+------+------+------+----------+------------+
| IV   | TYPE | PLEN | RPADDING | SOCKS5DATA |
+------+------+------+----------+------------+
| 8-16 | 1    | 1    | 0-255    | VARIABLE   |
+------+------+------+----------+------------+
| RAW  | ENCRYPTED   | RAW      | ENCRYPTED  |
+------+-------------+----------+------------+

IV: Initialization Vector, 8-16 Bytes.
TYPE: VPN Type, 1 Byte.
PLEN: Random Padding Length, 1 Byte.
RPADDING: Random Padding Bytes, 0-255 Bytes.
SOCKS5DATA: Encrypted Socks5 Protocol Data, Variable Bytes.

---------------Response-----------------

+------+------+----------+-------------+
| IV   | PLEN | RPADDING | SOCKS5REPLY |
+------+------+----------+-------------+
| 8-16 | 1    | 0-255    | VARIABLE    |
+------+------+----------+-------------+
| RAW  | EN   | RAW      | ENCRYPTED   |
+------+------+----------+-------------+

IV: Initialization Vector, 8-16 Bytes.
PLEN: Random Padding Length, 1 Byte.
RPADDING: Random Padding Bytes, 0-255 Bytes.
SOCKS5REPLAY: Encrypted Socks5 Reply Data, Variable Bytes.

```