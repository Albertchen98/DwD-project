import { useRef, useState, useEffect, useCallback } from 'react';

interface VideoComparisonSliderProps {
  leftSrc: string;
  rightSrc: string;
  leftLabel?: string;
  rightLabel?: string;
}

export function VideoComparisonSlider({
  leftSrc,
  rightSrc,
  leftLabel = 'Simulation',
  rightLabel = 'DwD (Ours)',
}: VideoComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState(50);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (!left || !right) return;

    let cleanup = false;
    let leftReady = false;
    let rightReady = false;

    left.pause();
    right.pause();

    // Both videos buffered — seek to 0 and play together for frame alignment
    const startTogether = () => {
      if (!leftReady || !rightReady || cleanup) return;
      // Adjust playback rates if durations differ
      if (left.duration && right.duration && Math.abs(left.duration - right.duration) > 0.1) {
        if (left.duration < right.duration) {
          left.playbackRate = left.duration / right.duration;
          right.playbackRate = 1;
        } else {
          left.playbackRate = 1;
          right.playbackRate = right.duration / left.duration;
        }
      }
      left.currentTime = 0;
      right.currentTime = 0;
      Promise.all([left.play(), right.play()]).catch(() => {});
    };

    const onLeftReady = () => { leftReady = true; startTogether(); };
    const onRightReady = () => { rightReady = true; startTogether(); };

    // When any video ends, restart both from frame 0 together
    const onEnded = () => {
      if (cleanup) return;
      left.currentTime = 0;
      right.currentTime = 0;
      Promise.all([left.play(), right.play()]).catch(() => {});
    };

    // If one stalls mid-playback, pause both
    const onWaiting = () => { if (!cleanup) { left.pause(); right.pause(); } };
    // When both are buffered again, resume together
    const onCanPlay = () => {
      if (!cleanup && left.readyState >= 3 && right.readyState >= 3) {
        Promise.all([left.play(), right.play()]).catch(() => {});
      }
    };

    left.addEventListener('canplaythrough', onLeftReady, { once: true });
    right.addEventListener('canplaythrough', onRightReady, { once: true });
    left.addEventListener('ended', onEnded);
    right.addEventListener('ended', onEnded);
    left.addEventListener('waiting', onWaiting);
    right.addEventListener('waiting', onWaiting);
    left.addEventListener('canplay', onCanPlay);
    right.addEventListener('canplay', onCanPlay);

    left.src = leftSrc;
    right.src = rightSrc;
    left.load();
    right.load();

    return () => {
      cleanup = true;
      left.removeEventListener('canplaythrough', onLeftReady);
      right.removeEventListener('canplaythrough', onRightReady);
      left.removeEventListener('ended', onEnded);
      right.removeEventListener('ended', onEnded);
      left.removeEventListener('waiting', onWaiting);
      right.removeEventListener('waiting', onWaiting);
      left.removeEventListener('canplay', onCanPlay);
      right.removeEventListener('canplay', onCanPlay);
      left.pause();
      right.pause();
    };
  }, [leftSrc, rightSrc]);

  // Global drag event listeners
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setPosition(pos);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
      setPosition(pos);
    };
    const onEnd = () => { isDraggingRef.current = false; };

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

  const onContainerClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none bg-black rounded-xl overflow-hidden"
      style={{ paddingTop: '56.25%' }}
      onClick={onContainerClick}
    >
      <div className="absolute inset-0">
        {/* Right video — fully visible underneath */}
        <video
          ref={rightVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />
        {/* Left video — clipped to left portion */}
        <video
          ref={leftVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />

        {/* Vertical divider line */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-white/80 pointer-events-none"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        />

        {/* Draggable handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-ew-resize z-10"
          style={{
            left: `${position}%`,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            border: '2px solid rgba(255,255,255,0.65)',
            boxShadow: '0 0 12px rgba(0,0,0,0.4)',
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            isDraggingRef.current = true;
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            isDraggingRef.current = true;
          }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" transform="rotate(180 12 12)" />
          </svg>
        </div>

        {/* Labels */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium">
          {leftLabel}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium">
          {rightLabel}
        </div>
      </div>
    </div>
  );
}
