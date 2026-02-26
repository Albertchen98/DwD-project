import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

const authors = [
  { name: 'Xuyang Chen', sup: '1,2*', affiliation: 'TU Munich / Huawei Hilbert' },
  { name: 'Conglang Zhang', sup: '3,4*', affiliation: 'Huawei Riemann Lab / Wuhan Univ.' },
  { name: 'Chuanheng Fu', sup: '3,4', affiliation: 'Huawei Riemann Lab / Wuhan Univ.' },
  { name: 'Zihao Yang', sup: '5', affiliation: 'USTC' },
  { name: 'Kaixuan Zhou', sup: '3†', affiliation: 'Huawei Riemann Lab', highlight: true },
  { name: 'Yizhi Zhang', sup: '3', affiliation: 'Huawei Riemann Lab' },
  { name: 'Jianan He', sup: '3', affiliation: 'Huawei Riemann Lab' },
  { name: 'Yanfeng Zhang', sup: '2', affiliation: 'Huawei Hilbert (Dresden)' },
  { name: 'Mingwei Sun', sup: '3,4', affiliation: 'Huawei Riemann Lab / Wuhan Univ.' },
  { name: 'Zhen Dong', sup: '4', affiliation: 'Wuhan University' },
  { name: 'Xiaoxiao Long', sup: '6', affiliation: 'Nanjing University' },
  { name: 'Zengmao Wang', sup: '4', affiliation: 'Wuhan University', highlight: true },
  { name: 'Liqiu Meng', sup: '1', affiliation: 'TU Munich' },
];

const affiliations = [
  { num: '1', name: 'Technical University of Munich' },
  { num: '2', name: 'Huawei Hilbert Research Center (Dresden)' },
  { num: '3', name: 'Huawei Riemann Lab' },
  { num: '4', name: 'Wuhan University' },
  { num: '5', name: 'University of Science and Technology of China' },
  { num: '6', name: 'Nanjing University' },
];

const gradients = [
  '#667eea, #764ba2',
  '#f093fb, #f5576c',
  '#4facfe, #00f2fe',
  '#43e97b, #38f9d7',
  '#fa709a, #fee140',
  '#667eea, #764ba2',
  '#f093fb, #f5576c',
  '#4facfe, #00f2fe',
  '#43e97b, #38f9d7',
  '#fa709a, #fee140',
  '#667eea, #764ba2',
  '#f093fb, #f5576c',
  '#4facfe, #00f2fe',
];

export function AuthorsSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-5xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-purple-400/80 uppercase tracking-[0.3em] text-sm">Research Team</span>
          <h2 className="text-4xl md:text-5xl text-white mt-4" style={{ fontWeight: 700 }}>
            Authors
          </h2>
        </motion.div>

        {/* Author names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-8"
        >
          {authors.map((author) => (
            <span key={author.name} className={`text-base ${author.highlight ? 'text-yellow-300' : 'text-slate-200'}`}>
              {author.name}
              <sup className="text-xs text-slate-400 ml-0.5">{author.sup}</sup>
              {author.highlight && <sup className="text-yellow-400 text-xs ml-0.5"> ✉</sup>}
            </span>
          ))}
        </motion.div>

        {/* Affiliations */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6 text-sm text-slate-400"
        >
          {affiliations.map((aff) => (
            <span key={aff.num}>
              <sup className="text-slate-500 mr-0.5">{aff.num}</sup>{aff.name}
            </span>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-10 text-xs text-slate-500"
        >
          <span><sup>*</sup> Equal contribution</span>
          <span><sup>†</sup> Project lead</span>
          <span><sup>✉</sup> Corresponding author</span>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href="https://arxiv.org/abs/2602.06159"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            arXiv Paper
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Code (Coming Soon)
          </a>
        </motion.div>
      </div>
    </section>
  );
}
