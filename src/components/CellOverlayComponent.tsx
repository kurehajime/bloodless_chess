import { memo } from 'react';

type CellOverlayProps = {
  cellSize: number;
  variant: 'selected' | 'move';
};

const COLORS = {
  selected: {
    fill: 'rgba(14, 165, 233, 0.18)',
    stroke: 'rgba(56, 189, 248, 0.9)',
    strokeWidth: 4,
  },
  move: {
    fill: 'rgba(34, 197, 94, 0.2)',
    stroke: 'rgba(34, 197, 94, 0.55)',
    strokeWidth: 3,
  },
} as const;

const CellOverlayComponent = memo(({ cellSize, variant }: CellOverlayProps) => {
  const { fill, stroke, strokeWidth } = COLORS[variant];
  return (
    <rect
      x={strokeWidth / 2}
      y={strokeWidth / 2}
      width={cellSize - strokeWidth}
      height={cellSize - strokeWidth}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
});

export default CellOverlayComponent;
