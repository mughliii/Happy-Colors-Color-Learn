import { CelebrationData, LanguageMode } from '../types';

interface CelebrationModalProps {
  data: CelebrationData | null;
  lang: LanguageMode;
  onClose: () => void;
}

export function CelebrationModal({ data, lang, onClose }: CelebrationModalProps) {
  if (!data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-5 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="clay-panel animate-pop w-full max-w-sm p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-6xl" aria-hidden="true">
          {data.icon || '🏆'}
        </div>

        <h2
          id="celebration-title"
          className="font-display text-3xl font-bold text-slate-900"
        >
          {lang === 'ur' ? (
            <span className="urdu-text text-teal-800">{data.titleUr}</span>
          ) : (
            data.titleEn
          )}
        </h2>

        {lang === 'both' && (
          <p className="urdu-text mt-1 text-xl font-bold text-teal-700">{data.titleUr}</p>
        )}

        <p className="mt-3 text-base font-bold text-slate-600">
          {lang === 'ur' ? (
            <span className="urdu-text">{data.messageUr}</span>
          ) : (
            data.messageEn
          )}
        </p>

        {lang === 'both' && (
          <p className="urdu-text mt-1 text-base font-semibold text-slate-600">
            {data.messageUr}
          </p>
        )}

        {typeof data.starsAdded === 'number' && data.starsAdded > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 font-display text-lg font-bold text-amber-800 tabular-nums">
            <span aria-hidden="true">⭐</span>
            <span>+{data.starsAdded}</span>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d btn-mint w-full rounded-2xl px-6 py-3.5 text-lg"
          >
            {lang === 'ur' ? 'شاباش! آگے بڑھیں' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
