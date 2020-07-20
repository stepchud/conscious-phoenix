import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

// https://medium.com/@anilchaudhary453/double-click-using-react-hooks-4fea2292d3a4
export function useDoubleClick(callback = () => {}) {
  const [elem, setElem] = useState(null);
  const countRef = useRef(0);
  const timerRef = useRef(null);
  const inputCallbackRef = useRef(null);
  const callbackRef = useCallback(node => {
    setElem(node);
    callbackRef.current = node;
  }, []);

  useEffect(() => {
    inputCallbackRef.current = callback;
  });

  useEffect(() => {
    function handler() {
      const isDoubleClick = countRef.current + 1 === 2;
      const timerIsPresent = timerRef.current;
      if (timerIsPresent && isDoubleClick) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        countRef.current = 0;
        if (inputCallbackRef.current) {
          inputCallbackRef.current(elem);
        }
      }
      if (!timerIsPresent) {
        countRef.current = countRef.current + 1;
        const timer = setTimeout(() => {
          clearTimeout(timerRef.current);
          timerRef.current = null;
          countRef.current = 0;
        }, 500);
        timerRef.current = timer;
      }
    }
    if (elem) {
      elem.addEventListener("click", handler);
    }

    return () => {
      if (elem) {
        elem.removeEventListener("click", handler);
      }
    };
  }, [elem]);
  return [callbackRef, elem];
}
