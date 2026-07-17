// Crypto / Buffer polyfills required by @solana/web3.js, tweetnacl and bs58 on React Native.
// This module is imported FIRST (before expo-router/entry) so the globals exist before any
// app code that touches Solana crypto is evaluated.
import "react-native-gesture-handler";
import "react-native-get-random-values"; // provides crypto.getRandomValues (used by tweetnacl)
import "react-native-url-polyfill/auto"; // complete WHATWG URL for RPC endpoint parsing
import { Buffer } from "buffer";

// @solana/web3.js and bs58 expect a global Buffer.
if (typeof (globalThis as { Buffer?: unknown }).Buffer === "undefined") {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}
