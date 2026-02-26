import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export function AbstractSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  const paragraphs = [
    `Driven by the emergence of Controllable Video Diffusion, existing Sim2Real methods for autonomous driving video generation typically rely on explicit intermediate representations to bridge the domain gap. However, these modalities face a fundamental Consistency-Realism Dilemma. Low-level signals (e.g., edges, blurred images) ensure precise control but compromise realism by "baking in" synthetic artifacts, whereas high-level priors (e.g., depth, semantics, HDMaps) facilitate photorealism but lack the structural detail required for consistent guidance.`,
    `In this work, we present Driving with DINO (DwD), a novel framework that leverages Vision Foundation Module (VFM) features as a unified bridge between the simulation and real-world domains. We first identify that these features encode a spectrum of information, from high-level semantics to fine-grained structure. To effectively utilize this, we employ Principal Subspace Projection to discard the high-frequency elements responsible for "texture baking," while concurrently introducing Random Channel Tail Drop to mitigate the structural loss inherent in rigid dimensionality reduction, thereby reconciling realism with control consistency. Furthermore, to fully leverage DINOv3's high-resolution capabilities for enhancing control precision, we introduce a learnable Spatial Alignment Module that adapts these high-resolution features to the diffusion backbone. Finally, we propose a Causal Temporal Aggregator employing causal convolutions to explicitly preserve historical motion context when integrating frame-wise DINO features, which effectively mitigates motion blur and guarantees temporal stability.`,
    `Extensive experiments show that our approach achieves State-of-the-Art performance, significantly outperforming existing baselines in generating photorealistic driving videos that remain faithfully aligned with the simulation.`,
  ];

  return (
    <section
      ref={sectionRef}
      id="abstract"
      className="relative py-32 bg-slate-950 overflow-hidden"
    >
      {/* Parallax accent */}
      <motion.div className="absolute inset-0 opacity-30" style={{ y: bgY }}>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400/80 uppercase tracking-[0.3em] text-sm">Overview</span>
          <h2 className="text-4xl md:text-5xl text-white mt-4" style={{ fontWeight: 700 }}>
            Abstract
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div
            className="absolute -top-8 -left-4 text-8xl text-purple-500/10 select-none"
            style={{ fontWeight: 700, lineHeight: 1 }}
          >
            &ldquo;
          </div>

          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm space-y-5">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-slate-300/90 text-base leading-relaxed">
                {para.includes('Driving with DINO (DwD)') ? (
                  <>
                    In this work, we present{' '}
                    <span className="text-yellow-400/90 font-semibold">Driving with DINO (DwD)</span>
                    {para.slice(para.indexOf('Driving with DINO (DwD)') + 'Driving with DINO (DwD)'.length)}
                  </>
                ) : para.includes('State-of-the-Art') ? (
                  <>
                    Extensive experiments show that our approach achieves{' '}
                    <span className="text-blue-300 font-semibold">State-of-the-Art performance</span>
                    {para.slice(para.indexOf('State-of-the-Art performance') + 'State-of-the-Art performance'.length)}
                  </>
                ) : (
                  para
                )}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            { value: 'Video', label: 'Diffusion Model' },
            { value: 'VFM', label: 'Vision Foundation' },
            { value: 'Sim→Real', label: 'Domain Bridge' },
            { value: 'Temporal', label: 'Consistency' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="text-center p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]"
            >
              <div className="text-2xl text-white mb-1" style={{ fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-slate-400 text-xs tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
