type VertexEntity = {
  id: string;
  x: number;
  y: number;

  isSelected?: boolean;
  isPlacing?: boolean;
  isMoving?: boolean;
  isSplitting?: boolean;
  isDragging?: boolean;
}

export default VertexEntity;
