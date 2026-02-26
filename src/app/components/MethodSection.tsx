import { motion } from 'motion/react';
import { Layers, Zap, GitBranch, LayoutGrid } from 'lucide-react';

const contributions = [
  {
    icon: GitBranch,
    title: 'Unified VFM Bridge',
    text: 'We propose using Vision Foundation Model (VFM/DINOv3) features as a universal bridge between simulation and real-world domains, resolving the Consistency-Realism Dilemma inherent in existing approaches.',
  },
  {
    icon: Layers,
    title: 'VFM-Prism Module',
    text: 'Principal Subspace Projection discards texture-baking high-frequency components, while Random Channel Tail Drop prevents structural loss from rigid dimensionality reduction — reconciling realism with control.',
  },
  {
    icon: LayoutGrid,
    title: 'Spatial Alignment Module',
    text: 'A learnable Spatial Alignment Module adapts DINOv3\'s high-resolution features to the diffusion backbone, enhancing control precision while preserving fine-grained structural detail.',
  },
  {
    icon: Zap,
    title: 'Causal Temporal Aggregator',
    text: 'Causal convolutions explicitly preserve historical motion context when integrating frame-wise DINO features, effectively mitigating motion blur and guaranteeing temporal stability.',
  },
];

export function MethodSection() {
  return (
    <section id="method" className="relative py-32 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 overflow-hidden">
      <div className="max-w-5xl mx-auto px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-yellow-400/80 uppercase tracking-[0.3em] text-sm">Framework</span>
          <h2 className="text-4xl md:text-5xl text-white mt-4" style={{ fontWeight: 700 }}>
            Method Overview
          </h2>
        </motion.div>

        {/* Main figure */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
            <img
              src="/static/images/mainfigurev2.png"
              alt="DwD Method Overview"
              className="w-full"
            />
          </div>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed text-center max-w-3xl mx-auto">
            The framework of DwD. <em>(a) Training:</em> The model is trained on real-world driving videos using a controllable
            diffusion architecture. The core module, VFM-Prism, processes DINOv3 features through Spatial Resolution Enhancement,
            Minor Components Pruning, and Causal Temporal Aggregation. <em>(b) Inference:</em> The model performs Sim-to-Real
            translation using synthetic inputs, generating high-fidelity photorealistic videos that strictly preserve the
            simulation's geometric layout.
          </p>
        </motion.div>

        {/* Key contributions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mt-20 mb-12"
        >
          <span className="text-green-400/80 uppercase tracking-[0.3em] text-sm">Novelty</span>
          <h2 className="text-3xl md:text-4xl text-white mt-4" style={{ fontWeight: 700 }}>
            Key Contributions
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contributions.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="h-full p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-white text-lg mb-3" style={{ fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm" style={{ lineHeight: 1.7 }}>
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
