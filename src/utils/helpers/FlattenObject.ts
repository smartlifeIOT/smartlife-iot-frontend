// Helper to flatten nested objects into a flat list of key-value pairs
export const flattenObject = (obj: any, prefix = ''): [string, any][] => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];

  return Object.entries(obj).reduce((acc: [string, any][], [key, val]) => {
    // We lowercase the prefix parts for consistency if desired, or keep as is.
    // Let's keep as is but join with dots.
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      // Further recursion for objects
      acc.push(...flattenObject(val, newKey));
    } else {
      // Leaf node or array
      acc.push([newKey, val]);
    }
    return acc;
  }, []);
};
