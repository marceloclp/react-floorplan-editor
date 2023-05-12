import { FC, useId, useMemo } from "react"
import cx from "../../utils/cx"
import Vertex from "../Vertex/Vertex"
import Grid from "../Grid/Grid"
import Wall from "../Wall/Wall"
import useVirtualScreen from "../../hooks/useVirtualScreen"
import GridDefinition from "../Grid/GridDefinition"
import useEditorState from "./useEditorState"
import { useSelector } from "react-redux"
import RootState from "../../store/types/RootState"
import transform from "../../utils/transform"
import ToolbarEditorMode from "../Toolbars/ToolbarEditorMode"
import ToolbarHistory from "../Toolbars/ToolbarHistory"
import Angle from "../Angle/Angle"
import { selectAngles } from "../../store/selectors/angles"

const Editor: FC = () => {
  const gridId = useId();

  const vxs = useSelector((state: RootState) => Object.values(state.vertices));
  const wls = useSelector((state: RootState) => Object.values(state.walls).map(({ v1, v2, ...wall }) => ({
    x1: state.vertices[v1].x,
    y1: state.vertices[v1].y,
    x2: state.vertices[v2].x,
    y2: state.vertices[v2].y,
    ...wall,
  })));

  const angles = useSelector(selectAngles);

  const {
    panX,
    panY,
    isDragPanning,
    // isTwoFingersPanning,
  } = useSelector((state: RootState) => state.panning);

  const vs = useVirtualScreen<SVGGeometryElement>();

  useEditorState(vs);

  return (
    <div className="h-screen w-screen">
      <svg className={cx(
        'w-full h-full',
        // mode?.startsWith('dragging') && 'cursor-grabbing',
        isDragPanning && 'cursor-move',
        // mode?.startsWith('placing') && 'cursor-pointer'
      )}>
        <defs>
          <GridDefinition id={gridId} gridX={20} gridY={20} />
        </defs>
        <g className="translate-x-1/2 translate-y-1/2">
          <g transform={transform({ x: panX, y: panY })}>
            <g {...vs.handlers} tabIndex={0}>
              <Grid gridId={gridId} />
              {angles.map((angle, i) => (
                <Angle {...angle} key={i} />
              ))}
              {wls.map((wall) => (
                <Wall {...wall} key={wall.id} />
              ))}
              {vxs.map((vertex) => (
                <Vertex key={vertex.id} {...vertex} />
              ))}
            </g>
          </g>
        </g>
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <ToolbarHistory />
        <ToolbarEditorMode />
      </div>
    </div>
  );
};

export default Editor;