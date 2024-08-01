import { expect, test, describe } from 'vitest';
import { exhash } from '~/domain/core/sanitize';

describe('exhash', () => {
    test('should hash a simple string correctly', async () => {
        const result = await exhash('hello');
        expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    test('should hash an empty string correctly', async () => {
        const result = await exhash('');
        expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    test('should hash a string with special characters correctly', async () => {
        const result = await exhash('hello@123');
        expect(result).toBe('71c72e7e33d58c8a0cab0caba274eef284c3c6c41d2780273d57a2a79d01754f');
    });

    test('should hash a long string correctly', async () => {
        const longString = 'a'.repeat(1000);
        const result = await exhash(longString);
        expect(result).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
    });
});
