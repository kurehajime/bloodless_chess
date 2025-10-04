import { Piece } from '../game/board';

const PIECE_SYMBOLS: Record<Piece, string> = {
  BK: '♚',
  BR: '♜',
  BB: '♝',
  BN: '♞',
  WK: '♔',
  WR: '♖',
  WB: '♗',
  WN: '♘',
};

type PieceComponentProps = {
  piece: Piece;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  rotation?: number;
};

const PieceComponent = ({ piece, x, y, fontSize, fill, rotation = 0 }: PieceComponentProps) => {
  const symbol = PIECE_SYMBOLS[piece];
  return (
    <g transform={rotation ? `rotate(${rotation} ${x} ${y})` : undefined}>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Noto Sans Symbols', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twemoji Mozilla', 'Noto Color Emoji', sans-serif"
        fontSize={fontSize}
        fontWeight={600}
        fill={fill}
      >
        {symbol}
      </text>
    </g>
  );
};

export default PieceComponent;
