import { motion } from "framer-motion";
import {
  ClipboardList,
  Send,
  UserCheck,
  Hammer,
  Upload,
  CheckCircle,
  Award,
} from "lucide-react";
import { Section, Eyebrow } from "./Section";

const steps = [
  {
    icon: ClipboardList,
    title: "Post Task",
    body: "Company creates a short-term task.",
    accent: "var(--primary)",
  },
  {
    icon: Send,
    title: "Apply",
    body: "Students, freelancers and professionals apply.",
    accent: "var(--accent)",
  },
  {
    icon: UserCheck,
    title: "Select",
    body: "Company reviews applicants and accepts one candidate.",
    accent: "var(--sky)",
  },
  {
    icon: Hammer,
    title: "Work",
    body: "Selected individual completes the work.",
    accent: "var(--primary)",
  },
  {
    icon: Upload,
    title: "Submit",
    body: "Completed work is uploaded.",
    accent: "var(--gold)",
  },
  {
    icon: CheckCircle,
    title: "Review",
    body: "Company approves the work or requests revisions.",
    accent: "var(--accent)",
  },
  {
    icon: Award,
    title: "Portfolio",
    body: "Both users exchange reviews and the completed task becomes part of the individual's portfolio.",
    accent: "var(--sky)",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="relative bg-surface py-24 border-y border-border overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="max-w-2xl">
          <Eyebrow>How It Works</Eyebrow>
          <h2 className="mt-3 font-display text-3xl md:text-5xl text-ink text-balance">
            From posting to portfolio, in one workflow.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Every task follows a structured path — ensuring clarity for companies and a smooth experience for individuals at every stage.
          </p>
        </div>

        {/* ── Desktop horizontal timeline ─────────────────────────── */}
        <div className="hidden lg:block mt-16">
          {/* Connecting line */}
          <div className="relative mx-8">
            <div className="absolute top-[28px] left-0 right-0 h-px bg-border" />
            <div className="grid grid-cols-7 gap-0">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative flex flex-col items-center text-center group"
                  >
                    {/* Node */}
                    <motion.div
                      whileHover={{ scale: 1.12, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="relative z-10 h-14 w-14 rounded-2xl border border-border bg-card flex items-center justify-center shadow-elegant"
                    >
                      <Icon
                        className="h-5 w-5 transition-colors duration-200"
                        style={{ color: step.accent }}
                        strokeWidth={1.8}
                      />
                    </motion.div>

                    {/* Content */}
                    <h3 className="mt-5 font-display text-sm text-ink">{step.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground max-w-[140px]">
                      {step.body}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile / Tablet vertical timeline ───────────────────── */}
        <div className="lg:hidden mt-14">
          <div className="relative pl-10">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative flex gap-5 ${i < steps.length - 1 ? "pb-10" : ""}`}
                >
                  {/* Node */}
                  <div className="absolute -left-10 top-0 z-10 h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center shadow-elegant flex-shrink-0">
                    <Icon
                      className="h-4 w-4"
                      style={{ color: step.accent }}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <h3 className="font-display text-base text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
