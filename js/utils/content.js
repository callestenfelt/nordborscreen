// Content loader utility
// Loads pre-fetched JSON data

const DATA_PATH = './data';

let themeData = null;
const objectCache = new Map();

export async function loadTheme() {
  if (themeData) return themeData;

  const response = await fetch(`${DATA_PATH}/theme.json`);
  if (!response.ok) {
    throw new Error('Failed to load theme data');
  }
  themeData = await response.json();
  return themeData;
}

export async function loadObject(objectId) {
  if (objectCache.has(objectId)) {
    return objectCache.get(objectId);
  }

  const response = await fetch(`${DATA_PATH}/objects/${objectId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load object: ${objectId}`);
  }
  const data = await response.json();
  objectCache.set(objectId, data);
  return data;
}

export function getThemeData() {
  return themeData;
}
