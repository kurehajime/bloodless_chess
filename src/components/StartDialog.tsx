import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RulesDescription from './RulesDescription';
import bloodlessIcon from '../assets/bloodless.png';
import type { Turn } from '../game/board';

type StartDialogProps = {
  playerColor: Turn;
  onColorChange: (color: Turn) => void;
  onStart: (difficulty: number, color: Turn) => void;
};

const LEVELS = [
  { level: 1, label: 'Lv.1', depth: 1 },
  { level: 2, label: 'Lv.2', depth: 2 },
  { level: 3, label: 'Lv.3', depth: 4 },
  { level: 4, label: 'Lv.4', depth: 6 },
  // { level: 5, label: 'Lv.5', depth: 8 },
];

export default function StartDialog({ playerColor, onColorChange, onStart }: StartDialogProps) {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const handleStart = () => {
    onStart(selectedLevel, playerColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-600/60 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-center gap-1 mb-6">
          <img src={bloodlessIcon} alt="" className="h-16 w-16" />
          <h2 className="text-6xl font-bold text-white" style={{ fontFamily: "'WDXLL Lubrifont JPN', sans-serif" }}>{t('title')}</h2>
        </div>

        <div className="mb-2">
          <RulesDescription />
        </div>

        <div className="mb-2">
          <div className="flex justify-center gap-2">
            <label
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${playerColor === 'WHITE'
                  ? 'bg-slate-200 text-slate-900 border-slate-300'
                  : 'bg-slate-700 text-slate-200 border-slate-500 hover:bg-slate-600'
                }`}
            >
              <input
                type="radio"
                name="player-color"
                value="WHITE"
                checked={playerColor === 'WHITE'}
                onChange={() => onColorChange('WHITE')}
              />
              {t('start.color.white')}
            </label>
            <label
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${playerColor === 'BLACK'
                  ? 'bg-slate-200 text-slate-900 border-slate-300'
                  : 'bg-slate-700 text-slate-200 border-slate-500 hover:bg-slate-600'
                }`}
            >
              <input
                type="radio"
                name="player-color"
                value="BLACK"
                checked={playerColor === 'BLACK'}
                onChange={() => onColorChange('BLACK')}
              />
              {t('start.color.black')}
            </label>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex flex-wrap justify-center gap-2">
            {LEVELS.map((item) => (
              <label
                key={item.level}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${selectedLevel === item.level
                  ? 'bg-slate-200 text-slate-900 border-slate-300'
                  : 'bg-slate-700 text-slate-200 border-slate-500 hover:bg-slate-600'
                  }`}
              >
                <input
                  type="radio"
                  name="start-level"
                  value={item.level}
                  checked={selectedLevel === item.level}
                  onChange={() => setSelectedLevel(item.level)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="mt-2 w-full rounded-xl bg-sky-500 py-3 text-lg font-semibold text-white transition-colors hover:bg-sky-400"
        >
          {t('start.play')}
        </button>
      </div>
    </div>
  );
}
