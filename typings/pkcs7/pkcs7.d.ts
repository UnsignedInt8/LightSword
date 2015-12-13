declare module 'pkcs7' {
	export function pad(plain: Uint8Array|Buffer): Uint8Array;
	export function unpad(padded: Uint8Array|Buffer): Uint8Array;
}