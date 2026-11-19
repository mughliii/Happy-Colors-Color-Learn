import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Settings, Star } from 'lucide-react';
import { CelebrationModal } from './components/CelebrationModal';
import { ColoringStudio } from './components/ColoringStudio';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import {
  AlphabetScreen,
  AnimalsScreen,
  FruitsScreen,
  NumbersScreen,
} from './components/LearnScreens';
import {
  GalleryScreen,
  QuizScreen,
  RewardsScreen,
  SettingsScreen,
} from './components/PlayAndProgressScreens';
import {
  AppState,
  CelebrationData,
  ColoringTemplate,
  LanguageMode,
  PaletteName,
  ScreenId,
} from './types';
import mascotImg from './assets/images/happy_colors_mascot_1795080973677.jpg';
import { playClick, playPop, playSuccess, triggerHaptic } from './utils/audio';

const STORAGE_KEY = 'happy_colors_studio_v1';
const MASCOT_IMAGE = mascotImg;

const DEFAULT_STATE: AppState = {
  stars: 2,
  sound: true,
  voice: true,
  lang: 'both',
  gallery: [],
  selectedPalette: 'Rainbow',
  selectedColor: '#FF4757',
  selectedTemplateId: 'lion',
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

interface HomeCardDef {
  id: ScreenId;
  icon: string;
  en: string;
  ur: string;
  bg: string;
  shadow: string;
  textColor?: string;
}

const HOME_CARDS: HomeCardDef[] = [
  {
    id: 'coloring',
    icon: '🖍️',
    en: 'Coloring Book',
    ur: 'رنگ بھریں',
    bg: 'linear-gradient(165deg, #ff758c 0%, #e11d48 100%)',
    shadow: '#be123c',
  },
  {
    id: 'alphabet',
    icon: '🔤',
    en: 'Alphabets A–Z',
    ur: 'حروف تہجی',
    bg: 'linear-gradient(165deg, #38bdf8 0%, #0284c7 100%)',
    shadow: '#0369a1',
  },
  {
    id: 'numbers',
    icon: '🔢',
    en: 'Numbers 1–20',
    ur: 'گنتی سیکھیں',
    bg: 'linear-gradient(165deg, #34d399 0%, #059669 100%)',
    shadow: '#047857',
  },
  {
    id: 'animals',
    icon: '🦁',
    en: 'Animals',
    ur: 'جانور',
    bg: 'linear-gradient(165deg, #fcd34d 0%, #f59e0b 100%)',
    shadow: '#b45309',
    textColor: '#451a03',
  },
  {
    id: 'fruits',
    icon: '🍓',
    en: 'Fruits',
    ur: 'پھل',
    bg: 'linear-gradient(165deg, #fb7185 0%, #db2777 100%)',
    shadow: '#9d174d',
  },
  {
    id: 'quiz',
    icon: '🧩',
    en: 'Fun Quiz',
    ur: 'دلچسپ کوئز',
    bg: 'linear-gradient(165deg, #a78bfa 0%, #7c3aed 100%)',
    shadow: '#5b21b6',
  },
  {
    id: 'gallery',
    icon: '🖼️',
    en: 'My Gallery',
    ur: 'میری گیلری',
    bg: 'linear-gradient(165deg, #2dd4bf 0%, #0d9488 100%)',
    shadow: '#0f766e',
  },
  {
    id: 'rewards',
    icon: '🏆',
    en: 'Rewards',
    ur: 'انعامات',
    bg: 'linear-gradient(165deg, #fb923c 0%, #ea580c 100%)',
    shadow: '#9a3412',
  },
];

const SCREEN_TITLES: Record<ScreenId, { en: string; ur: string }> = {
  home: { en: 'Happy Colors', ur: 'خوش رنگ' },
  coloring: { en: 'Coloring Book', ur: 'رنگ بھرنے کی کتاب' },
  alphabet: { en: 'Alphabets A–Z', ur: 'حروف تہجی' },
  numbers: { en: 'Numbers 1–20', ur: 'گنتی سیکھیں' },
  animals: { en: 'Animals', ur: 'جانور' },
  fruits: { en: 'Fruits', ur: 'پھل' },
  quiz: { en: 'Fun Quiz', ur: 'دلچسپ کوئز' },
  gallery: { en: 'My Gallery', ur: 'میری گیلری' },
  rewards: { en: 'Rewards', ur: 'انعامات' },
  settings: { en: 'Settings', ur: 'ترتیبات' },
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [navStack, setNavStack] = useState<ScreenId[]>(['home']);
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [mascotFailed, setMascotFailed] = useState(false);

  const currentScreen = navStack[navStack.length - 1];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Handle storage quota errors gracefully
    }
  }, [appState]);

  const navigate = useCallback(
    (screen: ScreenId) => {
      playPop(appState.sound);
      triggerHaptic(14);
      setNavStack((prev) => {
        if (prev[prev.length - 1] === screen) return prev;
        return [...prev, screen];
      });
    },
    [appState.sound]
  );

  const goBack = useCallback(() => {
    if (celebration) {
      setCelebration(null);
      return true;
    }
    if (navStack.length > 1) {
      playClick(appState.sound);
      setNavStack((prev) => prev.slice(0, -1));
      return true;
    }
    return false;
  }, [celebration, navStack.length, appState.sound]);

  useEffect(() => {
    window.handleHardwareBack = goBack;
    window.handleAndroidBack = goBack;
    return () => {
      delete window.handleHardwareBack;
      delete window.handleAndroidBack;
    };
  }, [goBack]);

  const awardStars = useCallback(
    (amount: number, data: Omit<CelebrationData, 'starsAdded'>) => {
      setAppState((prev) => ({ ...prev, stars: prev.stars + amount }));
      playSuccess(appState.sound);
      setConfettiKey((k) => k + 1);
      setCelebration({ ...data, starsAdded: amount });
    },
    [appState.sound]
  );

  const cycleLanguage = () => {
    const order: LanguageMode[] = ['both', 'en', 'ur'];
    const next = order[(order.indexOf(appState.lang) + 1) % order.length];
    playClick(appState.sound);
    setAppState((prev) => ({ ...prev, lang: next }));
  };

  const handleSaveArtwork = (titleEn: string, titleUr: string, dataUrl: string) => {
    const nowLabel = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    setAppState((prev) => ({
      ...prev,
      gallery: [
        {
          id: Date.now(),
          titleEn,
          titleUr,
          dataUrl,
          createdAt: nowLabel,
        },
        ...prev.gallery,
      ].slice(0, 20),
    }));

    awardStars(2, {
      titleEn: 'Artwork Saved!',
      titleUr: 'تصویر محفوظ ہو گئی!',
      messageEn: 'Saved to My Gallery! You earned +2 Stars!',
      messageUr: 'میری گیلری میں محفوظ ہو گئی! آپ نے ۲ ستارے جیتے!',
      icon: '🎨',
    });
  };

  const handleLockedTemplate = (tpl: ColoringTemplate) => {
    setCelebration({
      titleEn: 'Locked Picture',
      titleUr: 'یہ تصویر بند ہے',
      messageEn: `Earn ${tpl.starsRequired} ⭐ Stars to unlock ${tpl.titleEn}!`,
      messageUr: `${tpl.titleUr} کھولنے کے لیے ${tpl.starsRequired} ستارے حاصل کریں!`,
      icon: '🔒',
    });
  };

  const langButtonText =
    appState.lang === 'both' ? 'EN / اردو' : appState.lang === 'ur' ? 'اردو' : 'English';

  const headerTitle =
    appState.lang === 'ur'
      ? SCREEN_TITLES[currentScreen].ur
      : SCREEN_TITLES[currentScreen].en;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Compact 3D Top Bar */}
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b-4 border-sky-200/80 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          {currentScreen !== 'home' && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="btn-3d btn-coral h-10 w-10 shrink-0 rounded-full p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (currentScreen !== 'home') {
                playClick(appState.sound);
                setNavStack(['home']);
              }
            }}
            className="flex items-center gap-2 border-none bg-transparent p-0 text-left"
          >
            <span className="text-2xl" aria-hidden="true">
              🎨
            </span>
            <span
              className={`truncate font-display text-xl font-bold tracking-tight text-sky-800 sm:text-2xl ${
                appState.lang === 'ur' ? 'urdu-text text-xl' : ''
              }`}
            >
              {headerTitle}
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={cycleLanguage}
            className="btn-3d btn-sky rounded-xl px-3 py-2 text-xs sm:px-4 sm:text-sm"
            aria-label="Switch language mode"
          >
            {langButtonText}
          </button>

          <button
            type="button"
            onClick={() => navigate('rewards')}
            aria-label={`${appState.stars} stars earned`}
            className="btn-3d btn-sunny rounded-xl px-3 py-2 text-xs tabular-nums sm:px-3.5 sm:text-sm"
          >
            <Star className="h-4 w-4 fill-amber-700 text-amber-700" aria-hidden="true" />
            <span>{appState.stars}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('settings')}
            aria-label="Settings"
            className="btn-3d btn-white h-10 w-10 shrink-0 rounded-full p-0"
          >
            <Settings className="h-5 w-5 text-slate-700" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {currentScreen === 'home' && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-8">
            {/* Hero Welcome Banner */}
            <section className="clay-panel overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 p-6 text-white sm:p-7">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="max-w-xl text-center sm:text-left">
                  <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                    {appState.lang === 'ur' ? (
                      <span className="urdu-text text-white">آؤ کھیلیں، رنگ بھریں اور سیکھیں!</span>
                    ) : (
                      'Welcome, Little Artist!'
                    )}
                  </h1>

                  {appState.lang === 'both' && (
                    <p className="urdu-text mt-1 text-xl font-bold text-amber-100">
                      خوش آمدید! کھیلیں، رنگ بھریں اور سیکھیں
                    </p>
                  )}

                  <p className="mt-2 text-base font-bold text-sky-50/95">
                    {appState.lang === 'ur'
                      ? 'ستارے اور ٹرافیاں جیتنے کے لیے نیچے کوئی بھی سرگرمی منتخب کریں۔'
                      : 'Color pictures, learn A–Z & 1–20 in English and Urdu, and earn glowing stars.'}
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                    <button
                      type="button"
                      onClick={() => navigate('coloring')}
                      className="btn-3d btn-sunny rounded-2xl px-6 py-3 text-base"
                    >
                      <span>
                        {appState.lang === 'ur' ? 'رنگ بھرنا شروع کریں' : 'Start Coloring'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('quiz')}
                      className="btn-3d btn-white rounded-2xl px-5 py-3 text-base text-indigo-700"
                    >
                      <span>{appState.lang === 'ur' ? 'دلچسپ کوئز' : 'Quick Quiz'}</span>
                    </button>
                  </div>
                </div>

                {/* Bespoke Mascot Illustration */}
                <div className="animate-float shrink-0">
                  {!mascotFailed ? (
                    <img
                      src={MASCOT_IMAGE}
                      alt="Happy Colors Painter Bear Mascot"
                      referrerPolicy="no-referrer"
                      onError={() => setMascotFailed(true)}
                      className="h-36 w-36 rounded-3xl border-4 border-white/80 object-cover shadow-xl sm:h-44 sm:w-44"
                    />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-3xl border-4 border-white/80 bg-amber-100 text-7xl shadow-xl sm:h-44 sm:w-44">
                      🎨
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 8 Tactile 3D Activity Cards */}
            <section aria-label="Learning activities">
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
                {HOME_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => navigate(card.id)}
                    className="activity-card min-h-[148px] text-white"
                    style={{
                      background: card.bg,
                      color: card.textColor || '#ffffff',
                      boxShadow: `0 8px 0 ${card.shadow}, 0 14px 22px rgba(15, 23, 42, 0.14)`,
                    }}
                  >
                    <span className="text-5xl drop-shadow-sm" aria-hidden="true">
                      {card.icon}
                    </span>

                    {appState.lang !== 'ur' && (
                      <span className="font-display text-lg font-bold leading-tight sm:text-xl">
                        {card.en}
                      </span>
                    )}

                    {appState.lang !== 'en' && (
                      <span
                        className="urdu-text text-lg font-bold"
                        style={{ color: card.textColor || '#ffffff' }}
                      >
                        {card.ur}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentScreen === 'coloring' && (
          <ColoringStudio
            stars={appState.stars}
            lang={appState.lang}
            sound={appState.sound}
            voice={appState.voice}
            selectedPalette={appState.selectedPalette}
            selectedColor={appState.selectedColor}
            selectedTemplateId={appState.selectedTemplateId}
            onSelectPalette={(palette: PaletteName) =>
              setAppState((prev) => ({ ...prev, selectedPalette: palette }))
            }
            onSelectColor={(color: string) =>
              setAppState((prev) => ({ ...prev, selectedColor: color }))
            }
            onSelectTemplate={(id: string) =>
              setAppState((prev) => ({ ...prev, selectedTemplateId: id }))
            }
            onSaveArtwork={handleSaveArtwork}
            onShowLockedMessage={handleLockedTemplate}
          />
        )}

        {currentScreen === 'alphabet' && (
          <AlphabetScreen lang={appState.lang} sound={appState.sound} voice={appState.voice} />
        )}

        {currentScreen === 'numbers' && (
          <NumbersScreen
            lang={appState.lang}
            sound={appState.sound}
            voice={appState.voice}
            onCompleteCountingChallenge={() =>
              awardStars(1, {
                titleEn: 'Great Counting!',
                titleUr: 'شاباش! زبردست گنتی!',
                messageEn: 'You counted all the way to 10!',
                messageUr: 'آپ نے ۱۰ تک درست گنتی کی!',
                icon: '🌟',
              })
            }
          />
        )}

        {currentScreen === 'animals' && (
          <AnimalsScreen lang={appState.lang} sound={appState.sound} voice={appState.voice} />
        )}

        {currentScreen === 'fruits' && (
          <FruitsScreen lang={appState.lang} sound={appState.sound} voice={appState.voice} />
        )}

        {currentScreen === 'quiz' && (
          <QuizScreen
            lang={appState.lang}
            sound={appState.sound}
            voice={appState.voice}
            onCorrectAnswer={() =>
              awardStars(2, {
                titleEn: 'Correct Answer!',
                titleUr: 'بالکل درست جواب!',
                messageEn: 'Awesome job! You earned +2 Stars!',
                messageUr: 'بہت خوب! آپ نے ۲ ستارے جیتے!',
                icon: '🏆',
              })
            }
          />
        )}

        {currentScreen === 'gallery' && (
          <GalleryScreen
            gallery={appState.gallery}
            lang={appState.lang}
            sound={appState.sound}
            onDelete={(id: number) =>
              setAppState((prev) => ({
                ...prev,
                gallery: prev.gallery.filter((g) => g.id !== id),
              }))
            }
            onStartColoring={() => navigate('coloring')}
          />
        )}

        {currentScreen === 'rewards' && (
          <RewardsScreen
            stars={appState.stars}
            lang={appState.lang}
            sound={appState.sound}
            voice={appState.voice}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            sound={appState.sound}
            voice={appState.voice}
            lang={appState.lang}
            onToggleSound={() => setAppState((prev) => ({ ...prev, sound: !prev.sound }))}
            onToggleVoice={() => setAppState((prev) => ({ ...prev, voice: !prev.voice }))}
            onChangeLang={(lang: LanguageMode) => setAppState((prev) => ({ ...prev, lang }))}
            onResetProgress={() => setAppState(DEFAULT_STATE)}
          />
        )}
      </main>

      <CelebrationModal
        data={celebration}
        lang={appState.lang}
        onClose={() => {
          playClick(appState.sound);
          setCelebration(null);
        }}
      />

      <ConfettiCanvas burstKey={confettiKey} />
    </div>
  );
}
