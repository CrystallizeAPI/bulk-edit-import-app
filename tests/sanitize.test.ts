import { expect, test, describe } from 'vitest';
import { normalizeForGraphQL } from '~/domain/core/sanitize';

describe('normalizeForGraphQL', () => {
    test('should convert hyphens to camelCase', () => {
        expect(normalizeForGraphQL('my-component')).toBe('myComponent');
    });

    test('should handle strings with invalid starting characters', () => {
        expect(normalizeForGraphQL('1invalid')).toBe('_1invalid');
        expect(normalizeForGraphQL('-invalid')).toBe('Invalid');
        expect(normalizeForGraphQL('@invalid')).toBe('__invalid');
        expect(normalizeForGraphQL('!invalid')).toBe('__invalid');
    });

    test('should replace invalid characters with underscores', () => {
        expect(normalizeForGraphQL('my@component')).toBe('my_component');
        expect(normalizeForGraphQL('my#component')).toBe('my_component');
        expect(normalizeForGraphQL('my$component')).toBe('my_component');
    });

    test('should handle strings that are already valid', () => {
        expect(normalizeForGraphQL('myComponent')).toBe('myComponent');
        expect(normalizeForGraphQL('_myComponent')).toBe('_myComponent');
    });

    test('should handle complex strings', () => {
        expect(normalizeForGraphQL('my-component@name')).toBe('myComponent_name');
        expect(normalizeForGraphQL('1my-component#name')).toBe('_1myComponent_name');
    });

    test('should handle strings with multiple invalid characters', () => {
        expect(normalizeForGraphQL('my@component#name')).toBe('my_component_name');
        expect(normalizeForGraphQL('1my@component#name')).toBe('_1my_component_name');
    });

    test('should handle strings starting with numbers followed by special characters', () => {
        expect(normalizeForGraphQL('1@component')).toBe('_1_component');
        expect(normalizeForGraphQL('2#component')).toBe('_2_component');
    });
});
