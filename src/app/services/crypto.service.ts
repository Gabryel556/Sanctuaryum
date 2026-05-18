import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly BLOCK_SIZE = 32;
  private readonly PAYLOAD_SIZE = 28;
  private readonly KEY_HEADER_SIZE = 4;
  private readonly MIN_OUTPUT_BYTES = 64;
  private myKeyPair: CryptoKeyPair | null = null;
  private derivedChimeraKey: string | null = null;
  private sBox: number[] = [];
  private invSBox: number[] = [];

  constructor() { }

  async generateMyKeys(): Promise<JsonWebKey> {
    this.myKeyPair = await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]
    );
    return await window.crypto.subtle.exportKey("jwk", this.myKeyPair.publicKey);
  }

  async computeSharedSecret(peerPublicKeyJWK: JsonWebKey): Promise<boolean> {
    if (!this.myKeyPair) return false;
    try {
      const peerKey = await window.crypto.subtle.importKey(
        "jwk", peerPublicKeyJWK, { name: "ECDH", namedCurve: "P-256" }, false, []
      );
      const sharedBits = await window.crypto.subtle.deriveBits(
        { name: "ECDH", public: peerKey }, this.myKeyPair.privateKey, 256
      );
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", sharedBits);
      this.derivedChimeraKey = this.bufferToString(hashBuffer);

      this.initializeDynamicSBox(this.derivedChimeraKey);

      console.log("🔐 [V3] S-Box Gerada e Chave Derivada.");
      return true;
    } catch (e) {
      console.error("Erro Handshake:", e);
      return false;
    }
  }

  private initializeDynamicSBox(key: string) {
    this.sBox = Array.from({ length: 256 }, (_, i) => i);

    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.sBox[i] + key.charCodeAt(i % key.length)) % 256;
      [this.sBox[i], this.sBox[j]] = [this.sBox[j], this.sBox[i]];
    }

    this.invSBox = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.invSBox[this.sBox[i]] = i;
    }
  }

  encrypt(text: string): string {
    if (!this.derivedChimeraKey || !text) return '';

    const payload = '||' + text;
    let targetLen = Math.max(this.MIN_OUTPUT_BYTES, Math.ceil(payload.length / this.BLOCK_SIZE) * this.BLOCK_SIZE);
    if (targetLen - payload.length < 16) targetLen += this.BLOCK_SIZE;

    const noise = this.generateNoise(targetLen - payload.length);
    const fullTextBytes = new TextEncoder().encode(noise + payload);
    const resultBytes: number[] = [];

    let rollingKeyBlock = this.getKeyBlock(0);

    for (let i = 0; i < fullTextBytes.length; i += this.PAYLOAD_SIZE) {
      let chunk = Array.from(fullTextBytes.slice(i, i + this.PAYLOAD_SIZE));

      const processedChunk = this.processBlockV3(chunk, rollingKeyBlock, true);
      resultBytes.push(...processedChunk);

      rollingKeyBlock = this.evolveKey(rollingKeyBlock, processedChunk);
    }

    return this.toHex(resultBytes).toUpperCase();
  }

  decrypt(hexString: string): string {
    if (!hexString) return '';
    if (!this.derivedChimeraKey) return hexString;
    try {
      if (hexString.length % 2 !== 0 || !/^[0-9A-Fa-f]+$/.test(hexString)) {
        return hexString;
      }
      const bytes = this.fromHex(hexString);
      const resultBytes: number[] = [];

      let rollingKeyBlock = this.getKeyBlock(0);

      for (let i = 0; i < bytes.length; i += this.PAYLOAD_SIZE) {
        let chunk = Array.from(bytes.slice(i, i + this.PAYLOAD_SIZE));

        const decryptedChunk = this.processBlockV3(chunk, rollingKeyBlock, false);
        resultBytes.push(...decryptedChunk);

        rollingKeyBlock = this.evolveKey(rollingKeyBlock, chunk);
      }

      const fullText = new TextDecoder().decode(new Uint8Array(resultBytes));
      const separatorIndex = fullText.indexOf('||');
      return separatorIndex !== -1 ? fullText.substring(separatorIndex + 2) : fullText;

    } catch (e) {
      console.error("Erro Decrypt V3:", e);
      return hexString;
    }
  }

  private processBlockV3(bytes: number[], keyBlock: string, isEncrypt: boolean): number[] {
    const opCode = keyBlock.charCodeAt(0);
    const shift = keyBlock.charCodeAt(1) % 10;
    const mutation = keyBlock.charCodeAt(2) % 2;
    const salt = keyBlock.charCodeAt(3);
    const keyPayload = keyBlock.substring(this.KEY_HEADER_SIZE);

    if (isEncrypt) {
      if (mutation === 1) bytes.reverse();
      let prev = salt;
      for (let k = 0; k < bytes.length; k++) {
        bytes[k] = bytes[k] ^ prev;
        prev = bytes[k];
      }
    }

    const processed = bytes.map((byte, index) => {
      const keyByte = keyPayload.charCodeAt(index % keyPayload.length);

      let val = byte;
      if (isEncrypt) {
        if (opCode % 2 === 0) val = val ^ keyByte;
        else val = (val + keyByte) % 256;

        val = this.sBox[val];

        val = (val + shift) % 256;
      } else {
        val = (val - shift + 256) % 256;
        val = this.invSBox[val];

        if (opCode % 2 === 0) val = val ^ keyByte;
        else { val = (val - keyByte); while (val < 0) val += 256; val = val % 256; }
      }
      return val;
    });

    if (!isEncrypt) {
      let prev = salt;
      const temp = [...processed];
      for (let k = 0; k < processed.length; k++) {
        const currentEncrypted = temp[k];
        processed[k] = processed[k] ^ prev;
        prev = currentEncrypted;
      }
      if (mutation === 1) processed.reverse();
    }

    return processed;
  }

  private evolveKey(currentKey: string, feedbackBytes: number[]): string {
    let newKey = "";
    for (let i = 0; i < currentKey.length; i++) {
      const charCode = currentKey.charCodeAt(i);
      const feedback = feedbackBytes[i % feedbackBytes.length] || 0;
      const newChar = this.sBox[(charCode + feedback) % 256];
      newKey += String.fromCharCode(newChar);
    }
    return newKey;
  }

  private getKeyBlock(index: number): string {
    const key = this.derivedChimeraKey || "DEFAULT_KEY_fallback";
    const safeIndex = index % key.length;
    let block = key.substring(safeIndex, safeIndex + this.BLOCK_SIZE);
    if (block.length < this.BLOCK_SIZE) block += key.substring(0, this.BLOCK_SIZE - block.length);
    return block;
  }
  private generateNoise(len: number): string {
    let r = ''; const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    for (let i = 0; i < len; i++) r += c.charAt(Math.floor(Math.random() * c.length)); return r;
  }
  private toHex(b: number[]): string { return b.map(x => x.toString(16).padStart(2, '0')).join(''); }
  private fromHex(h: string): Uint8Array {
    const b = new Uint8Array(h.length / 2);
    for (let i = 0; i < h.length; i += 2) b[i / 2] = parseInt(h.substr(i, 2), 16); return b;
  }
  private bufferToString(buf: ArrayBuffer): string { return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf))); }
}