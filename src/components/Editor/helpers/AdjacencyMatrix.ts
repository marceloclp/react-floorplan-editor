import Point from "../../../types/Point"
import { EditorState } from "../useEditorState"

const createPointKey = ({ x, y }: Point) =>
  `${x}_${y}`;
const createWallPointKey = (A: Point, B: Point) =>
  [createPointKey(A), createPointKey(B)].sort().join('__');

export default class AdjacencyMatrix {
  /** [vertexIndex]: wallIndex[] */
  private readonly _vertexToWalls: number[][];
  /** [pointKey]: vertexIndex[] */
  private readonly _pointToVertices: Record<string, number[]> = {};
  /** [wallPointKey]: wallIndex[] */
  private readonly _pointsToWalls: Record<string, number[]> = {};

  wallsAtVertexIndex(index: number) {
    return this._vertexToWalls[index];
  }

  // wallsAtPoint(index: number) {}
  
  wallsAtBothPoints(pointA: Point, pointB: Point) {
    return this._pointsToWalls[createWallPointKey(pointA, pointB)] || [];
  }

  verticesAtPoint(point: Point) {
    return this._pointToVertices[createPointKey(point)] || [];
  }

  constructor({ vertices, walls }: EditorState) {
    this._vertexToWalls = Array(vertices.length).fill(0).map(() => []);

    walls.forEach(({ v1, v2 }, wallIndex) => {
      this._vertexToWalls[v1].push(wallIndex);
      this._vertexToWalls[v2].push(wallIndex);

      const key = createWallPointKey(vertices[v1], vertices[v2]);
      if (!this._pointsToWalls[key])
        this._pointsToWalls[key] = [];
      this._pointsToWalls[key].push(wallIndex);
    });

    vertices.forEach((vertex, vertexIndex) => {
      const key = createPointKey(vertex);
      if (!this._pointToVertices[key])
        this._pointToVertices[key] = [];
      this._pointToVertices[key].push(vertexIndex);
    });
  }
}