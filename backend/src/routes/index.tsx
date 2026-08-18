import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DemoStrip } from "@/components/landing/DemoStrip";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { useLenis } from "@/hooks/useLenis";

const TITLE = "RepoVibe — Repository health scores from live GitHub data";
const DESCRIPTION =
  "Score any public GitHub repository on commit rhythm, bus factor, issue staleness and PR merge speed — with live data, in seconds.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useLenis();

  const launch = (repo?: string) => {
    navigate({ to: "/analyze", search: repo ? { repo } : {} });
  };

  return (
    <main className="relative overflow-hidden">
      <Navbar onLaunch={() => launch()} onSignIn={() => navigate({ to: "/auth" })} />
      <Hero onLaunch={launch} />
      <SocialProof onLaunch={launch} />
      <Features />
      <HowItWorks />
      <DemoStrip />
      <FinalCTA onLaunch={launch} />
      <Footer />
    </main>
  );
}
