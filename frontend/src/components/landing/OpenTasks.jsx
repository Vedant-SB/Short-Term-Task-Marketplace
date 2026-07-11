import { motion } from "framer-motion";
import { Section, Eyebrow } from "./Section";

const tasks = [
  {
    tag: "Design",
    title: "Rebrand for a Series-A fintech",
    budget: "$3,200",
    duration: "5 days",
    skills: ["Brand", "Figma", "Logo"],
    apps: 24,
    accent: "var(--accent)",
  },
  {
    tag: "Engineering",
    title: "Ship a Stripe billing integration",
    budget: "$2,800",
    duration: "4 days",
    skills: ["Node.js", "Stripe", "React"],
    apps: 18,
    accent: "var(--primary)",
  },
  {
    tag: "Research",
    title: "12 user interviews & synthesis",
    budget: "$2,400",
    duration: "6 days",
    skills: ["UX Research", "Notion"],
    apps: 31,
    accent: "var(--sky)",
  },
  {
    tag: "Content",
    title: "Launch site copy, end to end",
    budget: "$1,600",
    duration: "3 days",
    skills: ["Copywriting", "SEO"],
    apps: 42,
    accent: "var(--gold)",
  },
];

export function OpenTasks() {
  return (
    <Section id="tasks" className="relative bg-surface py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <Eyebrow>Live on TaskHub</Eyebrow>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-ink text-balance">Open Tasks</h2>
          </div>
          <a href="/tasks" className="text-sm font-medium text-ink border-b border-ink/20 pb-0.5 hover:border-accent hover:text-accent transition-colors">
            Browse All Tasks →
          </a>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tasks.map((t, i) => (
            <motion.article
              key={t.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.accent }} />
                  {t.tag}
                </span>
                <span className="text-[11px] text-muted-foreground">{t.duration}</span>
              </div>
              <h3 className="mt-5 font-display text-lg leading-snug text-ink text-balance">{t.title}</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.skills.map((s) => (
                  <span key={s} className="text-[10.5px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">{s}</span>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-border flex items-end justify-between">
                <div>
                  <p className="font-display text-xl text-ink">{t.budget}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">fixed price</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-ink">{t.apps}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">applications</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}