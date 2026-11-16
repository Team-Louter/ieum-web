const OUTPUT_SIZE = 800;
// 가로세로 비율이 이 범위 안이고 충분히 크면 자르기 창 없이 가운데를 자동으로 자릅니다.
const AUTO_MIN_RATIO = 0.9;
const AUTO_MAX_RATIO = 1.1;
const AUTO_MIN_SIDE = 400;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    image.src = url;
  });
}

/** 크기와 비율이 이미 알맞은 사진이면 가운데를 정사각형으로 잘라 새 파일로, 아니면 null을 돌려줍니다. */
export async function autoCropIfFits(file) {
  let loaded;
  try {
    loaded = await loadImage(file);
  } catch {
    return null;
  }
  const { image, url } = loaded;
  try {
    const { naturalWidth: width, naturalHeight: height } = image;
    const ratio = width / height;
    if (ratio < AUTO_MIN_RATIO || ratio > AUTO_MAX_RATIO || Math.min(width, height) < AUTO_MIN_SIDE) {
      return null;
    }
    const side = Math.min(width, height);
    const outputSize = Math.min(side, OUTPUT_SIZE);
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    canvas.getContext('2d').drawImage(
      image,
      (width - side) / 2,
      (height - side) / 2,
      side,
      side,
      0,
      0,
      outputSize,
      outputSize,
    );
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return null;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}
