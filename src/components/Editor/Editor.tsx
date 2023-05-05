import { Dispatch, FC, SetStateAction, useEffect, useId, useState } from "react"
import usePanning from "../../hooks/usePanning"
import cx from "../../utils/cx"
import transform from "../../utils/transform"
import Vertex from "../Vertex/Vertex"
import Grid from "../Grid/Grid"
import Wall from "../Wall/Wall"
// import SplitWallVertex from "../SplitWallVertex/SplitWallVertex"
import Point from "../../types/Point"
// import ZoomControl from "../ZoomControl/ZoomControl"
// import useZooming from "../../hooks/useZooming"
// import HistoryControl from "../HistoryControl/HistoryControl"
// import useGettableState from "../../hooks/useGettableState"
// import EntityMenu from "../EntityMenu/EntityMenu"
// import useWallSplit from "../Wall/useWallSplit"
// import useWallDrag from "../Wall/useWallDrag"
// import useVertexDrag from "../Vertex/useVertexDrag"
// import useVertexSelect from "../Vertex/useVertexSelect"
// import Angle from "../Angle/Angle"
import useVirtualScreen from "../../hooks/useVirtualScreen"
import type { SnapAxis } from "../../hooks/useVirtualScreen"
import GridDefinition from "../Grid/GridDefinition"
// import { sufixObj } from "../../utils/objects"
import useEditionHistory, { EditionHistory } from "../../hooks/useEditionHistory"
// import Toolbar, { Tool } from "../Toolbar/Toolbar"
import useEditorState from "./useEditorState"
import useRefState from "../../hooks/useRefState"
// import { wallSplitStart, wallSplitUpdateOnGrid, wallSplitUpdateOnWall } from "./features/WallSplitting"
import { vertexDragDrop, vertexDragStart, vertexDragUpdate } from "./features/VertexDragging"
import { wallDragDrop, wallDragStart, wallDragUpdate } from "./features/WallDragging"

type Props = {
  vertices: Point[];
};

export type SetVerticesAction = Dispatch<SetStateAction<Point[]>>;
export type GetVerticesAction = () => Point[];
export type SetSnapAxisAction = Dispatch<SetStateAction<SnapAxis>>;
export type EditorHistory = EditionHistory<Point[]>;

const Editor: FC<Props> = ({ vertices: v }) => {
  const gridId = useId();

  const vs = useVirtualScreen<SVGGeometryElement>();

  const {
    vertices,
    walls,
    mode,
    snapAxis,
    prevTarget,
    dispatch,
  } = useEditorState(v, vs);

  // const refs = useRefState({
  //   mode,
  // });

  // useEffect(() => {
  //   return vs.on({
  //     onMouseDown: () => {
  //       console.log(refs.current.mode);
  //       if (!refs.current.mode && vs.kb.isDown(['MetaLeft']) && vs.clickLeft) {
  //         // DRAG MODE: holding meta key + holding mouse left click down

  //         // Check if the cursor is hovering over a draggable element:
  //         const g = vs.closest('[data-entity-type]');

  //         // If there is no valid g element, skip:
  //         if (!g) return;

  //         const entityType = g?.getAttribute('data-entity-type')!;
  //         const entityIndex = parseInt(g.getAttribute('data-entity-index')!);

  //         switch (entityType) {
  //           case 'vertex':
  //             return dispatch(vertexDragStart(entityIndex));
  //           case 'wall':
  //             return dispatch(wallDragStart(entityIndex));
  //         }
  //       }
  //     },
  //     onMouseUp: () => {
  //       switch (refs.current.mode) {
  //         case 'dragging:vertex':
  //           return dispatch(vertexDragDrop());
  //         case 'dragging:wall':
  //           return dispatch(wallDragDrop());
  //       }
  //     },
  //     onMouseDrag: () => {
  //       const by: Point = vs.snapToGrid({ x: vs.deltaX, y: vs.deltaY });

  //       switch (refs.current.mode) {
  //         case 'dragging:vertex':
  //           return dispatch(vertexDragUpdate(by));
  //         case 'dragging:wall':
  //           return dispatch(wallDragUpdate(by));
  //       }
  //     },
  //   })
  // }, [vs]);

  console.log('walls', walls)

  const mappedWalls = walls.map(({ v1, v2, isPlacing, isSplitting }, i) => ({
    x1: vertices[v1].x,
    y1: vertices[v1].y,
    x2: vertices[v2].x,
    y2: vertices[v2].y,
    i,
    isPlacing,
    isSplitting,
  }))

  return (
    <svg className={cx(
      'w-full h-full',
      mode?.startsWith('dragging') && 'cursor-grabbing',
      // mode?.startsWith('placing') && 'cursor-pointer'
    )}>
      <defs>
        <GridDefinition id={gridId} gridX={20} gridY={20} />
      </defs>
      <g className="translate-x-1/2 translate-y-1/2">
        <g {...vs.handlers} tabIndex={0}>
          <Grid gridId={gridId} />
          {mappedWalls.map((wall) => (
            <Wall {...wall} key={wall.i} />
          ))}
          {vertices.map(({ x, y, isPlacing, isSplitting, isSelected }, i) => (
            <Vertex key={i} x={x} y={y} index={i} isPlacing={isPlacing} isSplitting={isSplitting} isSelected={!!isSelected} />
          ))}
        </g>
      </g>
    </svg>
  );
}

// const Editor: FC<Props> = ({ vertices: v }) => {
//   const gridId = useId();

//   const [vertices, setVertices, getVertices] = useGettableState(v);

//   const vscreen = useVirtualScreen<SVGGeometryElement>();
//   const history = useEditionHistory<Point[]>(vertices);

//   const {
//     zoom,
//     handleZoom,
//   } = useZooming({ step: 0.1 });

//   const [snapAxis, setSnapAxis] = useState<SnapAxis>(undefined);
  
//   const {
//     isWallSplitting,
//     wallIndex: splittingWallIndex,
//     splitVertex,
//     prevSplitVertex,
//     nextSplitVertex,
//   } = useWallSplit(setVertices, getVertices, setSnapAxis, vscreen, history);

//   const {
//     draggingWallIndex,
//     selectedWallIndex,
//   } = useWallDrag(setVertices, getVertices, setSnapAxis, vscreen, history);

//   const {
//     vertexIndex: draggingVertexIndex,
//   } = useVertexDrag(setVertices, getVertices, setSnapAxis, vscreen, history);

//   const {
//     vertexIndex: selectedVertexIndex,
//     onVertexDelete,
//   } = useVertexSelect(setVertices, getVertices, vscreen, history);

//   const isDraggingEntity =
//     draggingWallIndex !== undefined ||
//     draggingVertexIndex !== undefined;

//   const {
//     panX,
//     panY,
//     isDragPanning,
//     isTwoFingersPanning,
//   } = usePanning(vscreen, { maxPanX: 500, maxPanY: 500 });

//   const walls = vertices.map(({ x: x1, y: y1 }, i, arr) => {
//     const { x: x2, y: y2 } = arr[(i + 1) % arr.length];
//     return { x1, y1, x2, y2 };
//   });

//   const angles = vertices.map(({ x: x0, y: y0 }, i, arr) => {
//     const { x: x1, y: y1 } = arr[(i + 1) % arr.length];
//     const { x: x2, y: y2 } = arr[(i + 2) % arr.length];
//     return { x0, y0, x1, y1, x2, y2 };
//   });

//   useEffect(() => {
//     return vscreen.on({
//       onKeyDown: (event) => {
//         if (vscreen.kb.isShortcut(['MetaLeft', 'KeyZ'], 'keys')) {
//           event.preventDefault();
//           event.stopPropagation();
//           setVertices(history.undo());
//         }
//       },
//     })
//   }, [vscreen, history]);

//   const activeTool: Tool | undefined = (() => {
//     if (isDragPanning || isTwoFingersPanning)
//       return 'pan';
//     if (draggingVertexIndex !== undefined)
//       return 'vertex_drag';
//     if (draggingWallIndex !== undefined)
//       return 'wall_draw';
//     if (isWallSplitting)
//       return 'vertex_place';
//     return undefined;
//   })();

//   return (
//     <div className="w-screen h-screen">
//       <svg
//         className={cx(
//           'w-full h-full',
//           'bg-white',
//           isDragPanning && 'cursor-grabbing',
//           // isTwoFingersPanning && 'cursor-not-allowed',
//           // Dragging without snap axis:
//           isDraggingEntity && 'cursor-move',
//           // Dragging with snap axis:
//           isDraggingEntity && snapAxis === 'x' && 'cursor-ew-resize',
//           isDraggingEntity && snapAxis === 'y' && 'cursor-ns-resize',
//         )}
//       >
//         <defs>
//           <GridDefinition gridX={vscreen.gridX} gridY={vscreen.gridY} id={gridId} />
//         </defs>
//         <g className={cx(
//           'translate-x-1/2 translate-y-1/2',
//         )}>
//           <g
//             {...vscreen.handlers}
//             tabIndex={0}
//             transform={transform({ x: panX, y: panY, scale: zoom })}
//           >
//             <Grid gridId={gridId} />
//             {angles.map((angle, i) => (
//               <Angle {...angle} r={20} key={i} />
//             ))}
//             {walls.map((wall, i) => (
//               <Wall {...wall} i={i} isSelected={i === selectedWallIndex} isDragging={i === draggingWallIndex} isSplitting={i === splittingWallIndex} />
//             ))}
//             {isWallSplitting && splitVertex && prevSplitVertex && nextSplitVertex && (
//               <SplitWallVertex
//                 {...sufixObj('0', splitVertex)}
//                 {...sufixObj('1', prevSplitVertex)}
//                 {...sufixObj('2', nextSplitVertex)}
//               />
//             )}
//             {vertices.map(({ x, y }, i) => (
//               <Vertex
//                 key={i}
//                 x={x}
//                 y={y}
//                 index={i}
//                 isDragging={i === draggingVertexIndex}
//                 isSelected={i === selectedVertexIndex}
//               />
//             ))}
//           </g>
//         </g>
//       </svg>

//       <div className={cx(
//         'absolute',
//         'bottom-4 left-6',
//         'flex items-center gap-4',
//       )}>
//         <ZoomControl zoom={zoom} handleZoom={handleZoom} />
//         <HistoryControl history={history} setVertices={setVertices} />
//       </div>
//       <div className={cx(
//         'absolute',
//         'bottom-4 right-1/2 translate-x-1/2',
//         'flex items-center gap-4'
//       )}>
//         <Toolbar activeTool={activeTool} />
//       </div>
//       <div className={cx(
//         'absolute',
//         'bottom-4 right-6',
//         'flex items-center gap-4',
//       )}>
//         {selectedVertexIndex !== undefined && (
//           <EntityMenu onDeleteClick={onVertexDelete} />
//         )}
//       </div>
//     </div>
//   )
// }

export default Editor;