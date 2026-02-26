import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Abstract', id: 'abstract' },
  { label: 'Method', id: 'method' },
  { label: 'Results', id: 'results' },
  { label: 'Resources', id: 'resources' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
          <span className="text-base text-white" style={{ fontWeight: 700 }}>
            <span className="text-purple-400 group-hover:text-purple-300 transition-colors">Driving</span>
            {' '}
            <span className="text-slate-500 italic text-sm">with</span>
            {' '}
            <span className="text-yellow-400 group-hover:text-yellow-300 transition-colors">DINO</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
          <a
            href="https://arxiv.org/abs/2602.06159"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-950 bg-white hover:bg-slate-200 rounded-lg px-4 py-2 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Read Paper
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
