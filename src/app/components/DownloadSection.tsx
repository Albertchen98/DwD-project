import { motion } from 'motion/react';
import { FileText, Github, Database, ArrowUpRight } from 'lucide-react';

const resources = [
  {
    icon: FileText,
    title: 'Paper (arXiv)',
    description: 'Read the full paper on arXiv',
    link: 'https://arxiv.org/abs/2602.06159',
    color: '#f093fb',
    badge: 'arXiv 2026',
  },
  {
    icon: Github,
    title: 'Source Code',
    description: 'Official implementation on GitHub (coming soon)',
    link: '#',
    color: '#4facfe',
    badge: 'PyTorch',
  },
  {
    icon: Database,
    title: 'Pretrained Weights',
    description: 'Download model checkpoints (coming soon)',
    link: '#',
    color: '#43e97b',
    badge: 'HuggingFace',
  },
];

const bibtex = `@article{chen2026dwd,
  title={Driving with DINO: Vision Foundation Features as a Unified
         Bridge for Sim-to-Real Generation in Autonomous Driving},
  author={Chen, Xuyang and Zhang, Conglang and Fu, Chuanheng and
          Yang, Zihao and Zhou, Kaixuan and Zhang, Yizhi and
          He, Jianan and Zhang, Yanfeng and Sun, Mingwei and
          Wang, Zengmao and Dong, Zhen and Long, Xiaoxiao and
          Meng, Liqiu},
  journal={arXiv preprint arXiv:2602.06159},
  year={2026}
}`;

export function DownloadSection() {
  return (
    <section id="resources" className="relative py-32 bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

      <div className="max-w-5xl mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400/80 uppercase tracking-[0.3em] text-sm">Resources</span>
          <h2 className="text-4xl md:text-5xl text-white mt-4" style={{ fontWeight: 700 }}>
            Download & Links
          </h2>
        </motion.div>

        {/* Resource cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {resources.map((res, i) => (
            <motion.a
              key={res.title}
              href={res.link}
              target={res.link !== '#' ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group block p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${res.color}15`, border: `1px solid ${res.color}25` }}
                  >
                    <res.icon className="w-5 h-5" style={{ color: res.color }} />
                  </div>
                  <div>
                    <h3 className="text-white text-base" style={{ fontWeight: 600 }}>
                      {res.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{res.description}</p>
                    <span
                      className="inline-block mt-3 text-xs rounded-full px-3 py-1"
                      style={{ background: `${res.color}12`, color: res.color, border: `1px solid ${res.color}20` }}
                    >
                      {res.badge}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* BibTeX */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-white text-xl text-center mb-6" style={{ fontWeight: 600 }}>
            Citation
          </h3>
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden">
            <pre
              className="text-slate-400 text-sm overflow-x-auto whitespace-pre"
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace", lineHeight: 1.7 }}
            >
              {bibtex}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(bibtex)}
              className="absolute top-4 right-4 text-xs text-slate-500 hover:text-white border border-white/[0.08] hover:border-white/[0.2] rounded-lg px-3 py-1.5 transition-all bg-white/[0.02] hover:bg-white/[0.06]"
            >
              Copy
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
