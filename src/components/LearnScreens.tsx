import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from 'lucide-react';
import { ALPHABETS, ANIMALS, FRUITS, NUMBERS } from '../data/gameData';
import { LanguageMode } from '../types';
import { playClick, playPop, speakText, triggerHaptic } from '../utils/audio';

interface CommonLearnProps {
  lang: LanguageMode;
  sound: boolean;
  voice: boolean;
}

/* ==================== ALPHABET A-Z ==================== */
export function AlphabetScreen({ lang, sound, voice }: CommonLearnProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = ALPHABETS[activeIdx];

  const selectLetter = (idx: number) => {
    const safeIdx = (idx + ALPHABETS.length) % ALPHABETS.length;
    setActiveIdx(safeIdx);
    const chosen = ALPHABETS[safeIdx];
    playPop(sound);
    triggerHaptic(14);
    speakText(`${chosen.letter} for ${chosen.wordEn}`, chosen.wordUr, lang, voice);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      {/* Spotlight Card */}
      <div className="clay-panel flex flex-col items-center justify-between gap-6 p-6 md:flex-row md:px-10">
        <button
          type="button"
          onClick={() => selectLetter(activeIdx - 1)}
          aria-label="Previous letter"
          className="btn-3d btn-white hidden h-12 w-12 shrink-0 rounded-full p-0 md:inline-flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex flex-1 flex-col items-center gap-5 text-center sm:flex-row sm:justify-center sm:gap-10 sm:text-left">
          <div
            key={current.letter}
            className="animate-pop flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-amber-50 text-7xl shadow-inner"
            aria-hidden="true"
          >
            {current.emoji}
          </div>

          <div>
            <div className="font-display text-4xl font-bold sm:text-5xl" style={{ color: current.accent }}>
              {current.letter}{' '}
              <span className="text-slate-700">
                {lang === 'ur' ? '' : `for ${current.wordEn}`}
              </span>
            </div>

            {lang !== 'en' && (
              <p className="urdu-text mt-1 text-3xl font-bold text-teal-800">
                {current.wordUr}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <button
                type="button"
                onClick={() =>
                  speakText(`${current.letter} for ${current.wordEn}`, current.wordUr, lang, voice)
                }
                className="btn-3d btn-sky rounded-2xl px-5 py-2.5 text-base"
              >
                <Volume2 className="h-5 w-5" aria-hidden="true" />
                <span>
                  {lang === 'ur' ? 'سنیں' : lang === 'both' ? 'Listen • سنیں' : 'Listen'}
                </span>
              </button>

              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => selectLetter(activeIdx - 1)}
                  aria-label="Previous letter"
                  className="btn-3d btn-white h-11 w-11 rounded-full p-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => selectLetter(activeIdx + 1)}
                  aria-label="Next letter"
                  className="btn-3d btn-white h-11 w-11 rounded-full p-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => selectLetter(activeIdx + 1)}
          aria-label="Next letter"
          className="btn-3d btn-white hidden h-12 w-12 shrink-0 rounded-full p-0 md:inline-flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* A-Z Grid */}
      <div className="clay-panel p-5">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-13">
          {ALPHABETS.map((item, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={item.letter}
                type="button"
                onClick={() => selectLetter(idx)}
                className={`btn-3d flex-col gap-0.5 rounded-2xl py-3 text-center ${
                  active ? 'btn-sunny' : 'btn-white'
                }`}
              >
                <span className="font-display text-2xl font-bold">{item.letter}</span>
                <span className="text-lg" aria-hidden="true">
                  {item.emoji}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==================== NUMBERS 1-20 ==================== */
interface NumbersScreenProps extends CommonLearnProps {
  onCompleteCountingChallenge: () => void;
}

export function NumbersScreen({
  lang,
  sound,
  voice,
  onCompleteCountingChallenge,
}: NumbersScreenProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [starCount, setStarCount] = useState(0);

  const current = NUMBERS[activeIdx];

  const handleNumberPick = (idx: number) => {
    setActiveIdx(idx);
    const chosen = NUMBERS[idx];
    playPop(sound);
    triggerHaptic(14);
    speakText(`${chosen.num}, ${chosen.en}`, chosen.ur, lang, voice);
  };

  const handleStarTap = (index: number) => {
    const nextCount = index + 1;
    setStarCount(nextCount);
    playPop(sound);
    triggerHaptic(15);
    const matching = NUMBERS[nextCount - 1];
    speakText(matching.en, matching.ur, lang, voice);

    if (nextCount === 10) {
      onCompleteCountingChallenge();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      {/* Interactive Count-to-10 Star Game */}
      <div className="clay-panel flex flex-col items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-sky-50 p-5 md:flex-row">
        <div className="text-center md:text-left">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {lang === 'ur' ? (
              <span className="urdu-text text-teal-800">گننے کے لیے ستاروں کو دبائیں!</span>
            ) : (
              'Tap Stars to Count 1 to 10!'
            )}
          </h2>
          {lang === 'both' && (
            <p className="urdu-text text-base font-bold text-teal-700">
              گننے کے لیے ستاروں کو دبائیں!
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: 10 }, (_, idx) => {
            const lit = idx < starCount;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Count star ${idx + 1}`}
                onClick={() => handleStarTap(idx)}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl transition-transform hover:scale-110 active:scale-95 ${
                  lit ? 'bg-amber-200/80 shadow-xs' : 'bg-white/80 opacity-45'
                }`}
              >
                ⭐
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold text-amber-700 tabular-nums">
            {starCount} / 10
          </span>
          <button
            type="button"
            onClick={() => {
              playClick(sound);
              setStarCount(0);
            }}
            className="btn-3d btn-white rounded-xl px-3.5 py-2 text-sm"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{lang === 'ur' ? 'دوبارہ' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Spotlight Number Card */}
      <div className="clay-panel flex flex-col items-center justify-center gap-6 p-6 text-center sm:flex-row sm:text-left">
        <div
          key={current.num}
          className="animate-pop flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 font-display text-7xl font-bold text-emerald-600 shadow-inner tabular-nums"
        >
          {current.num}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-baseline justify-center gap-3 sm:justify-start">
            {lang !== 'ur' && (
              <h3 className="font-display text-4xl font-bold text-slate-900">{current.en}</h3>
            )}
            {lang !== 'en' && (
              <span className="urdu-text text-3xl font-bold text-teal-800">{current.ur}</span>
            )}
          </div>

          <div
            className="mt-3 flex flex-wrap justify-center gap-1.5 text-3xl sm:justify-start"
            aria-label={`${current.num} items`}
          >
            {Array.from({ length: current.num }, (_, i) => (
              <span key={i} aria-hidden="true">
                {current.emoji}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => speakText(`${current.num}, ${current.en}`, current.ur, lang, voice)}
              className="btn-3d btn-mint rounded-2xl px-5 py-2.5 text-base"
            >
              <Volume2 className="h-5 w-5" aria-hidden="true" />
              <span>
                {lang === 'ur' ? 'گنتی سنیں' : lang === 'both' ? 'Count • گنتی سنیں' : 'Hear Number'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-20 Grid */}
      <div className="clay-panel p-5">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-10">
          {NUMBERS.map((item, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => handleNumberPick(idx)}
                className={`btn-3d flex-col gap-0.5 rounded-2xl py-3 tabular-nums ${
                  active ? 'btn-sunny' : 'btn-white'
                }`}
              >
                <span className="font-display text-2xl font-bold">{item.num}</span>
                <span className="text-xs font-extrabold opacity-80">
                  {lang === 'ur' ? item.ur : item.en}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==================== ANIMALS ==================== */
export function AnimalsScreen({ lang, sound, voice }: CommonLearnProps) {
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {ANIMALS.map((animal) => {
          const isActive = activeAnimal === animal.nameEn;
          return (
            <button
              key={animal.nameEn}
              type="button"
              onClick={() => {
                setActiveAnimal(animal.nameEn);
                playPop(sound);
                triggerHaptic(18);
                speakText(`${animal.nameEn} says ${animal.sound}`, animal.nameUr, lang, voice);
              }}
              className={`activity-card text-slate-900 ${isActive ? 'ring-4 ring-sky-400' : ''}`}
              style={{
                background: `linear-gradient(160deg, ${animal.bgFrom}, ${animal.bgTo})`,
                boxShadow: '0 8px 0 rgba(15, 23, 42, 0.14), 0 14px 22px rgba(15, 23, 42, 0.08)',
              }}
            >
              <span className="text-6xl drop-shadow-xs" aria-hidden="true">
                {animal.emoji}
              </span>
              {lang !== 'ur' && (
                <span className="font-display text-2xl font-bold text-slate-900">
                  {animal.nameEn}
                </span>
              )}
              {lang !== 'en' && (
                <span className="urdu-text text-xl font-bold text-teal-900">{animal.nameUr}</span>
              )}
              <span className="text-sm font-extrabold text-slate-700">
                {lang === 'ur' ? (
                  <span className="urdu-text text-sm">{animal.soundUr}</span>
                ) : (
                  animal.sound
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== FRUITS ==================== */
export function FruitsScreen({ lang, sound, voice }: CommonLearnProps) {
  const [activeFruit, setActiveFruit] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FRUITS.map((fruit) => {
          const isActive = activeFruit === fruit.nameEn;
          return (
            <button
              key={fruit.nameEn}
              type="button"
              onClick={() => {
                setActiveFruit(fruit.nameEn);
                playPop(sound);
                triggerHaptic(18);
                speakText(
                  `${fruit.nameEn}, color ${fruit.colorEn}`,
                  `${fruit.nameUr}، رنگ ${fruit.colorUr}`,
                  lang,
                  voice
                );
              }}
              className={`activity-card text-slate-900 ${isActive ? 'ring-4 ring-rose-400' : ''}`}
              style={{
                background: `linear-gradient(160deg, ${fruit.bgFrom}, ${fruit.bgTo})`,
                boxShadow: '0 8px 0 rgba(15, 23, 42, 0.14), 0 14px 22px rgba(15, 23, 42, 0.08)',
              }}
            >
              <span className="text-6xl drop-shadow-xs" aria-hidden="true">
                {fruit.emoji}
              </span>
              {lang !== 'ur' && (
                <span className="font-display text-2xl font-bold text-slate-900">
                  {fruit.nameEn}
                </span>
              )}
              {lang !== 'en' && (
                <span className="urdu-text text-xl font-bold text-teal-900">{fruit.nameUr}</span>
              )}
              <span className="text-sm font-bold text-slate-700">
                {lang === 'ur' ? (
                  <span className="urdu-text text-sm">{fruit.colorUr}</span>
                ) : lang === 'both' ? (
                  <>
                    {fruit.colorEn} · <span className="urdu-text text-sm">{fruit.colorUr}</span>
                  </>
                ) : (
                  fruit.colorEn
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
