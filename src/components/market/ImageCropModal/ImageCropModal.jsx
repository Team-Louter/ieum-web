import { useEffect, useRef, useState } from 'react';
import './ImageCropModal.css';
import closeIcon from '../../../assets/images/close.svg';

const MAX_FRAME_SIZE = 400;
// 자르는 틀 바깥으로 보이는 사진 여백(어둡게 표시되는 영역)입니다.
const PAD = 40;
const MAX_ZOOM = 4;
const OUTPUT_SIZE = 800;
// 잘라낸 영역이 이보다 작으면 확대해서 흐려질 수 있다고 알려 줍니다.
const LOW_RESOLUTION_SIZE = 400;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** 화면 너비에 맞춰 자르는 틀(정사각형) 크기를 정합니다. */
function getFrameSize() {
  return Math.max(200, Math.min(MAX_FRAME_SIZE, window.innerWidth - 200));
}

/** 사진을 정사각형(게시물 사진 비율)으로 잘라 새 파일로 돌려주는 창입니다. */
function ImageCropModal({ src, fileName = 'image', aspect = 1, onConfirm, onCancel }) {
  // 자르는 틀의 가로·세로입니다. aspect는 가로÷세로 비율이고, 1이면 정사각형입니다.
  const [frame] = useState(() => {
    const base = getFrameSize();
    return aspect >= 1 ? { w: base, h: base / aspect } : { w: base * aspect, h: base };
  });
  const frameW = frame.w;
  const frameH = frame.h;
  const stageW = frameW + PAD * 2;
  const stageH = frameH + PAD * 2;
  const [natural, setNatural] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const imageRef = useRef(null);
  const dragRef = useRef(null);

  // 틀을 꽉 채우는 배율(cover)과 사진 전체가 보이는 배율(contain)입니다.
  const coverScale = natural ? Math.max(frameW / natural.width, frameH / natural.height) : 1;
  const containScale = natural ? Math.min(frameW / natural.width, frameH / natural.height) : 1;
  const minScale = containScale;
  const maxScale = Math.max(coverScale * MAX_ZOOM, containScale);
  const cropSourceSize = natural ? Math.max(frameW, frameH) / scale : 0;
  const isLowResolution = natural && cropSourceSize < LOW_RESOLUTION_SIZE;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isSaving) onCancel?.();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isSaving]);

  /** 사진이 틀 밖으로 빠지지 않게 하고, 틀보다 작아지면 가운데에 둡니다. */
  function clampOffset(nextOffset, nextScale, dims = natural) {
    if (!dims) return nextOffset;
    const axis = (value, length, frameLength) => {
      const scaled = length * nextScale;
      return scaled <= frameLength
        ? PAD + (frameLength - scaled) / 2
        : clamp(value, PAD + frameLength - scaled, PAD);
    };
    return {
      x: axis(nextOffset.x, dims.width, frameW),
      y: axis(nextOffset.y, dims.height, frameH),
    };
  }

  /** 사진을 틀에 꽉 차게 가운데로 맞춥니다. */
  function fitToFrame(dims = natural) {
    if (!dims) return;
    const nextScale = Math.max(frameW / dims.width, frameH / dims.height);
    setScale(nextScale);
    setOffset(
      clampOffset(
        {
          x: PAD + (frameW - dims.width * nextScale) / 2,
          y: PAD + (frameH - dims.height * nextScale) / 2,
        },
        nextScale,
        dims,
      ),
    );
  }

  function handleImageLoad(event) {
    const dims = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
    setNatural(dims);
    fitToFrame(dims);
  }

  function applyScale(nextScale) {
    if (!natural) return;
    const safeScale = clamp(nextScale, minScale, maxScale);
    // 틀 가운데에 보이던 지점을 그대로 유지한 채 확대·축소합니다.
    const centerX = (stageW / 2 - offset.x) / scale;
    const centerY = (stageH / 2 - offset.y) / scale;
    setScale(safeScale);
    setOffset(
      clampOffset(
        { x: stageW / 2 - centerX * safeScale, y: stageH / 2 - centerY * safeScale },
        safeScale,
      ),
    );
  }

  function handlePointerDown(event) {
    if (!natural) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, origin: offset };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset(
      clampOffset(
        { x: drag.origin.x + event.clientX - drag.startX, y: drag.origin.y + event.clientY - drag.startY },
        scale,
      ),
    );
  }

  function handlePointerEnd() {
    dragRef.current = null;
  }

  function handleWheel(event) {
    applyScale(scale * (1 - event.deltaY * 0.002));
  }

  function handleKeyboardMove(event) {
    const step = 10;
    const moves = {
      ArrowLeft: { x: step, y: 0 },
      ArrowRight: { x: -step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setOffset((current) => clampOffset({ x: current.x + move.x, y: current.y + move.y }, scale));
  }

  /** 틀 안에 보이는 모습 그대로 정사각형 JPEG 파일로 만듭니다. 사진 밖 빈 곳은 흰색입니다. */
  function handleConfirm() {
    const image = imageRef.current;
    if (!natural || !image || isSaving) return;

    setIsSaving(true);
    const ratio = OUTPUT_SIZE / Math.max(frameW, frameH);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(frameW * ratio);
    canvas.height = Math.round(frameH * ratio);
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      (offset.x - PAD) * ratio,
      (offset.y - PAD) * ratio,
      natural.width * scale * ratio,
      natural.height * scale * ratio,
    );
    canvas.toBlob(
      (blob) => {
        setIsSaving(false);
        if (!blob) return;
        const baseName = fileName.replace(/\.[^.]+$/, '') || 'image';
        onConfirm?.(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  }

  return (
    <div
      className="image-crop-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onCancel?.();
      }}
    >
      <section
        className="image-crop-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
      >
        <button type="button" className="image-crop-modal__close" onClick={onCancel} disabled={isSaving}>
          <img src={closeIcon} alt="닫기 아이콘" />
        </button>
        <h2 id="image-crop-title">사진 자르기</h2>
        <p className="image-crop-modal__hint">
          밝게 보이는 네모 안이 그대로 올라가요. 사진을 끌어서 옮기고, 휠이나 슬라이더로 크기를 조절하세요.
        </p>
        <div
          className="image-crop-modal__viewport"
          style={{ width: stageW, height: stageH }}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onWheel={handleWheel}
          onDoubleClick={() => fitToFrame()}
          onKeyDown={handleKeyboardMove}
          aria-label="사진 위치 조절 영역. 방향키로 움직일 수 있습니다."
        >
          <img
            ref={imageRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            style={
              natural
                ? {
                    width: natural.width * scale,
                    height: natural.height * scale,
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                  }
                : { visibility: 'hidden' }
            }
          />
          <span
            className="image-crop-modal__dim"
            aria-hidden="true"
            style={{
              clipPath: `polygon(evenodd, 0 0, ${stageW}px 0, ${stageW}px ${stageH}px, 0 ${stageH}px, 0 0, ${PAD}px ${PAD}px, ${PAD}px ${PAD + frameH}px, ${PAD + frameW}px ${PAD + frameH}px, ${PAD + frameW}px ${PAD}px, ${PAD}px ${PAD}px)`,
            }}
          />
          <span
            className="image-crop-modal__frame"
            aria-hidden="true"
            style={{ top: PAD, left: PAD, width: frameW, height: frameH }}
          />
        </div>
        <div className="image-crop-modal__zoom">
          <button
            type="button"
            aria-label="축소"
            onClick={() => applyScale(scale / 1.15)}
            disabled={!natural}
          >
            −
          </button>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step={(maxScale - minScale) / 200 || 0.01}
            value={scale}
            onChange={(event) => applyScale(Number(event.target.value))}
            disabled={!natural}
            aria-label="사진 크기 조절"
          />
          <button
            type="button"
            aria-label="확대"
            onClick={() => applyScale(scale * 1.15)}
            disabled={!natural}
          >
            +
          </button>
        </div>
        <p className="image-crop-modal__warning" role="status">
          {isLowResolution ? '사진이 작아서 게시물에서 흐릿하게 보일 수 있어요.' : ''}
        </p>
        <div className="image-crop-modal__actions">
          <button type="button" onClick={onCancel} disabled={isSaving}>
            취소하기
          </button>
          <button
            type="button"
            className="image-crop-modal__confirm"
            onClick={handleConfirm}
            disabled={!natural || isSaving}
          >
            {isSaving ? '처리 중' : '적용하기'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ImageCropModal;
