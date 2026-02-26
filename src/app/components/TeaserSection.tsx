import { motion } from 'motion/react';

export function TeaserSection() {
  return (
    <section className="py-8 bg-gradient-to-b from-indigo-950 to-slate-950">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="/static/images/teaser_figurev4-1.png"
            alt="DwD Teaser Figure"
            className="w-full rounded-2xl"
            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
