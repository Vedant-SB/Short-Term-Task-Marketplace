declare module "@/components/landing/Nav" {
  export const Nav: () => JSX.Element;
}
declare module "@/components/landing/Hero" {
  export const Hero: () => JSX.Element;
}
declare module "@/components/landing/OpenTasks" {
  export const OpenTasks: () => JSX.Element;
}
declare module "@/components/landing/Process" {
  export const Process: () => JSX.Element;
}
declare module "@/components/landing/FinalCTA" {
  export const FinalCTA: () => JSX.Element;
}
declare module "@/components/landing/Footer" {
  export const Footer: () => JSX.Element;
}
declare module "@/components/landing/Logo" {
  export const Logo: () => JSX.Element;
}
declare module "@/components/landing/Section" {
  import type { ReactNode } from "react";
  export const Section: (props: { id?: string; className?: string; children: ReactNode }) => JSX.Element;
  export const Eyebrow: (props: { children: ReactNode }) => JSX.Element;
}