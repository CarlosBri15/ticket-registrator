import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import sharp from 'sharp';
import { bmvbhash } from 'blockhash-core';

@Injectable()
export class CryptoService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly configService: ConfigService) { }

  private get pepper(): string {
    const value = this.configService.get<string>('PASSWORD_PEPPER');
    if (!value)
      throw new Error('PASSWORD_PEPPER is not defined in the environment');
    return value;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password + this.pepper, this.SALT_ROUNDS);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain + this.pepper, hash);
  }

  generateSha256Hash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async generatePerceptualHash(buffer: Buffer): Promise<string> {
    const sharpImage = sharp(buffer);
    const metadata = await sharpImage.metadata();
    const aspectRatio =
      metadata.width && metadata.height ? metadata.width / metadata.height : 1;

    const { data, info } = await sharpImage
      .resize(24, 24, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hash = bmvbhash({ data, width: info.width, height: info.height }, 24);
    return `${hash}|${aspectRatio.toFixed(3)}`;
  }

  calculateHammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return Infinity;

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      const hex1 = Number.parseInt(hash1[i], 16);
      const hex2 = Number.parseInt(hash2[i], 16);
      let xor = hex1 ^ hex2;
      while (xor > 0) {
        if (xor & 1) distance++;
        xor >>= 1;
      }
    }
    return distance;
  }
}
