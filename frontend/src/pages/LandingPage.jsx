import { Nav } from "../components/landing/Nav";
import { Hero } from "../components/landing/Hero";
import { OpenTasks } from "../components/landing/OpenTasks";
import { Process } from "../components/landing/Process";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <OpenTasks />
      <Process />
      <FinalCTA />
      <Footer />
    </>
  );
}