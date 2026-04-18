/**
 * Parses a string of sets like "S(10), M(20)" into an array of objects [{size: 'S', qty: '10'}, ...]
 */
export function parseSets(str, fallbackQty = '') {
  if (str === null || str === undefined) return [{ size: '', qty: fallbackQty }];
  
  const text = String(str);
  if (!text.trim()) return [{ size: '', qty: fallbackQty }];

  const regex = /([^,()]+)\s*\(([^)]+)\)/g;
  const sets = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    sets.push({ size: match[1].trim(), qty: match[2].trim() });
  }
  if (sets.length > 0) return sets;
  
  // Fallback for when there's no parenthesis format
  return [{ size: text.trim(), qty: fallbackQty }];
}

/**
 * Formats an array of objects [{size: 'S', qty: '10'}, ...] into a string "S(10), M(20)"
 */
export function formatSets(sets) {
  return sets
    .filter(s => s.size.trim() || String(s.qty).trim())
    .map(s => `${s.size.trim() || '?'}(${String(s.qty).trim() || '0'})`)
    .join(', ');
}
