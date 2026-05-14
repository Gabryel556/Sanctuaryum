import { Pipe, PipeTransform } from '@angular/core';
import { CryptoService } from '../services/crypto.service';

@Pipe({
  name: 'decrypt',
  standalone: true
})
export class DecryptPipe implements PipeTransform {

  constructor(private crypto: CryptoService) {}

  transform(value: string): string {
    if (!value) return '';
    return this.crypto.decrypt(value);
  }

}