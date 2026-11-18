import { useCallback, useRef, useState } from 'react';

/**
 * 만들기·수정·삭제처럼 서버에 요청하는 동작을 한 번에 하나만 실행합니다.
 * 처리 중에 다시 누르거나 Enter를 눌러도 무시하고, 끝나면 다시 쓸 수 있습니다.
 * 돌려주는 값: [감싼 함수, 처리 중인지 여부]
 */
export default function useSubmitOnce(handler) {
  const lockRef = useRef(false);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(async (...args) => {
    if (lockRef.current) return undefined;
    lockRef.current = true;
    setIsBusy(true);
    try {
      return await handlerRef.current(...args);
    } finally {
      lockRef.current = false;
      setIsBusy(false);
    }
  }, []);

  return [run, isBusy];
}
