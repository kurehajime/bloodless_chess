import type { MouseEvent } from 'react';
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
  onClick?: (event: MouseEvent<SVGGElement>) => void;
  highlight?: boolean;
  glow?: boolean;
  opacity?: number;
};

const PieceComponent = ({
  piece,
  x,
  y,
  fontSize,
  fill,
  rotation = 0,
  onClick,
  highlight = false,
  glow = false,
  opacity = 1,
}: PieceComponentProps) => {
  const symbol = PIECE_SYMBOLS[piece];
  const radius = fontSize * 0.68;
  const strokeWidth = highlight ? fontSize * 0.08 : fontSize * 0.06;
  const accentFill = highlight ? 'rgba(14, 165, 233, 0.28)' : 'rgba(59, 130, 246, 0.18)';
  const accentStroke = highlight ? 'rgba(14, 165, 233, 0.9)' : 'rgba(59, 130, 246, 0.5)';

  const handleClick = (event: MouseEvent<SVGGElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <g
      transform={rotation ? `rotate(${rotation} ${x} ${y})` : undefined}
      onClick={onClick ? handleClick : undefined}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {(highlight || glow) && (
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill={glow && !highlight ? accentFill : 'rgba(14, 165, 233, 0.34)'}
          stroke={glow && !highlight ? accentStroke : 'rgba(14, 165, 233, 0.95)'}
          strokeWidth={strokeWidth}
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Noto Sans Symbols', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twemoji Mozilla', 'Noto Color Emoji', sans-serif"
        fontSize={fontSize}
        fontWeight={600}
        fill={fill}
        fillOpacity={opacity}
        opacity={opacity}
        style={{ userSelect: 'none' }}
      >
        {symbol}
      </text>
    </g>
  );
};

export default PieceComponent;
