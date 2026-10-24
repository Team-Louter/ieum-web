const DEMO_STORE_KEY = 'ieum.demoStore.v1';

function getStore() {
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function getScopedKey(key, scope = 'guest') {
  return `${scope}:${key}`;
}

export function readDemoValue(key, fallback, scope) {
  const store = getStore();
  const scopedKey = getScopedKey(key, scope);
  return Object.prototype.hasOwnProperty.call(store, scopedKey) ? store[scopedKey] : fallback;
}

export function writeDemoValue(key, value, scope) {
  const store = getStore();
  store[getScopedKey(key, scope)] = value;
  window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  return value;
}

export function updateDemoValue(key, updater, fallback, scope) {
  const current = readDemoValue(key, fallback, scope);
  return writeDemoValue(key, updater(current), scope);
}

export function clearDemoScope(scope = 'guest') {
  const store = getStore();
  const prefix = `${scope}:`;
  Object.keys(store).forEach((key) => {
    if (key.startsWith(prefix)) delete store[key];
  });
  window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
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
