import { motion } from "framer-motion";
import heroEcosystem from "../../assets/hero-ecosystem.jpg";
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div initial="hidden" animate="show" className="lg:col-span-6">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              The marketplace for short-term tasks
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mt-5 font-display text-[46px] md:text-[62px] leading-[1.02] text-ink text-balance">
              Short-term tasks. <em className="not-italic text-accent">Managed</em> from posting to completion.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-5 max-w-xl text-lg text-muted-foreground">
              Whether you're posting a task or applying for one, TaskHub brings applications, candidate selection, deadlines, submissions, reviews, and portfolio building together in one structured workflow.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#tasks" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5">
                Browse Tasks
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h11m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#cta" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface">
                Post a Task
              </a>
            </motion.div>
            <motion.dl variants={fadeUp} custom={4} className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["12k+", "verified talent"],
                ["3–7", "day sprints"],
                ["98%", "on-time"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl text-ink">{n}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-[28px] overflow-hidden shadow-lift bg-card border border-border">
              <img
                src={heroEcosystem}
                alt="A company posts a task; students, freelancers, and professionals apply; a candidate is selected, the task is completed, and portfolios update"
                width={1200}
                height={1408}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}