import { Section } from "./Section";

export function FinalCTA() {
  return (
    <Section id="cta" className="relative py-20 bg-surface">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-primary text-primary-foreground p-12 md:p-16 shadow-lift">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(600px 400px at 10% 10%, color-mix(in oklch, var(--accent) 45%, transparent), transparent 55%), radial-gradient(600px 400px at 90% 90%, color-mix(in oklch, var(--gold) 30%, transparent), transparent 55%)",
            }}
          />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Get started</p>
              <h2 className="mt-4 font-display text-3xl md:text-5xl leading-[1.05] text-balance">
                Ready to start your next task?
              </h2>
              <p className="mt-4 max-w-lg text-primary-foreground/75">
                Whether you're looking for the right person or the right opportunity, TaskHub provides a structured way to collaborate from start to finish.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/tasks" className="inline-flex items-center gap-2 rounded-full bg-background text-ink px-5 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5">
                Browse Tasks
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h11m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                Post a Task
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}