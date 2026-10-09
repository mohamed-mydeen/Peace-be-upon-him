import { NAMES_OF_ALLAH } from '../src/services/namesOfAllah.js';

export async function getNameAudio(number) {
  if (!Number.isInteger(number) || number < 1 || number > NAMES_OF_ALLAH.length) {
    throw new RangeError('Name number must be between 1 and 99.');
  }

  const name = NAMES_OF_ALLAH[number - 1];
  const params = new URLSearchParams({
    ie: 'UTF-8',
    client: 'tw-ob',
    tl: 'ar',
    q: name.arabic,
  });
  const response = await fetch(`https://translate.google.com/translate_tts?${params}`, {
    headers: { Referer: 'https://translate.google.com/' },
  });
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok || !contentType.startsWith('audio/')) {
    throw new Error(`Arabic audio provider returned HTTP ${response.status}.`);
  }

  return {
    audio: new Uint8Array(await response.arrayBuffer()),
    contentType,
  };
}
