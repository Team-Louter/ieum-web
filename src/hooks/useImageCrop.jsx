import { useCallback, useEffect, useRef, useState } from 'react';
import ImageCropModal from '../components/market/ImageCropModal/ImageCropModal';
import { autoCropIfFits } from '../components/market/ImageCropModal/autoCrop';

/**
 * 사진을 올릴 때 자르기를 거치게 해 주는 훅입니다.
 * cropImage(file)은 잘라낸 새 파일을, 자르기를 취소하면 null을 돌려줍니다.
 * cropModal은 화면 어디엔가 한 번 그려 두면 됩니다. aspect는 가로÷세로 비율입니다.
 */
export default function useImageCrop({ aspect = 1 } = {}) {
  const [target, setTarget] = useState(null);
  const targetRef = useRef(null);

  const closeTarget = useCallback((result) => {
    const current = targetRef.current;
    if (!current) return;
    URL.revokeObjectURL(current.url);
    targetRef.current = null;
    setTarget(null);
    current.resolve(result);
  }, []);

  // 화면을 떠날 때 열려 있던 자르기 창이 있으면 취소로 처리합니다.
  useEffect(() => () => closeTarget(null), [closeTarget]);

  const cropImage = useCallback(
    async (file) => {
      // 비율과 크기가 이미 알맞은 사진은 자르기 창 없이 가운데를 자동으로 자릅니다.
      const autoCropped = await autoCropIfFits(file, aspect);
      if (autoCropped) return autoCropped;

      return new Promise((resolve) => {
        const next = { file, url: URL.createObjectURL(file), resolve };
        targetRef.current = next;
        setTarget(next);
      });
    },
    [aspect],
  );

  const cropModal = target ? (
    <ImageCropModal
      src={target.url}
      fileName={target.file.name}
      aspect={aspect}
      onConfirm={closeTarget}
      onCancel={() => closeTarget(null)}
    />
  ) : null;

  return { cropImage, cropModal };
}
