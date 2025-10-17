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
  { level: 0, label: 'レベル1', depth: 1 },
  { level: 1, label: 'レベル2', depth: 1 },
  { level: 2, label: 'レベル3', depth: 2 },
  { level: 3, label: 'レベル4', depth: 4 },
];

export default function StartDialog({ playerColor, onColorChange, onStart }: StartDialogProps) {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<number>(LEVELS[0].level);
  const handleStart = () => {
    onStart(selectedLevel, playerColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-700/60 p-4 shadow-2xl">
        <div className="flex items-center justify-center gap-1 mb-3">
          <img src={bloodlessIcon} alt="" className="h-14 w-14" />
          <h2 className="text-5xl font-bold text-white" style={{ fontFamily: "'WDXLL Lubrifont JPN', sans-serif" }}>{t('title')}</h2>
        </div>

        <div className="mb-2">
          <RulesDescription />
        </div>

        <div className="mb-2">
          <div className="flex justify-center gap-2">
            <label
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${playerColor === 'WHITE'
                ? 'bg-slate-200/60 text-slate-900 border-slate-300'
                : 'bg-slate-700/60 text-slate-200 border-slate-500 hover:bg-slate-600/60'
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
                ? 'bg-slate-200/60 text-slate-900 border-slate-300'
                : 'bg-slate-700/60 text-slate-200 border-slate-500 hover:bg-slate-600/60'
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
                className={`flex items-center gap-2 rounded-lg border p-2 text-sm font-medium transition-colors ${selectedLevel === item.level
                  ? 'bg-slate-200/60 text-slate-900 border-slate-300'
                  : 'bg-slate-700/60 text-slate-200 border-slate-500 hover:bg-slate-600/60'
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
