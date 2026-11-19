import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Lock,
  Palette,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { ANIMALS, CURATED_QUIZZES, FRUITS, TROPHIES } from '../data/gameData';
import { GalleryItem, LanguageMode, QuizQuestion } from '../types';
import { playClick, playOops, playPop, speakText, triggerHaptic } from '../utils/audio';

function buildQuizDeck(): QuizQuestion[] {
  const pool = [
    ...ANIMALS.map((a) => ({ en: a.nameEn, ur: a.nameUr, emoji: a.emoji })),
    ...FRUITS.map((f) => ({ en: f.nameEn, ur: f.nameUr, emoji: f.emoji })),
  ];

  const generated: QuizQuestion[] = pool.slice(0, 8).map((target, idx) => {
    const distractors = pool
      .filter((p) => p.en !== target.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [target, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((item, optIdx) => ({
        id: `${idx}-${optIdx}`,
        labelEn: item.en,
        labelUr: item.ur,
        emoji: item.emoji,
      }));
    const correctIndex = options.findIndex((o) => o.labelEn === target.en);
    return {
      id: `gen-${idx}-${target.en}`,
      promptEn: `Where is the ${target.en}?`,
      promptUr: `${target.ur} کہاں ہے؟`,
      options,
      correctIndex,
    };
  });

  return [...CURATED_QUIZZES, ...generated];
}

/* ==================== FUN QUIZ ==================== */
interface QuizScreenProps {
  lang: LanguageMode;
  sound: boolean;
  voice: boolean;
  onCorrectAnswer: () => void;
}

export function QuizScreen({ lang, sound, voice, onCorrectAnswer }: QuizScreenProps) {
  const deck = useMemo(() => buildQuizDeck(), []);
  const [quizIndex, setQuizIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const advanceTimerRef = useRef<number | null>(null);

  const question = deck[quizIndex % deck.length];

  useEffect(() => {
    speakText(question.promptEn, question.promptUr, lang, voice);
  }, [question.id, lang, voice, question.promptEn, question.promptUr]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const handleAnswer = (idx: number) => {
    if (feedback === 'correct') return;
    setSelectedIdx(idx);

    if (idx === question.correctIndex) {
      setFeedback('correct');
      setStreak((s) => s + 1);
      triggerHaptic(25);
      onCorrectAnswer();
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = window.setTimeout(() => {
        setSelectedIdx(null);
        setFeedback('idle');
        setQuizIndex((q) => q + 1);
        advanceTimerRef.current = null;
      }, 650);
    } else {
      setFeedback('wrong');
      setStreak(0);
      playOops(sound);
      triggerHaptic(35);
      speakText('Try again!', 'دوبارہ کوشش کریں!', lang, voice);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="clay-panel p-6 text-center sm:p-8">
        <div className="mb-3 flex items-center justify-between text-sm font-extrabold text-slate-500 tabular-nums">
          <span>
            {lang === 'ur' ? `سوال ${quizIndex + 1}` : `Question ${quizIndex + 1}`}
          </span>
          <span>
            {lang === 'ur' ? `لگاتار درست: ${streak}` : `Streak: ${streak} 🔥`}
          </span>
        </div>

        {lang !== 'ur' && (
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            {question.promptEn}
          </h2>
        )}
        {lang !== 'en' && (
          <p className="urdu-text mt-2 text-2xl font-bold text-teal-800">
            {question.promptUr}
          </p>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => speakText(question.promptEn, question.promptUr, lang, voice)}
            className="btn-3d btn-purple rounded-2xl px-5 py-2.5 text-base"
          >
            <Volume2 className="h-5 w-5" aria-hidden="true" />
            <span>{lang === 'ur' ? 'سوال سنیں' : 'Hear Question'}</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {question.options.map((opt, idx) => {
            const isPicked = selectedIdx === idx;
            const isCorrectBtn = isPicked && feedback === 'correct';
            const isWrongBtn = isPicked && feedback === 'wrong';

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAnswer(idx)}
                className={`btn-3d flex-col gap-1 rounded-3xl px-4 py-5 ${
                  isCorrectBtn
                    ? 'btn-mint'
                    : isWrongBtn
                      ? 'btn-coral'
                      : 'btn-white'
                }`}
              >
                {opt.emoji && (
                  <span className="text-5xl" aria-hidden="true">
                    {opt.emoji}
                  </span>
                )}
                <span className="font-display text-xl font-bold">
                  {lang === 'ur' ? (
                    <span className="urdu-text text-lg">{opt.labelUr}</span>
                  ) : (
                    opt.labelEn
                  )}
                </span>
                {isCorrectBtn && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {lang === 'ur' ? 'درست!' : 'Correct!'}
                  </span>
                )}
                {isWrongBtn && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold">
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    {lang === 'ur' ? 'دوبارہ کوشش' : 'Try again'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==================== MY GALLERY ==================== */
interface GalleryScreenProps {
  gallery: GalleryItem[];
  lang: LanguageMode;
  sound: boolean;
  onDelete: (id: number) => void;
  onStartColoring: () => void;
}

export function GalleryScreen({
  gallery,
  lang,
  sound,
  onDelete,
  onStartColoring,
}: GalleryScreenProps) {
  if (gallery.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <div className="clay-panel p-8 text-center">
          <div className="mb-3 text-6xl" aria-hidden="true">
            🎨
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {lang === 'ur' ? (
              <span className="urdu-text text-teal-800">ابھی کوئی تصویر محفوظ نہیں</span>
            ) : (
              'No Drawings Saved Yet'
            )}
          </h2>
          {lang === 'both' && (
            <p className="urdu-text mt-1 text-lg font-bold text-teal-700">
              ابھی کوئی تصویر محفوظ نہیں کی گئی
            </p>
          )}
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {lang === 'ur'
              ? 'رنگ بھرنے کی کتاب میں جا کر اپنی پہلی تصویر بنائیں!'
              : 'Color a picture and tap Save Art to see your masterpiece here.'}
          </p>
          <button
            type="button"
            onClick={() => {
              playPop(sound);
              onStartColoring();
            }}
            className="btn-3d btn-coral mt-6 rounded-2xl px-6 py-3 text-base"
          >
            <Palette className="h-5 w-5" aria-hidden="true" />
            <span>{lang === 'ur' ? 'رنگ بھرنا شروع کریں' : 'Start Coloring'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <div key={item.id} className="clay-panel flex flex-col gap-3 p-4">
            <div className="overflow-hidden rounded-2xl border-2 border-sky-100 bg-white">
              <img
                src={item.dataUrl}
                alt={item.titleEn}
                className="aspect-square w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {lang === 'ur' ? (
                    <span className="urdu-text text-teal-800">{item.titleUr}</span>
                  ) : (
                    item.titleEn
                  )}
                </h3>
                <p className="text-xs font-bold text-slate-500">{item.createdAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={item.dataUrl}
                download={`HappyColors_${item.titleEn.replace(/\s+/g, '_')}.png`}
                onClick={() => playClick(sound)}
                className="btn-3d btn-sky rounded-xl px-3 py-2.5 text-sm no-underline"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>{lang === 'ur' ? 'ڈاؤن لوڈ' : 'Download'}</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  playClick(sound);
                  onDelete(item.id);
                }}
                className="btn-3d btn-coral rounded-xl px-3 py-2.5 text-sm"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>{lang === 'ur' ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== REWARDS & TROPHIES ==================== */
interface RewardsScreenProps {
  stars: number;
  lang: LanguageMode;
  sound: boolean;
  voice: boolean;
}

export function RewardsScreen({ stars, lang, sound, voice }: RewardsScreenProps) {
  const maxTarget = TROPHIES[TROPHIES.length - 1].starsRequired;
  const pct = Math.min(100, Math.round((stars / maxTarget) * 100));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="clay-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {lang === 'ur' ? (
                <span className="urdu-text text-teal-800">آپ کے ستارے اور ٹرافیاں</span>
              ) : (
                'Your Star Progress'
              )}
            </h2>
            {lang === 'both' && (
              <p className="urdu-text text-base font-bold text-teal-700">
                آپ کے ستارے اور ٹرافیاں
              </p>
            )}
          </div>
          <div className="font-display text-2xl font-bold text-amber-600 tabular-nums">
            ⭐ {stars} / {maxTarget}
          </div>
        </div>

        <div className="mt-4 h-5 w-full overflow-hidden rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TROPHIES.map((trophy) => {
          const unlocked = stars >= trophy.starsRequired;
          return (
            <button
              key={trophy.id}
              type="button"
              onClick={() => {
                playPop(sound);
                speakText(
                  unlocked
                    ? `${trophy.titleEn} unlocked!`
                    : `Earn ${trophy.starsRequired} stars to unlock ${trophy.titleEn}`,
                  trophy.titleUr,
                  lang,
                  voice
                );
              }}
              className={`clay-panel flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1 ${
                unlocked ? 'opacity-100' : 'opacity-65'
              }`}
            >
              <div className="mb-2 text-6xl" aria-hidden="true">
                {unlocked ? trophy.icon : '🔒'}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {lang === 'ur' ? (
                  <span className="urdu-text text-teal-800">{trophy.titleUr}</span>
                ) : (
                  trophy.titleEn
                )}
              </h3>
              {lang === 'both' && (
                <p className="urdu-text text-base font-bold text-teal-700">{trophy.titleUr}</p>
              )}
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {lang === 'ur' ? (
                  <span className="urdu-text text-sm">{trophy.descUr}</span>
                ) : (
                  trophy.descEn
                )}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold tabular-nums">
                {unlocked ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {lang === 'ur' ? 'انلاک ہو گیا!' : 'Unlocked'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    {lang === 'ur'
                      ? `${trophy.starsRequired} ستارے درکار ہیں`
                      : `Need ${trophy.starsRequired} ⭐`}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== SETTINGS ==================== */
interface SettingsScreenProps {
  sound: boolean;
  voice: boolean;
  lang: LanguageMode;
  onToggleSound: () => void;
  onToggleVoice: () => void;
  onChangeLang: (lang: LanguageMode) => void;
  onResetProgress: () => void;
}

export function SettingsScreen({
  sound,
  voice,
  lang,
  onToggleSound,
  onToggleVoice,
  onChangeLang,
  onResetProgress,
}: SettingsScreenProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="clay-panel flex flex-col gap-6 p-6 sm:p-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-slate-900">
            {lang === 'ur' ? (
              <span className="urdu-text text-teal-800">ترتیبات</span>
            ) : (
              'Settings'
            )}
          </h2>
          {lang === 'both' && (
            <p className="urdu-text text-lg font-bold text-teal-700">ترتیبات</p>
          )}
        </div>

        {/* Audio Toggles */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              onToggleSound();
              playClick(!sound);
            }}
            className={`btn-3d w-full justify-between rounded-2xl px-5 py-3.5 text-base ${
              sound ? 'btn-mint' : 'btn-white'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <span>{lang === 'ur' ? 'آواز کے اثرات' : 'Sound Effects'}</span>
            </span>
            <span className="font-extrabold">{sound ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick(sound);
              onToggleVoice();
            }}
            className={`btn-3d w-full justify-between rounded-2xl px-5 py-3.5 text-base ${
              voice ? 'btn-sky' : 'btn-white'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              {voice ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <span>{lang === 'ur' ? 'آواز سے پڑھنا' : 'Voice Narration (TTS)'}</span>
            </span>
            <span className="font-extrabold">{voice ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Language Mode */}
        <div>
          <p className="mb-2.5 font-display text-lg font-bold text-slate-800">
            {lang === 'ur' ? (
              <span className="urdu-text">زبان منتخب کریں</span>
            ) : (
              'Language / زبان'
            )}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'ur', label: 'اردو' },
                { id: 'both', label: 'EN + اردو' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playPop(sound);
                  onChangeLang(opt.id);
                }}
                className={`btn-3d rounded-2xl px-3 py-3 text-sm ${
                  lang === opt.id ? 'btn-sunny' : 'btn-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Download Android GitHub ZIP */}
        <div className="border-t border-slate-200 pt-5">
          <p className="mb-2 font-display text-lg font-bold text-slate-800">
            {lang === 'ur' ? (
              <span className="urdu-text">اینڈرائیڈ اے پی کے پروجیکٹ</span>
            ) : (
              'Android APK Project (GitHub)'
            )}
          </p>
          <p className="mb-3 text-xs font-bold text-slate-500">
            {lang === 'ur'
              ? 'زپ فائل ڈاؤن لوڈ کریں اور گٹ ہب پر اپلوڈ کر کے APK بنائیں۔'
              : 'Download the complete ZIP with Android project + GitHub Actions APK workflow.'}
          </p>
          <a
            href="/HappyColors-GitHub-APK.zip"
            download="HappyColors-GitHub-APK.zip"
            onClick={() => playClick(sound)}
            className="btn-3d btn-purple w-full rounded-2xl px-5 py-3 text-sm no-underline"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>
              {lang === 'ur'
                ? 'گٹ ہب پروجیکٹ ZIP ڈاؤن لوڈ کریں'
                : 'Download GitHub APK ZIP'}
            </span>
          </a>
        </div>

        {/* Reset Progress */}
        <div className="border-t border-slate-200 pt-5">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => {
                playClick(sound);
                setConfirmReset(true);
              }}
              className="btn-3d btn-white w-full rounded-2xl px-5 py-3 text-sm text-rose-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{lang === 'ur' ? 'تمام پیشرفت صاف کریں' : 'Reset Stars & Gallery'}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2.5 rounded-2xl bg-rose-50 p-4 text-center">
              <p className="text-sm font-extrabold text-rose-800">
                {lang === 'ur'
                  ? 'کیا آپ واقعی تمام ستارے اور تصاویر حذف کرنا چاہتے ہیں؟'
                  : 'Clear all earned stars and saved drawings?'}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn-3d btn-white rounded-xl py-2.5 text-sm"
                >
                  {lang === 'ur' ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick(sound);
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="btn-3d btn-coral rounded-xl py-2.5 text-sm"
                >
                  {lang === 'ur' ? 'ہاں، صاف کریں' : 'Yes, Reset'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
