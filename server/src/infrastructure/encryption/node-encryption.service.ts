import crypto from 'crypto'
import { IEncryptionService } from '@/core/ports/encryption-service.interface.ts'

export class NodeEncryptionService implements IEncryptionService {
    private readonly key: Buffer
    private readonly algorithm: string = 'aes-256-gcm'
    private readonly ivLength: number = 12
    private readonly authTagLength: number = 16

    constructor(envSecret: string) {
        this.key = Buffer.from(crypto.hash('sha256', envSecret), 'hex')
    }

    public async encrypt(plainText: string): Promise<string> {
        return this.encryptSync(plainText)
    }

    public async decrypt(encryptedText: string): Promise<string> {
        return this.decryptSync(encryptedText)
    }

    private encryptSync(plainText: string): string {
        const iv = crypto.randomBytes(this.ivLength)
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM

        const encrypted = Buffer.concat([
            cipher.update(plainText, 'utf8'),
            cipher.final()
        ])

        const authTag = cipher.getAuthTag()
        const combined = Buffer.concat([iv, encrypted, authTag])

        return combined.toString('base64')
    }

    private decryptSync(encryptedText: string): string {
        const encryptedBuffer = Buffer.from(encryptedText, 'base64')

        if (encryptedBuffer.length < this.ivLength + this.authTagLength + 1) {
            throw new Error('Invalid encrypted data length')
        }

        const iv = encryptedBuffer.subarray(0, this.ivLength)
        const authTag = encryptedBuffer.subarray(encryptedBuffer.length - this.authTagLength)
        const encrypted = encryptedBuffer.subarray(this.ivLength, encryptedBuffer.length - this.authTagLength)

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM

        decipher.setAuthTag(authTag)

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ])

        return decrypted.toString('utf8')
    }
}
