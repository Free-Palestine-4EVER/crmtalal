import { SiteShell } from "@/components/site/SiteShell";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/site/sections/Hero";
import { Services } from "@/components/site/sections/Services";
import { Process } from "@/components/site/sections/Process";
import { Standards } from "@/components/site/sections/Standards";
import { PartnersMarquee } from "@/components/site/sections/PartnersMarquee";
import { Reach } from "@/components/site/sections/Reach";
import { Faq } from "@/components/site/sections/Faq";
import { ContactStrip } from "@/components/site/sections/ContactStrip";
import { CtaBand } from "@/components/site/sections/CtaBand";

export default function Home() {
  return (
    <SiteShell>
      <SiteNav />
      <main>
        <Hero />
        <PartnersMarquee />
        <Services />
        <Process />
        <Standards />
        <Reach />
        <Faq />
        <ContactStrip />
        <CtaBand />
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
