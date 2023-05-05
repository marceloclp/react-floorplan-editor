import { useRef } from "react"

const useRefState = <T>(state: T) => {
  const refState = useRef(state);
  refState.current = state;
  return refState;
}

export default useRefState;
