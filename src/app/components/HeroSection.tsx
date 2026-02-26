import { motion } from 'motion/react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [dimensions, setDimensions] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    setDimensions({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: i % 3 === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(147, 197, 253, 0.3)',
            }}
            initial={{
              x: Math.random() * dimensions.w,
              y: Math.random() * dimensions.h,
            }}
            animate={{
              y: [null, Math.random() * dimensions.h],
              x: [null, Math.random() * dimensions.w],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 px-8 text-center max-w-5xl mx-auto">
        {/* Sparkle icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-14 h-14 text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-7xl sm:text-8xl md:text-9xl mb-4 tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ fontWeight: 800 }}
        >
          <motion.span
            className="inline-block"
            animate={{ backgroundPosition: ['0% center', '200% center'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
            }}
          >
            Driving
          </motion.span>
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-6 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="h-[2px] w-16 bg-gradient-to-r from-transparent via-purple-400 to-purple-400"
            animate={{ scaleX: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="text-3xl sm:text-4xl md:text-5xl text-purple-300 italic tracking-wider"
            animate={{
              textShadow: [
                '0 0 20px rgba(168, 85, 247, 0.4)',
                '0 0 30px rgba(168, 85, 247, 0.6)',
                '0 0 20px rgba(168, 85, 247, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            with
          </motion.span>
          <motion.div
            className="h-[2px] w-16 bg-gradient-to-l from-transparent via-purple-400 to-purple-400"
            animate={{ scaleX: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h2
          className="text-7xl sm:text-8xl md:text-9xl tracking-tight mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ fontWeight: 800 }}
        >
          <motion.span
            className="inline-block"
            animate={{
              color: ['#fbbf24', '#f59e0b', '#fbbf24'],
              textShadow: [
                '0 0 40px rgba(251, 191, 36, 0.5)',
                '0 0 60px rgba(251, 191, 36, 0.8)',
                '0 0 40px rgba(251, 191, 36, 0.5)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            DINO
          </motion.span>
        </motion.h2>

        {/* Full title */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-slate-300/70 max-w-2xl mx-auto mt-6 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          style={{ lineHeight: 1.7 }}
        >
          Vision Foundation Features as a Unified Bridge for Sim-to-Real Generation in Autonomous Driving
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-slate-400/60" />
          </motion.div>
        </motion.div>

        {/* Glowing orb effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl -z-10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
