import { useSelector } from "react-redux"
import RootState from "../types/RootState"

const useEditorMode = () => {
  return useSelector((state: RootState) => state.mode);
};

export default useEditorMode;
