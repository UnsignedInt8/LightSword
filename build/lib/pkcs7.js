/*
 * pkcs7.pad
 * https://github.com/brightcove/pkcs7
 *
 * Copyright (c) 2014 Brightcove
 * Licensed under the apache2 license.
 */
'use strict';
// Pre-define the padding values
const PADDING = [
    [16, 16, 16, 16,
        16, 16, 16, 16,
        16, 16, 16, 16,
        16, 16, 16, 16],
    [15, 15, 15, 15,
        15, 15, 15, 15,
        15, 15, 15, 15,
        15, 15, 15],
    [14, 14, 14, 14,
        14, 14, 14, 14,
        14, 14, 14, 14,
        14, 14],
    [13, 13, 13, 13,
        13, 13, 13, 13,
        13, 13, 13, 13,
        13],
    [12, 12, 12, 12,
        12, 12, 12, 12,
        12, 12, 12, 12],
    [11, 11, 11, 11,
        11, 11, 11, 11,
        11, 11, 11],
    [10, 10, 10, 10,
        10, 10, 10, 10,
        10, 10],
    [9, 9, 9, 9,
        9, 9, 9, 9,
        9],
    [8, 8, 8, 8,
        8, 8, 8, 8],
    [7, 7, 7, 7,
        7, 7, 7],
    [6, 6, 6, 6,
        6, 6],
    [5, 5, 5, 5,
        5],
    [4, 4, 4, 4],
    [3, 3, 3],
    [2, 2],
    [1]
];
function pad(plaintext) {
    var padding = PADDING[(plaintext.length % 16) || 0], result = new Uint8Array(plaintext.length + padding.length);
    result.set(plaintext);
    result.set(padding, plaintext.length);
    return result;
}
exports.pad = pad;
;
function unpad(padded) {
    return padded.subarray(0, padded.length - padded[padded.length - 1]);
}
exports.unpad = unpad;
;
exports.PKCS7Size = 16;
