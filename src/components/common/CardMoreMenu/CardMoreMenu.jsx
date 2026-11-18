import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './CardMoreMenu.css';

/**
 * 카드 모서리의 … 버튼을 누르면 작업 목록이 뜨는 더보기 메뉴입니다.
 * items: [{ label, onClick, danger, disabled }]
 * inline: 사진 위가 아니라 흰 배경 안에 놓을 때 사용합니다(회색 버튼, 위치 고정 없음).
 */
function CardMoreMenu({ items = [], label = '더보기', inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const busyRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);
  const listRef = useRef(null);
  const [opensUp, setOpensUp] = useState(false);

  // 아래 공간이 모자라면(스크롤 영역·화면 아래를 넘으면) 위로 펼쳐서 스크롤이 생기지 않게 합니다.
  useLayoutEffect(() => {
    if (!isOpen) {
      setOpensUp(false);
      return;
    }
    const list = listRef.current;
    const container = containerRef.current;
    if (!list || !container) return;

    const listRect = list.getBoundingClientRect();
    const triggerRect = container.getBoundingClientRect();
    let limit = window.innerHeight;
    for (let el = container.parentElement; el && el !== document.body; el = el.parentElement) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        limit = Math.min(limit, el.getBoundingClientRect().bottom);
        break;
      }
    }
    const overflowsBelow = listRect.bottom > limit;
    const fitsAbove = triggerRect.top - 6 - listRect.height >= 0;
    setOpensUp(overflowsBelow && fitsAbove);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (items.length === 0) return null;

  return (
    <div
      className={`card-more-menu${inline ? ' card-more-menu--inline' : ''}${isOpen ? ' card-more-menu--open' : ''}`}
      ref={containerRef}
    >
      <button
        type="button"
        className="card-more-menu__trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {isOpen && (
        <ul
          className={`card-more-menu__list${opensUp ? ' card-more-menu__list--up' : ''}`}
          role="menu"
          ref={listRef}
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled || isBusy}
                className={item.danger ? 'card-more-menu__item--danger' : undefined}
                onClick={async (event) => {
                  event.stopPropagation();
                  if (busyRef.current) return;
                  setIsOpen(false);
                  // 서버 요청(Promise)을 하는 항목은 끝날 때까지 다시 실행되지 않게 막습니다.
                  const result = item.onClick?.(event);
                  if (result && typeof result.then === 'function') {
                    busyRef.current = true;
                    setIsBusy(true);
                    try {
                      await result;
                    } catch {
                      // 오류 안내는 호출한 쪽에서 합니다.
                    } finally {
                      busyRef.current = false;
                      setIsBusy(false);
                    }
                  }
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CardMoreMenu;
