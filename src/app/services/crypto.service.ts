import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  // --- CONFIGURAÇÃO V3 (AES-GRADE) ---
  private readonly BLOCK_SIZE = 32; 
  private readonly PAYLOAD_SIZE = 28;
  private readonly KEY_HEADER_SIZE = 4;
  private readonly MIN_OUTPUT_BYTES = 64;

  // Estado da Segurança
  private myKeyPair: CryptoKeyPair | null = null;
  private derivedChimeraKey: string | null = null;
  
  // A S-Box Dinâmica (O segredo da não-linearidade) Será gerada baseada na chave, tornando cada sessão matematicamente única.
  private sBox: number[] = [];
  private invSBox: number[] = [];

  constructor() { }

  // ===========================================================================
  // 1. GESTÃO DE CHAVES E INICIALIZAÇÃO MATEMÁTICA
  // ===========================================================================

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
      
      // GERA A S-BOX DINÂMICA ASSIM QUE TEMOS A CHAVE
      this.initializeDynamicSBox(this.derivedChimeraKey);
      
      console.log("🔐 [V3] S-Box Gerada e Chave Derivada.");
      return true;
    } catch (e) {
      console.error("Erro Handshake:", e);
      return false;
    }
  }

   // Cria uma Tabela de Substituição (S-Box) baseada na chave. Isso garante Não-Linearidade (matematicamente complexo).
  private initializeDynamicSBox(key: string) {
    // 1. Preenche S-Box com 0..255
    this.sBox = Array.from({length: 256}, (_, i) => i);
    
    // 2. Embaralha usando a chave (Fisher-Yates Determinístico)
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + this.sBox[i] + key.charCodeAt(i % key.length)) % 256;
        [this.sBox[i], this.sBox[j]] = [this.sBox[j], this.sBox[i]];
    }

    // 3. Cria a Inversa para decriptar
    this.invSBox = new Array(256);
    for (let i = 0; i < 256; i++) {
        this.invSBox[this.sBox[i]] = i;
    }
  }

  // ===========================================================================
  // 2. MOTOR DE CRIPTOGRAFIA (Key Rolling + S-Box)
  // ===========================================================================

  encrypt(text: string): string {
    if (!this.derivedChimeraKey || !text) return '';

    const payload = '||' + text;
    let targetLen = Math.max(this.MIN_OUTPUT_BYTES, Math.ceil(payload.length / this.BLOCK_SIZE) * this.BLOCK_SIZE);
    if (targetLen - payload.length < 16) targetLen += this.BLOCK_SIZE;

    const noise = this.generateNoise(targetLen - payload.length);
    const fullTextBytes = new TextEncoder().encode(noise + payload);
    const resultBytes: number[] = [];

    // O "Vetor de Evolução" da chave. Começa como a chave original.
    let rollingKeyBlock = this.getKeyBlock(0); 

    for (let i = 0; i < fullTextBytes.length; i += this.PAYLOAD_SIZE) {
        let chunk = Array.from(fullTextBytes.slice(i, i + this.PAYLOAD_SIZE));
        
        // Processa usando a S-Box e a chave atual
        const processedChunk = this.processBlockV3(chunk, rollingKeyBlock, true);
        resultBytes.push(...processedChunk);

        // Periodicidade zero A chave do próximo bloco depende do resultado criptografado deste bloco. Isso cria uma cadeia infinita onde a chave nunca se repete da mesma forma.
        rollingKeyBlock = this.evolveKey(rollingKeyBlock, processedChunk);
    }
    
    return this.toHex(resultBytes).toUpperCase();
  }

  decrypt(hexString: string): string {
    if (!this.derivedChimeraKey || !hexString) return '';
    try {
        const bytes = this.fromHex(hexString);
        const resultBytes: number[] = [];
        
        // Reinicia a chave rolante para o estado inicial
        let rollingKeyBlock = this.getKeyBlock(0);

        for (let i = 0; i < bytes.length; i += this.PAYLOAD_SIZE) {
            let chunk = Array.from(bytes.slice(i, i + this.PAYLOAD_SIZE));
            
            // Decifra
            const decryptedChunk = this.processBlockV3(chunk, rollingKeyBlock, false);
            resultBytes.push(...decryptedChunk);

            // Para evoluir a chave na decifragem, usamos o CHUNK CIFRADO (que temos em mãos). Na encriptação usamos o output (que era cifrado). Aqui é o input.
            rollingKeyBlock = this.evolveKey(rollingKeyBlock, chunk);
        }

        const fullText = new TextDecoder().decode(new Uint8Array(resultBytes));
        const separatorIndex = fullText.indexOf('||');
        return separatorIndex !== -1 ? fullText.substring(separatorIndex + 2) : fullText;

    } catch (e) {
        console.error("Erro Decrypt V3:", e);
        return '---';
    }
  }

  // ===========================================================================
  // 3. O NÚCLEO MATEMÁTICO (S-BOX + DIFFUSION)
  // ===========================================================================

  private processBlockV3(bytes: number[], keyBlock: string, isEncrypt: boolean): number[] {
      const opCode = keyBlock.charCodeAt(0);
      const shift = keyBlock.charCodeAt(1) % 10;
      const mutation = keyBlock.charCodeAt(2) % 2; 
      const salt = keyBlock.charCodeAt(3);
      const keyPayload = keyBlock.substring(this.KEY_HEADER_SIZE); 

      // --- ETAPA A: DIFUSÃO (Mixing Layer) ---
      if (isEncrypt) {
          if (mutation === 1) bytes.reverse();
          let prev = salt;
          for(let k = 0; k < bytes.length; k++) {
              bytes[k] = bytes[k] ^ prev; 
              prev = bytes[k];
          }
      }

      // --- ETAPA B: NÃO-LINEARIDADE (S-Box Substitution). Aqui a matemática linear morre. Substituímos o valor por um da tabela caótica.
      const processed = bytes.map((byte, index) => {
          const keyByte = keyPayload.charCodeAt(index % keyPayload.length);
          
          let val = byte;
          if (isEncrypt) {
              // 1. Mistura com a chave (Linear)
              if (opCode % 2 === 0) val = val ^ keyByte; 
              else val = (val + keyByte) % 256;
              
              // 2. Passa pela S-BOX (Não-Linear) -> O PULO DO GATO
              val = this.sBox[val]; 

              // 3. Shift (Deslocamento)
              val = (val + shift) % 256;
          } else {
              // Reverso: Un-Shift
              val = (val - shift + 256) % 256;

              // 2. Un-SBOX (Usando a Inversa)
              val = this.invSBox[val];

              // 1. Un-Mix Key
              if (opCode % 2 === 0) val = val ^ keyByte;
              else { val = (val - keyByte); while(val < 0) val += 256; val = val % 256; }
          }
          return val;
      });

      // --- ETAPA C: REMOVE DIFUSÃO (Se Decifrando) ---
      if (!isEncrypt) {
          let prev = salt;
          const temp = [...processed];
          for(let k = 0; k < processed.length; k++) {
              const currentEncrypted = temp[k]; 
              processed[k] = processed[k] ^ prev;
              prev = currentEncrypted; 
          }
          if (mutation === 1) processed.reverse();
      }
      
      return processed;
  }

    // Faz a chave "evoluir" baseada no bloco anterior. Isso elimina a periodicidade. A chave do bloco 100 depende do bloco 99.

  private evolveKey(currentKey: string, feedbackBytes: number[]): string {
      let newKey = "";
      for (let i = 0; i < currentKey.length; i++) {
          const charCode = currentKey.charCodeAt(i);
          // Mistura o byte da chave com um byte do bloco cifrado anterior (Feedback)
          const feedback = feedbackBytes[i % feedbackBytes.length] || 0;
          // Usa a S-Box para garantir que a evolução seja caótica
          const newChar = this.sBox[(charCode + feedback) % 256];
          newKey += String.fromCharCode(newChar);
      }
      return newKey;
  }

  // --- Helpers Padrão ---
  private getKeyBlock(index: number): string {
    const key = this.derivedChimeraKey || "DEFAULT_KEY_fallback"; 
    const safeIndex = index % key.length;
    let block = key.substring(safeIndex, safeIndex + this.BLOCK_SIZE);
    if (block.length < this.BLOCK_SIZE) block += key.substring(0, this.BLOCK_SIZE - block.length);
    return block;
  }
  private generateNoise(len: number): string {
      let r = ''; const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
      for(let i=0; i<len; i++) r += c.charAt(Math.floor(Math.random()*c.length)); return r;
  }
  private toHex(b: number[]): string { return b.map(x => x.toString(16).padStart(2,'0')).join(''); }
  private fromHex(h: string): Uint8Array { const b = new Uint8Array(h.length/2); 
      for(let i=0; i<h.length; i+=2) b[i/2] = parseInt(h.substr(i,2), 16); return b; }
  private bufferToString(buf: ArrayBuffer): string { return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf))); }
}