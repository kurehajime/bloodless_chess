type StartDialogProps = {
  onStart: (difficulty: number) => void;
};

const LEVELS = [
  { level: 1, label: 'Lv.1', depth: 1 },
  { level: 2, label: 'Lv.2', depth: 2 },
  { level: 3, label: 'Lv.3', depth: 4 },
  { level: 4, label: 'Lv.4', depth: 6 },
  { level: 5, label: 'Lv.5', depth: 8 },
];

export default function StartDialog({ onStart }: StartDialogProps) {
  const handleStart = (level: number) => {
    onStart(level);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-sky-300">無血チェス</h2>

        <div className="mb-6 rounded-lg bg-slate-800/50 p-4 text-sm text-slate-300">
          <h3 className="mb-3 font-semibold text-slate-200">ルール</h3>
          <ul className="space-y-2">
            <li>• 敵の駒があるマスに進むと、その駒を捕虜にできる</li>
            <li>• 捕虜は動けず、監視駒がいなくなると解放される</li>
            <li>• 解放直後のターンは移動できない</li>
            <li>• 敵のキングを捕虜にすると勝利</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-center font-semibold text-slate-200">難易度を選択</h3>
          <div className="flex gap-2 justify-center">
            {LEVELS.map((item) => (
              <button
                key={item.level}
                onClick={() => handleStart(item.level)}
                className="rounded-lg bg-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-sky-600 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
