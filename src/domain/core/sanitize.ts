export const camelCaseHyphens = (string: string): string => string.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/** It is understood here that IF in Crystallize there are 2 component identifers:
 * 1. "my-component"
 * 2. "my_component"
 *
 * there will be a name overlap that we WON'T handle here, that shouls be forbidden in Crystallize.
 * We cannot normalize here because we won't know how to denormalize.
 */
const normalizeForGraphQLName = (name: string): string => {
    const startsWithValidChars = /^[_a-zA-Z]/;
    if (!startsWithValidChars.test(name)) {
        return normalizeForGraphQLName(`_${name}`);
    }
    const validChars = /^[_a-zA-Z0-9]+$/;
    if (!validChars.test(name)) {
        const chars = name.split('');
        const replacedChars = chars.map((char) => {
            if (validChars.test(char)) {
                return char;
            } else {
                return '_';
            }
        });
        return replacedChars.join('');
    }
    return name;
};

export const normalizeForGraphQL = (string: string): string => normalizeForGraphQLName(camelCaseHyphens(string));
