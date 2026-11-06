import { describe, expect, it } from 'vitest';
import { dictionaries, flattenKeys, translate } from './index';

describe('dictionaries', () => {
  it('keeps pt-BR and en-US on the same keys', () => {
    expect(flattenKeys(dictionaries['en-US']).sort()).toEqual(
      flattenKeys(dictionaries['pt-BR']).sort(),
    );
  });

  it('interpolates the greeting', () => {
    expect(translate('pt-BR', 'library.greeting', { name: 'Ana' })).toBe('Olá, Ana');
    expect(translate('en-US', 'library.greeting', { name: 'Ana' })).toBe('Hello, Ana');
  });
});
