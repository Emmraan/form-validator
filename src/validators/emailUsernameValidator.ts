export default function isSuspiciousEmailUsername(username: string): boolean {
  const dotCount = (username.match(/\./g) || []).length;
  const hasTooManyDots = dotCount >= 4;

  const hasClusteredDots = /\.\d\.\d/.test(username);
  const hasTooManySpecials = /[\.\-\_]{3,}/.test(username);

  const looksRandom = /^[a-z0-9]{12,}$/.test(username) && !/[aeiou]{2,}/.test(username);

  const hasSuspiciousStructure =
    /^[a-z]+\d+[a-z]+\d+$/i.test(username) && username.length > 12;

  const badCharacter = ["+"];
  const hasBadCharacter = badCharacter.some(w => username.toLowerCase().includes(w));

  return (
    hasTooManyDots ||
    hasClusteredDots ||
    hasTooManySpecials ||
    hasSuspiciousStructure ||
    looksRandom ||
    hasBadCharacter
  );
}
