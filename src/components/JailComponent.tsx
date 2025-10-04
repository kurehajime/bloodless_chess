import { Piece } from '../game/board';

type JailComponentProps = {
  pieces: Piece[];
  cellSize: number;
};

const JailComponent = ({ pieces, cellSize }: JailComponentProps) => {
  if (pieces.length === 0) {
    return null;
  }

  const fontSize = cellSize * 0.18;
  const y = cellSize - cellSize * 0.18;

  return (
    <text
      x={cellSize / 2}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
      fontSize={fontSize}
      fontWeight={500}
      fill="#38bdf8"
    >
      {`J: ${pieces.length}`}
    </text>
  );
};

export default JailComponent;
