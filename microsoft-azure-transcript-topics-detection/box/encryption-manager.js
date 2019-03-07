/**
 * @fileoverview Manager for the encryption and decryption handling
 * All user tokens being sent to ML providers should be encrypted.
 */

// Requirements
const crypto = require('crypto');

const CIPHER_ALGORITHM = 'aes-256-ctr';

class EncryptionManager {
    /**
     * Encrypts plaintext with provided key
     * @param {string} key - encryption key
     * @param {string} plaintext - plaintext to be encrypted
     * @return {string} ciphertext
     */
    static encrypt(key, plaintext) {
        if (typeof key !== 'string' || !key) {
            throw new TypeError('Encryption key should be non-empty string');
        }

        if (typeof plaintext !== 'string' || !plaintext) {
            throw new TypeError('Plaintext should be non-empty string');
        }

        const iv = crypto.randomBytes(16);
        const sha256 = crypto.createHash('sha256');
        sha256.update(key);

        const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, sha256.digest(), iv);
        const ciphertext = cipher.update(Buffer.from(plaintext));

        return Buffer.concat([iv, ciphertext, cipher.final()]).toString('base64');
    }

    /**
     * Decrypts ciphertext with provided key
     * @param {string} key - encryption key
     * @param {string} ciphertext - ciphertext to be decrypted
     * @return {string} plaintext
     */
    static decrypt(key, ciphertext) {
        if (typeof key !== 'string' || !key) {
            throw new TypeError('Encryption key should be non-empty string');
        }

        if (typeof ciphertext !== 'string' || !ciphertext) {
            throw new TypeError('Ciphertext should be non-empty string');
        }

        const sha256 = crypto.createHash('sha256');
        sha256.update(key);

        const input = Buffer.from(ciphertext, 'base64');
        const iv = input.slice(0, 16);
        const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, sha256.digest(), iv);
        const encryptedText = input.slice(16);

        return decipher.update(encryptedText) + decipher.final();
    }
}

module.exports = EncryptionManager;
