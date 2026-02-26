import { motion } from 'motion/react';

export function Footer() {
  return (
    <footer className="relative py-16 bg-slate-950 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xl text-white" style={{ fontWeight: 700 }}>
              Driving with{' '}
              <span className="text-yellow-400">DINO</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Vision Foundation Features as a Unified Bridge for Sim-to-Real Generation in Autonomous Driving
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-600">
            <a href="https://arxiv.org/abs/2602.06159" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">arXiv</a>
            <span className="text-slate-800">·</span>
            <a href="#" className="hover:text-slate-300 transition-colors">GitHub</a>
            <span className="text-slate-800">·</span>
            <a href="#resources" className="hover:text-slate-300 transition-colors">BibTeX</a>
          </div>
          <p className="text-slate-700 text-xs mt-8">
            © 2026 — All rights reserved
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
