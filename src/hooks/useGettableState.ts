import { useCallback, useState } from "react"
import useRefState from "./useRefState"

const useGettableState = <S = undefined>(initialState: S | (() => S)) => {
  const [state, setState] = useState(initialState);

  const ref = useRefState(state);

  const getState = useCallback(() => {
    return ref.current;
  }, []);

  return [state, setState, getState] as const;
};

export default useGettableState;