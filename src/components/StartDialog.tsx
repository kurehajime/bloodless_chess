import RulesDescription from './RulesDescription';

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
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-600/60 p-4 shadow-2xl backdrop-blur-sm">
        <h2 className="mb-6 text-center text-3xl font-bold text-sky-300">無血チェス</h2>

        <div className="mb-6">
          <RulesDescription />
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-center font-semibold text-slate-200">難易度を選択</h3>
          <div className="flex gap-2 justify-center">
            {LEVELS.map((item) => (
              <button
                key={item.level}
                onClick={() => handleStart(item.level)}
                className="rounded-lg border border-slate-500 bg-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-200 hover:text-slate-900"
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
