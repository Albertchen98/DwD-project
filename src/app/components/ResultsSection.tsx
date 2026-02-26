import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoComparisonSlider } from './VideoComparisonSlider';

const BASE = '/assets/20260123-webvideo/';
const CG = `${BASE}cg_process/`;

const SCENES = [
  'Town01_Route0027_3.mp4',
  'Town04_Route0030_1.mp4',
  'Town06_Route0050_7.mp4',
  'Town07_Route0035_4.mp4',
  'Town10HD_Route0038_4.mp4',
  'Town10HD_Route0044_1.mp4',
];

// For DwD, Town07_Route0035_4 uses a backup file
const DWD_SPECIAL: Record<string, string> = {
  'Town07_Route0035_4.mp4': 'Town07_Route0035_4_backup_5.mp4',
};

const METHODS: { value: string; label: string }[] = [
  { value: 'dwd_process', label: 'DwD (Ours)' },
  { value: 'blur_result', label: 'Cosmos Transfer 2.5 Blur' },
  { value: 'edge_process', label: 'Cosmos Transfer 2.5 Edge' },
  { value: 'depth_result', label: 'Cosmos Transfer 2.5 Depth' },
  { value: 'depth_edge_result', label: 'Cosmos Transfer 2.5 Depth+Edge' },
  { value: 'seg_process', label: 'Cosmos Transfer 2.5 Seg' },
  { value: 'seg_edge_result', label: 'Cosmos Transfer 2.5 Seg+Edge' },
  { value: 'fresco_result', label: 'FRESCO' },
  { value: 'tclight_result', label: 'TC-Light' },
];

// Methods for comparison against DwD (excludes DwD itself)
const COMPARISON_METHODS = METHODS.filter((m) => m.value !== 'dwd_process');

// Long video filenames per method
const LONG_VIDEO_FILES: Record<string, string> = {
  dwd_process: '1120_DV.mp4',
  blur_result: '1120_DV.mp4',
  edge_process: '1120_DV.mp4',
  depth_result: '1120_DV.mp4',
  depth_edge_result: '1120_DV_depth_edge.mp4',
  seg_process: '1120_DV.mp4',
  seg_edge_result: '1120_DV_seg_edge.mp4',
  fresco_result: '1120_DV.mp4',
  tclight_result: '1120_DV.mp4',
};

const CHART_IMAGES = [
  '/static/images/charts/chart_01.png',
  '/static/images/charts/chart_02.png',
  '/static/images/charts/chart_03.png',
  '/static/images/charts/chart_04.png',
];

function getDwdFile(scene: string) {
  return DWD_SPECIAL[scene] ?? scene;
}

// ─── Dot indicators ────────────────────────────────────────────────────────
function Dots({ count, current, onChange }: { count: number; current: number; onChange: (i: number) => void }) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === current ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Sim-to-Real Carousel ──────────────────────────────────────────────────
function SimToRealCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + SCENES.length) % SCENES.length);
  const next = () => setIndex((i) => (i + 1) % SCENES.length);

  const scene = SCENES[index];
  const leftSrc = `${CG}${scene}`;
  const rightSrc = `${BASE}dwd_process/${getDwdFile(scene)}`;

  return (
    <div>
      <div className="relative">
        <VideoComparisonSlider key={`sim-${index}`} leftSrc={leftSrc} rightSrc={rightSrc} />
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      <Dots count={SCENES.length} current={index} onChange={setIndex} />
    </div>
  );
}

// ─── Triple Video Comparison ────────────────────────────────────────────────
// Layout: CG simulation on the left, DwD (top-right) vs method (bottom-right)
// Two drag handles: horizontal divider (CG vs right) and vertical divider (DwD vs method)
function TripleVideoComparison({
  cgSrc,
  dwdSrc,
  methodSrc,
  methodLabel,
}: {
  cgSrc: string;
  dwdSrc: string;
  methodSrc: string;
  methodLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cgRef = useRef<HTMLVideoElement>(null);
  const dwdRef = useRef<HTMLVideoElement>(null);
  const methodRef = useRef<HTMLVideoElement>(null);
  const [hPos, setHPos] = useState(50); // left/right divider (CG vs right side)
  const [vPos, setVPos] = useState(50); // top/bottom divider (DwD vs method, right side)
  const draggingRef = useRef<'h' | 'v' | null>(null);

  // Load all three videos; start only when all are buffered for frame alignment
  useEffect(() => {
    const cg = cgRef.current;
    const dwd = dwdRef.current;
    const method = methodRef.current;
    if (!cg || !dwd || !method) return;

    const videos = [cg, dwd, method];
    let cleanup = false;
    let readyCount = 0;

    videos.forEach(v => v.pause());

    // All three buffered — seek all to frame 0 and play together
    const startAll = () => {
      if (cleanup) return;
      videos.forEach(v => { v.currentTime = 0; });
      Promise.all(videos.map(v => v.play())).catch(() => {});
    };

    const onReady = () => {
      readyCount++;
      if (readyCount >= 3) startAll();
    };

    // When any video ends, restart all from frame 0 together
    const onEnded = () => { if (!cleanup) startAll(); };

    // If one stalls, pause all; resume when both are ready again
    const onWaiting = () => { if (!cleanup) videos.forEach(v => v.pause()); };
    const onCanPlay = () => {
      if (!cleanup && videos.every(v => v.readyState >= 3)) {
        Promise.all(videos.map(v => v.play())).catch(() => {});
      }
    };

    cg.addEventListener('canplaythrough', onReady, { once: true });
    dwd.addEventListener('canplaythrough', onReady, { once: true });
    method.addEventListener('canplaythrough', onReady, { once: true });
    videos.forEach(v => {
      v.addEventListener('ended', onEnded);
      v.addEventListener('waiting', onWaiting);
      v.addEventListener('canplay', onCanPlay);
    });

    cg.src = cgSrc; dwd.src = dwdSrc; method.src = methodSrc;
    cg.load(); dwd.load(); method.load();

    return () => {
      cleanup = true;
      cg.removeEventListener('canplaythrough', onReady);
      dwd.removeEventListener('canplaythrough', onReady);
      method.removeEventListener('canplaythrough', onReady);
      videos.forEach(v => {
        v.removeEventListener('ended', onEnded);
        v.removeEventListener('waiting', onWaiting);
        v.removeEventListener('canplay', onCanPlay);
        v.pause();
      });
    };
  }, [cgSrc, dwdSrc, methodSrc]);

  // Global drag handlers
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (draggingRef.current === 'h') {
        setHPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
      } else {
        setVPos(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      if (draggingRef.current === 'h') {
        setHPos(Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100)));
      } else {
        setVPos(Math.max(0, Math.min(100, ((e.touches[0].clientY - rect.top) / rect.height) * 100)));
      }
    };
    const onEnd = () => { draggingRef.current = null; };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, []);

  // Clip paths:
  //   CG: full-height left strip
  //   DwD: top-right quadrant
  //   Method: bottom-right quadrant
  const cgClip = `inset(0 ${100 - hPos}% 0 0)`;
  const dwdClip = `polygon(${hPos}% 0%, 100% 0%, 100% ${vPos}%, ${hPos}% ${vPos}%)`;
  const methodClip = `polygon(${hPos}% ${vPos}%, 100% ${vPos}%, 100% 100%, ${hPos}% 100%)`;

  // The vertical drag handle sits midway between hPos and the right edge
  const vHandleX = (hPos + 100) / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none bg-black rounded-xl overflow-hidden"
      style={{ paddingTop: '56.25%' }}
    >
      <div className="absolute inset-0">
        {/* Method video — bottom-right quadrant */}
        <video ref={methodRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="auto"
          style={{ clipPath: methodClip }} />
        {/* DwD video — top-right quadrant */}
        <video ref={dwdRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="auto"
          style={{ clipPath: dwdClip }} />
        {/* CG video — left strip */}
        <video ref={cgRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="auto"
          style={{ clipPath: cgClip }} />

        {/* Vertical divider line (full height) */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-white/70 pointer-events-none"
          style={{ left: `${hPos}%`, transform: 'translateX(-50%)' }} />

        {/* Horizontal divider line (right side only) */}
        <div className="absolute h-[2px] bg-white/70 pointer-events-none"
          style={{ top: `${vPos}%`, left: `${hPos}%`, right: 0, transform: 'translateY(-50%)' }} />

        {/* Horizontal drag handle (controls left/right split) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-ew-resize z-20"
          style={{ left: `${hPos}%`, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '2px solid rgba(255,255,255,0.7)', boxShadow: '0 0 12px rgba(0,0,0,0.4)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); draggingRef.current = 'h'; }}
          onTouchStart={(e) => { e.preventDefault(); draggingRef.current = 'h'; }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" transform="rotate(180 12 12)" />
          </svg>
        </div>

        {/* Vertical drag handle (controls top/bottom split on right side) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-ns-resize z-20"
          style={{ left: `${vHandleX}%`, top: `${vPos}%`, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: '2px solid rgba(255,255,255,0.7)', boxShadow: '0 0 12px rgba(0,0,0,0.4)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); draggingRef.current = 'v'; }}
          onTouchStart={(e) => { e.preventDefault(); draggingRef.current = 'v'; }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" style={{ transform: 'rotate(90deg)' }}>
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" transform="rotate(180 12 12)" />
          </svg>
        </div>

        {/* Labels */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium z-10">
          Simulation
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-yellow-300 text-xs font-medium z-10">
          DwD (Ours)
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium z-10">
          {methodLabel}
        </div>
      </div>
    </div>
  );
}

// ─── Method Comparison Carousel ────────────────────────────────────────────
function MethodComparisonCarousel() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [method, setMethod] = useState('blur_result');

  const prevScene = () => setSceneIndex((i) => (i - 1 + SCENES.length) % SCENES.length);
  const nextScene = () => setSceneIndex((i) => (i + 1) % SCENES.length);

  const scene = SCENES[sceneIndex];
  const cgSrc = `${CG}${scene}`;
  const dwdSrc = `${BASE}dwd_process/${getDwdFile(scene)}`;
  const methodSrc = `${BASE}${method}/${scene}`;
  const methodLabel = COMPARISON_METHODS.find((m) => m.value === method)?.label ?? method;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 justify-center flex-wrap">
        <span className="text-slate-400 text-sm">Compare DwD with:</span>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-white/30"
        >
          {COMPARISON_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <TripleVideoComparison
          key={`triple-${sceneIndex}-${method}`}
          cgSrc={cgSrc}
          dwdSrc={dwdSrc}
          methodSrc={methodSrc}
          methodLabel={methodLabel}
        />
        <button
          onClick={prevScene}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={nextScene}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      <Dots count={SCENES.length} current={sceneIndex} onChange={setSceneIndex} />
    </div>
  );
}

// ─── Long Video Comparison ─────────────────────────────────────────────────
function LongVideoComparison() {
  const [method, setMethod] = useState('blur_result');

  const dwdLongFile = LONG_VIDEO_FILES['dwd_process'];
  const methodFile = LONG_VIDEO_FILES[method] ?? '1120_DV.mp4';
  const cgSrc = `${CG}1120_DV.mp4`;
  const dwdSrc = `${BASE}dwd_process/${dwdLongFile}`;
  const methodSrc = `${BASE}${method}/${methodFile}`;
  const methodLabel = COMPARISON_METHODS.find((m) => m.value === method)?.label ?? method;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 justify-center flex-wrap">
        <span className="text-slate-400 text-sm">Compare DwD with:</span>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-white/30"
        >
          {COMPARISON_METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <TripleVideoComparison
        key={`long-triple-${method}`}
        cgSrc={cgSrc}
        dwdSrc={dwdSrc}
        methodSrc={methodSrc}
        methodLabel={methodLabel}
      />
    </div>
  );
}

// ─── BEV Videos ───────────────────────────────────────────────────────────
function BEVVideos() {
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    let bothReady = false;
    const tryPlay = () => {
      if (!bothReady && left.readyState >= 2 && right.readyState >= 2) {
        bothReady = true;
        left.play().catch(() => {});
        right.play().catch(() => {});
      }
    };

    left.addEventListener('canplay', tryPlay);
    right.addEventListener('canplay', tryPlay);
    tryPlay();

    return () => {
      left.removeEventListener('canplay', tryPlay);
      right.removeEventListener('canplay', tryPlay);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
        <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium">
          Rendered BEV Mesh
        </div>
        <video
          ref={leftRef}
          className="w-full aspect-video object-cover"
          muted
          loop
          playsInline
          preload="auto"
          src={`${BASE}extra_video/render_path2_clip.mp4`}
        />
      </div>
      <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
        <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium">
          DwD Output
        </div>
        <video
          ref={rightRef}
          className="w-full aspect-video object-cover"
          muted
          loop
          playsInline
          preload="auto"
          src={`${BASE}extra_video/render_path2_clip_up4pca8.mp4`}
        />
      </div>
    </div>
  );
}

// ─── Chart Carousel ────────────────────────────────────────────────────────
function ChartCarousel() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const prev = () => setIndex((i) => (i - 1 + CHART_IMAGES.length) % CHART_IMAGES.length);
  const next = () => setIndex((i) => (i + 1) % CHART_IMAGES.length);

  return (
    <div>
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-black/20">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <img
            src={CHART_IMAGES[index]}
            alt={`Qualitative comparison chart ${index + 1}`}
            className="w-full transition-opacity duration-300"
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            style={{ opacity: loading ? 0 : 1 }}
          />
        </div>

        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      <Dots count={CHART_IMAGES.length} current={index} onChange={setIndex} />
    </div>
  );
}

// ─── Quantitative Comparison ───────────────────────────────────────────────
const QUANT_ROWS = [
  { method: 'Simulation Baseline', skid: '29.59', sfid: '43.65', clip: '—', motion: '—', isOurs: false, isSim: true },
  { method: 'Best Competing Method', skid: '21.22', sfid: '32.59', clip: '119.63', motion: '98.80%', isOurs: false, isSim: false },
  { method: 'DwD (Ours)', skid: '9.30', sfid: '21.62', clip: '119.11', motion: '98.94%', isOurs: true, isSim: false },
];

const ABLATION_ROWS = [
  { config: 'k=3, ×1', sfid: '23.32', clip: '119.63', wssim: '91.52', isBest: false },
  { config: 'k=8, ×1', sfid: '21.37', clip: '118.78', wssim: '92.52', isBest: false },
  { config: 'k=16, ×1', sfid: '22.60', clip: '117.93', wssim: '93.21', isBest: false },
  { config: 'k=8, ×4', sfid: '21.92', clip: '118.50', wssim: '92.69', isBest: false },
  { config: 'k=8, ×4 + Temp (Full Model)', sfid: '21.62', clip: '119.11', wssim: '93.07', isBest: true },
];

function QuantitativeComparison() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">Method</th>
            <th className="text-center py-3 px-4 text-slate-400 font-medium">
              sKID ↓
              <span className="block text-xs text-slate-600 font-normal">Distribution Gap</span>
            </th>
            <th className="text-center py-3 px-4 text-slate-400 font-medium">
              sFID ↓
              <span className="block text-xs text-slate-600 font-normal">Generation Fidelity</span>
            </th>
            <th className="text-center py-3 px-4 text-slate-400 font-medium">
              CLIP-Real ↑
              <span className="block text-xs text-slate-600 font-normal">Perceptual Realism</span>
            </th>
            <th className="text-center py-3 px-4 text-slate-400 font-medium">
              Motion-S ↑
              <span className="block text-xs text-slate-600 font-normal">Motion Plausibility</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {QUANT_ROWS.map((row) => (
            <tr
              key={row.method}
              className={`border-b border-white/[0.04] transition-colors ${
                row.isOurs
                  ? 'bg-yellow-500/[0.06] hover:bg-yellow-500/[0.09]'
                  : row.isSim
                  ? 'opacity-50 hover:opacity-70'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <td className="py-3 px-4">
                <span className={`font-medium ${row.isOurs ? 'text-yellow-300' : row.isSim ? 'text-slate-500' : 'text-slate-300'}`}>
                  {row.method}
                </span>
                {row.isOurs && (
                  <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5">
                    Ours
                  </span>
                )}
              </td>
              <td className={`text-center py-3 px-4 ${row.isOurs ? 'text-yellow-300 font-semibold' : 'text-slate-400'}`}>
                {row.skid}
              </td>
              <td className={`text-center py-3 px-4 ${row.isOurs ? 'text-yellow-300 font-semibold' : 'text-slate-400'}`}>
                {row.sfid}
              </td>
              <td className={`text-center py-3 px-4 ${row.isOurs ? 'text-yellow-300 font-semibold' : 'text-slate-400'}`}>
                {row.clip}
              </td>
              <td className={`text-center py-3 px-4 ${row.isOurs ? 'text-yellow-300 font-semibold' : 'text-slate-400'}`}>
                {row.motion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-600 text-xs mt-3 text-center">
        "Best Competing Method" shows the best result per metric among all baselines. DwD achieves ~70% improvement on sKID and ~50% on sFID vs. the simulation baseline.
      </p>
    </div>
  );
}

function AblationStudy() {
  return (
    <div>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Configuration</th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">
                sFID ↓
                <span className="block text-xs text-slate-600 font-normal">Generation Fidelity</span>
              </th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">
                CLIP-Real ↑
                <span className="block text-xs text-slate-600 font-normal">Perceptual Realism</span>
              </th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">
                W-SSIM ↑
                <span className="block text-xs text-slate-600 font-normal">Structural Consistency</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ABLATION_ROWS.map((row) => (
              <tr
                key={row.config}
                className={`border-b border-white/[0.04] transition-colors ${
                  row.isBest
                    ? 'bg-purple-500/[0.06] hover:bg-purple-500/[0.09]'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <td className="py-3 px-4">
                  <span className={`font-medium ${row.isBest ? 'text-purple-300' : 'text-slate-300'}`}>
                    {row.config}
                  </span>
                  {row.isBest && (
                    <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">
                      Full Model
                    </span>
                  )}
                </td>
                <td className={`text-center py-3 px-4 ${row.isBest ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                  {row.sfid}
                </td>
                <td className={`text-center py-3 px-4 ${row.isBest ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                  {row.clip}
                </td>
                <td className={`text-center py-3 px-4 ${row.isBest ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                  {row.wssim}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PCA ablation explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { k: 'k = 3', label: 'Over-pruned', desc: 'Excessive pruning causes semantic ambiguity and hallucinations — geometric structure is lost.', color: 'red' },
          { k: 'k = 8', label: 'Optimal Balance', desc: 'Best trade-off between structure preservation and texture suppression. Our default setting.', color: 'green' },
          { k: 'k = 32', label: 'Texture Leak', desc: 'High dimensions re-introduce high-frequency texture details from the simulation domain.', color: 'orange' },
        ].map((item) => (
          <div
            key={item.k}
            className={`rounded-xl p-4 border ${
              item.color === 'green'
                ? 'border-green-500/20 bg-green-500/[0.04]'
                : item.color === 'red'
                ? 'border-red-500/20 bg-red-500/[0.04]'
                : 'border-orange-500/20 bg-orange-500/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-mono font-bold text-sm ${
                item.color === 'green' ? 'text-green-400' : item.color === 'red' ? 'text-red-400' : 'text-orange-400'
              }`}>{item.k}</span>
              <span className="text-slate-400 text-xs">{item.label}</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Header helper ─────────────────────────────────────────────────
function SectionHeader({ label, title, desc }: { label: string; title: string; desc?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7 }}
      className="text-center mb-10"
    >
      <span className="text-yellow-400/80 uppercase tracking-[0.3em] text-sm">{label}</span>
      <h2 className="text-3xl md:text-4xl text-white mt-3" style={{ fontWeight: 700 }}>
        {title}
      </h2>
      {desc && <p className="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">{desc}</p>}
    </motion.div>
  );
}

// ─── Main ResultsSection ───────────────────────────────────────────────────
export function ResultsSection() {
  return (
    <section id="results" className="relative bg-slate-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-500/4 rounded-full blur-[180px] pointer-events-none" />

      {/* Sim-to-Real Results */}
      <div className="py-20 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-20">
          <SectionHeader
            label="Evaluation"
            title="Sim-to-Real Results"
            desc="Drag the slider to compare simulation input (left) with our DwD output (right). Use the arrows to browse different scenes."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SimToRealCarousel />
          </motion.div>
        </div>
      </div>

      {/* Method Comparison */}
      <div className="py-20 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-20">
          <SectionHeader
            label="Comparison"
            title="Comparison with Other Methods"
            desc="Compare our DwD method with other Sim-to-Real approaches. Use the dropdown to select different methods, and drag the slider to compare."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MethodComparisonCarousel />
          </motion.div>
        </div>
      </div>

      {/* Long Video Generation */}
      <div className="py-20 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-20">
          <SectionHeader
            label="Temporal"
            title="Long Video Generation"
            desc="Our method can generate long driving videos with consistent quality. Compare different methods on a long driving sequence."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <LongVideoComparison />
          </motion.div>
        </div>
      </div>

      {/* Zero-shot BEV */}
      <div className="py-20 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-8">
          <SectionHeader
            label="Generalization"
            title="Zero-shot Result on Reconstructed Bird-Eye View Meshes"
            desc="Our method generalizes to novel viewpoints rendered from reconstructed bird-eye view meshes without any fine-tuning."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BEVVideos />
          </motion.div>
        </div>
      </div>

      {/* Qualitative Comparison Charts */}
      <div className="py-20 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-20">
          <SectionHeader
            label="Qualitative"
            title="Qualitative Comparison Charts"
            desc="Extra qualitative comparison with state-of-the-art methods. Red boxes highlight inconsistencies with the CG input; green boxes point out low-fidelity textures."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ChartCarousel />
          </motion.div>
        </div>
      </div>

      {/* Quantitative Comparison */}
      <div className="py-20 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <SectionHeader
            label="Quantitative"
            title="Quantitative Comparison"
            desc="Systematic evaluation on CARLA simulation data. DwD achieves state-of-the-art performance across all key metrics."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            <QuantitativeComparison />
          </motion.div>
        </div>
      </div>

      {/* Ablation Study */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-8">
          <SectionHeader
            label="Ablation"
            title="Ablation Study"
            desc="We ablate the key components of VFM-Prism. Each component contributes to the final performance."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden p-6"
          >
            <AblationStudy />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
