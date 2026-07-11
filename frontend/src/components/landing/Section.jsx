import { motion } from "framer-motion";

export function Section({ id, className = "", children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function Eyebrow({ children }) {
  return <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}