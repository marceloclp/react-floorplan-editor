import { EDITOR_MODES } from '../constants';

type EditorMode = (typeof EDITOR_MODES)[keyof typeof EDITOR_MODES];

export default EditorMode;
