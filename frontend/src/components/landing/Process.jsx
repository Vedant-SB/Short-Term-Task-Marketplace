import { motion } from "framer-motion";
import { Section, Eyebrow } from "./Section";

const cards = [
  {
    kicker: "Speed",
    title: "Hiring for short-term work shouldn't take weeks.",
    body: "Companies often need work completed within days, but traditional hiring is slow and unnecessary for short-term tasks. TaskHub simplifies the process from posting a task to selecting the right candidate.",
    accent: "linear-gradient(135deg, var(--primary), var(--accent))",
  },
  {
    kicker: "Structure",
    title: "Short-term work needs a structured process.",
    body: "Applications, deadlines, submissions, revisions, and reviews should all happen in one place — not across scattered messages and tools.",
    accent: "linear-gradient(135deg, var(--sky), var(--accent))",
  },
  {
    kicker: "Value",
    title: "Short-term work should create long-term value.",
    body: "Students gain industry exposure, professionals explore side projects, and freelancers earn additional income — while every completed task strengthens their portfolio.",
    accent: "linear-gradient(135deg, var(--gold), var(--sky))",
  },
];

export function Process() {
  return (
    <Section id="process" className="relative bg-canvas py-24 overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-25" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <Eyebrow>Why TaskHub</Eyebrow>
          <h2 className="mt-3 font-display text-3xl md:text-5xl text-ink text-balance">
            Short-term work deserves a better process.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Traditional hiring and freelance platforms aren't designed for short-term collaboration. TaskHub simplifies the entire journey — from finding the right person to completing the work and building long-term value.
          </p>
        </div>
        <div id="why" className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <motion.article
              key={c.kicker}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative rounded-3xl border border-border bg-card p-8 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">0{i + 1} · {c.kicker}</span>
                <span className="h-8 w-8 rounded-full" style={{ background: c.accent }} />
              </div>
              <h3 className="mt-8 font-display text-2xl leading-snug text-ink text-balance">{c.title}</h3>
              <p className="mt-3 text-muted-foreground text-[15px] leading-relaxed">{c.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}