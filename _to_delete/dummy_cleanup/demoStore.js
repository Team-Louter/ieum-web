const memoryValues = new Map();

function getScopedKey(key, scope = 'guest') {
  return `${scope}:${key}`;
}

export function readDemoValue(key, fallback, scope) {
  const scopedKey = getScopedKey(key, scope);
  return memoryValues.has(scopedKey) ? memoryValues.get(scopedKey) : fallback;
}

export function writeDemoValue(key, value, scope) {
  const scopedKey = getScopedKey(key, scope);
  memoryValues.set(scopedKey, value);
  return value;
}

export function updateDemoValue(key, updater, fallback, scope) {
  const current = readDemoValue(key, fallback, scope);
  return writeDemoValue(key, updater(current), scope);
}

export function clearDemoScope(scope = 'guest') {
  const prefix = `${scope}:`;
  for (const key of memoryValues.keys()) {
    if (key.startsWith(prefix)) memoryValues.delete(key);
  }
}

export function isDemoFallbackError(error) {
  return [404, 405, 501].includes(error?.status);
}

export function fileToDataUrl(file) {
  if (!file) return Promise.resolve('');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다. 다시 선택해 주세요.'));
    reader.readAsDataURL(file);
  });
}
