type DifficultySelectorProps = {
  level: number;
  onLevelChange: (level: number) => void;
  disabled?: boolean;
};

const LEVELS = [
  { level: 1, label: 'レベル1', depth: 1 },
  { level: 2, label: 'レベル2', depth: 2 },
  { level: 3, label: 'レベル3', depth: 4 },
  { level: 4, label: 'レベル4', depth: 6 },
  { level: 5, label: 'レベル5', depth: 8 },
];

export const getDifficultyDepth = (level: number): number => {
  return LEVELS.find((l) => l.level === level)?.depth ?? 2;
};

export default function DifficultySelector({
  level,
  onLevelChange,
  disabled = false,
}: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300">難易度:</span>
      <div className="flex gap-1">
        {LEVELS.map((item) => (
          <button
            key={item.level}
            onClick={() => onLevelChange(item.level)}
            disabled={disabled}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              level === item.level
                ? 'bg-sky-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
