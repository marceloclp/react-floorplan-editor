type WallEntity = {
  id: string;

  v1: string;
  v2: string;

  isPlacing?: boolean;
  isDragging?: boolean;
  isSplitting?: boolean;
  isSplitTarget?: boolean;
  isSelected?: boolean;
}

export default WallEntity;
