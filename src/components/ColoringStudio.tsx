import { useRef, useState } from 'react';
import { Lock, RotateCcw, Save, Sparkles, Trash2 } from 'lucide-react';
import { COLORING_TEMPLATES, PALETTES } from '../data/gameData';
import {
  ColoringCategory,
  ColoringTemplate,
  LanguageMode,
  PaletteName,
} from '../types';
import {
  playClick,
  playOops,
  playPop,
  playSparkle,
  speakText,
  triggerHaptic,
} from '../utils/audio';

interface ColoringStudioProps {
  stars: number;
  lang: LanguageMode;
  sound: boolean;
  voice: boolean;
  selectedPalette: PaletteName;
  selectedColor: string;
  selectedTemplateId: string;
  onSelectPalette: (palette: PaletteName) => void;
  onSelectColor: (color: string) => void;
  onSelectTemplate: (id: string) => void;
  onSaveArtwork: (titleEn: string, titleUr: string, pngDataUrl: string) => void;
  onShowLockedMessage: (template: ColoringTemplate) => void;
}

const CATEGORIES: { id: ColoringCategory; en: string; ur: string }[] = [
  { id: 'All', en: 'All', ur: 'سب' },
  { id: 'Animals', en: 'Animals', ur: 'جانور' },
  { id: 'Fruits', en: 'Fruits', ur: 'پھل' },
  { id: 'Vehicles', en: 'Vehicles', ur: 'گاڑیاں' },
  { id: 'Birds', en: 'Birds', ur: 'پرندے' },
];

export function ColoringStudio({
  stars,
  lang,
  sound,
  voice,
  selectedPalette,
  selectedColor,
  selectedTemplateId,
  onSelectPalette,
  onSelectColor,
  onSelectTemplate,
  onSaveArtwork,
  onShowLockedMessage,
}: ColoringStudioProps) {
  const [category, setCategory] = useState<ColoringCategory>('All');
  const [fillsByTemplate, setFillsByTemplate] = useState<Record<string, Record<string, string>>>({});
  const [historyByTemplate, setHistoryByTemplate] = useState<
    Record<string, Array<{ regionId: string; prevColor: string }>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const template =
    COLORING_TEMPLATES.find((t) => t.id === selectedTemplateId) || COLORING_TEMPLATES[0];

  const visibleTemplates = COLORING_TEMPLATES.filter(
    (t) => category === 'All' || t.category === category
  );

  const currentFills = fillsByTemplate[template.id] || {};
  const currentHistory = historyByTemplate[template.id] || [];
  const paletteColors = PALETTES[selectedPalette].colors;

  const handleRegionTap = (regionId: string) => {
    const prevColor = currentFills[regionId] || '#FFFFFF';
    setHistoryByTemplate((prev) => ({
      ...prev,
      [template.id]: [...(prev[template.id] || []), { regionId, prevColor }],
    }));
    setFillsByTemplate((prev) => ({
      ...prev,
      [template.id]: {
        ...(prev[template.id] || {}),
        [regionId]: selectedColor,
      },
    }));
    playPop(sound);
    triggerHaptic(16);
  };

  const handleUndo = () => {
    if (currentHistory.length === 0) return;
    const last = currentHistory[currentHistory.length - 1];
    setHistoryByTemplate((prev) => ({
      ...prev,
      [template.id]: (prev[template.id] || []).slice(0, -1),
    }));
    setFillsByTemplate((prev) => ({
      ...prev,
      [template.id]: {
        ...(prev[template.id] || {}),
        [last.regionId]: last.prevColor,
      },
    }));
    playClick(sound);
  };

  const handleClear = () => {
    setFillsByTemplate((prev) => ({ ...prev, [template.id]: {} }));
    setHistoryByTemplate((prev) => ({ ...prev, [template.id]: [] }));
    playClick(sound);
  };

  const handleMagicFill = () => {
    const suggested: Record<string, string> = {};
    template.regions.forEach((r) => {
      suggested[r.id] = r.suggestedColor;
    });
    setFillsByTemplate((prev) => ({ ...prev, [template.id]: suggested }));
    setHistoryByTemplate((prev) => ({ ...prev, [template.id]: [] }));
    playSparkle(sound);
    triggerHaptic(22);
  };

  const handleTemplatePick = (tpl: ColoringTemplate) => {
    if (stars < tpl.starsRequired) {
      playOops(sound);
      speakText(
        `Earn ${tpl.starsRequired} stars to unlock ${tpl.titleEn}`,
        `${tpl.titleUr} کھولنے کے لیے ${tpl.starsRequired} ستارے حاصل کریں`,
        lang,
        voice
      );
      onShowLockedMessage(tpl);
      return;
    }
    playClick(sound);
    onSelectTemplate(tpl.id);
    speakText(tpl.titleEn, tpl.titleUr, lang, voice);
  };

  const handleSave = () => {
    const svgEl = svgRef.current;
    if (!svgEl || isSaving) return;
    setIsSaving(true);

    try {
      const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('width', '640');
      clonedSvg.setAttribute('height', '640');
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 640, 640);
          ctx.drawImage(img, 0, 0, 640, 640);
          const pngDataUrl = canvas.toDataURL('image/png');
          const safeFilename = `HappyColors_${template.id}_${Date.now()}.png`;
          if (window.AndroidBridge?.saveArtwork) {
            window.AndroidBridge.saveArtwork(pngDataUrl, safeFilename);
          } else if (window.AndroidBridge?.saveImageToDevice) {
            window.AndroidBridge.saveImageToDevice(pngDataUrl, safeFilename);
          }
          onSaveArtwork(template.titleEn, template.titleUr, pngDataUrl);
        }
        URL.revokeObjectURL(url);
        setIsSaving(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsSaving(false);
      };

      img.src = url;
    } catch {
      setIsSaving(false);
    }
  };

  const renderSvgShape = (
    tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'polygon' | 'line',
    attrs: Record<string, string | number>,
    extraProps?: Record<string, unknown>,
    shapeKey?: string
  ) => {
    const props = { ...attrs, ...extraProps };
    switch (tag) {
      case 'path':
        return <path key={shapeKey} {...props} />;
      case 'circle':
        return <circle key={shapeKey} {...props} />;
      case 'ellipse':
        return <ellipse key={shapeKey} {...props} />;
      case 'rect':
        return <rect key={shapeKey} {...props} />;
      case 'polygon':
        return <polygon key={shapeKey} {...props} />;
      case 'line':
        return <line key={shapeKey} {...props} />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      {/* Category & Picture Selector Bar */}
      <div className="clay-panel flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Categories">
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    playClick(sound);
                    setCategory(cat.id);
                  }}
                  className={`rounded-xl px-3.5 py-2 text-sm font-extrabold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
                  }`}
                >
                  {lang === 'ur' ? (
                    <span className="urdu-text text-sm">{cat.ur}</span>
                  ) : (
                    cat.en
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-sm font-bold text-slate-500">
            {lang === 'ur' ? (
              <span className="urdu-text">رنگ چنیں اور تصویر پر دبائیں</span>
            ) : (
              'Pick a color, then tap any shape'
            )}
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {visibleTemplates.map((tpl) => {
            const isSelected = tpl.id === template.id;
            const isLocked = stars < tpl.starsRequired;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleTemplatePick(tpl)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 px-3.5 py-2 text-sm font-extrabold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-sm'
                    : isLocked
                      ? 'border-slate-200 bg-slate-100 text-slate-500'
                      : 'border-sky-100 bg-white text-slate-800 hover:border-sky-300'
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {tpl.emoji}
                </span>
                <span>
                  {lang === 'ur' ? (
                    <span className="urdu-text text-sm">{tpl.titleUr}</span>
                  ) : (
                    tpl.titleEn
                  )}
                </span>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 tabular-nums">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    {tpl.starsRequired}⭐
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Coloring Workspace (Stacked on Portrait, Side-by-Side on Landscape/Desktop) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        {/* Canvas Stage */}
        <div className="clay-panel flex flex-col items-center justify-between p-5 lg:col-span-7">
          <div className="mb-3 flex w-full items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {lang === 'ur' ? (
                  <span className="urdu-text text-teal-800">{template.titleUr}</span>
                ) : (
                  template.titleEn
                )}
              </h2>
              {lang === 'both' && (
                <p className="urdu-text text-base font-bold text-teal-700">{template.titleUr}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className="inline-block h-7 w-7 rounded-full border-3 border-slate-800 shadow-xs"
                style={{ backgroundColor: selectedColor }}
                title="Active color"
                aria-label={`Active color ${selectedColor}`}
              />
            </div>
          </div>

          <div className="flex w-full flex-1 items-center justify-center rounded-3xl bg-sky-50/70 p-4">
            <svg
              ref={svgRef}
              viewBox="0 0 300 300"
              xmlns="http://www.w3.org/2000/svg"
              className="coloring-svg h-auto w-full max-w-[390px] drop-shadow-sm"
              role="img"
              aria-label={`${template.titleEn} coloring canvas`}
            >
              <rect width="300" height="300" rx="24" fill="#F8FDFF" />
              {template.regions.map((region) =>
                renderSvgShape(
                  region.tag,
                  region.attrs,
                  {
                    fill: currentFills[region.id] || '#FFFFFF',
                    'data-region': region.id,
                    onClick: () => handleRegionTap(region.id),
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `Fill ${region.id.replace('-', ' ')}`,
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRegionTap(region.id);
                      }
                    },
                  },
                  region.id
                )
              )}
              {template.details.map((detail, idx) =>
                renderSvgShape(detail.tag, detail.attrs, undefined, `detail-${idx}`)
              )}
            </svg>
          </div>
        </div>

        {/* Palette & Actions Sidebar */}
        <div className="clay-panel flex flex-col justify-between gap-5 p-5 lg:col-span-5">
          {/* Palette Switcher */}
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800">
              {lang === 'ur' ? (
                <span className="urdu-text">رنگوں کا سیٹ</span>
              ) : (
                'Color Palettes'
              )}
            </h3>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {(Object.keys(PALETTES) as PaletteName[]).map((pName) => {
                const active = pName === selectedPalette;
                const meta = PALETTES[pName];
                return (
                  <button
                    key={pName}
                    type="button"
                    onClick={() => {
                      playClick(sound);
                      onSelectPalette(pName);
                      onSelectColor(meta.colors[0]);
                    }}
                    className={`rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold whitespace-nowrap transition-all ${
                      active
                        ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300'
                    }`}
                  >
                    {lang === 'ur' ? (
                      <span className="urdu-text text-sm">{meta.labelUr}</span>
                    ) : (
                      meta.labelEn
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Swatches Grid */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-800">
                {lang === 'ur' ? (
                  <span className="urdu-text">رنگ چنیں</span>
                ) : (
                  'Tap a Color'
                )}
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {selectedColor === '#FFFFFF'
                  ? lang === 'ur'
                    ? 'سفید / ربر'
                    : 'White / Eraser'
                  : selectedColor}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-3 sm:grid-cols-6">
              {paletteColors.map((hex) => {
                const isSelected = hex.toLowerCase() === selectedColor.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    aria-label={hex === '#FFFFFF' ? 'White eraser' : `Color ${hex}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      playPop(sound);
                      onSelectColor(hex);
                    }}
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 transition-transform ${
                      isSelected
                        ? 'scale-115 border-slate-900 shadow-md'
                        : 'border-white shadow-[0_4px_0_rgba(15,23,42,0.18)] hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {hex === '#FFFFFF' && (
                      <span className="text-[11px] font-black text-slate-500">✕</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={currentHistory.length === 0}
              className="btn-3d btn-purple rounded-2xl px-4 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{lang === 'ur' ? 'واپس' : 'Undo'}</span>
            </button>

            <button
              type="button"
              onClick={handleMagicFill}
              className="btn-3d btn-sunny rounded-2xl px-4 py-3 text-base"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{lang === 'ur' ? 'جادو رنگ' : 'Magic Fill'}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="btn-3d btn-coral rounded-2xl px-4 py-3 text-base"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>{lang === 'ur' ? 'صاف کریں' : 'Clear'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-3d btn-mint rounded-2xl px-4 py-3 text-base disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{isSaving ? '...' : lang === 'ur' ? 'محفوظ کریں' : 'Save Art'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
