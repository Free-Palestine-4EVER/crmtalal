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
import { PenSignature } from "@/components/site/sections/PenSignature";
import { ParallaxShowcase } from "@/components/site/ParallaxShowcase";

export default function Home() {
  return (
    <SiteShell>
      <SiteNav />
      <main>
        <Hero />
        <PartnersMarquee />
        <Services />

        <ParallaxShowcase
          image="/images/parallax-1.jpg"
          fallback="linear-gradient(135deg, #14161d 0%, #3a0a19 55%, #72142f 100%)"
          eyebrow={{ ar: "مرجعية موثوقة", en: "A trusted benchmark" }}
          title={{
            ar: "نُقيّم ما يصنع ملامح المدن",
            en: "We value what shapes the skyline.",
          }}
          sub={{
            ar: "من الأرض الخام إلى الأبراج الشاهقة — نمنح كل أصل قيمته الحقيقية بثقةٍ تَصمد أمام أكبر القرارات.",
            en: "From raw land to soaring towers — we give every asset its true worth, with confidence that holds up to the biggest decisions.",
          }}
        />

        <Process />
        <PenSignature />

        <ParallaxShowcase
          image="/images/parallax-2.jpg"
          fallback="linear-gradient(135deg, #2a0712 0%, #5e1228 50%, #14161d 100%)"
          align="start"
          eyebrow={{ ar: "الدقة في كل تفصيل", en: "Precision in every detail" }}
          title={{
            ar: "كل رقم مُعايَن. كل تفصيل موثّق.",
            en: "Every figure inspected. Every detail documented.",
          }}
          sub={{
            ar: "معاينة ميدانية، تحليل سوقي، ومنهجية علمية — لا نترك شيئًا للصدفة.",
            en: "Field inspection, market analysis, and a scientific methodology — nothing left to chance.",
          }}
        />

        <Standards />
        <Reach />

        <ParallaxShowcase
          image="/images/parallax-3.jpg"
          fallback="linear-gradient(135deg, #0a0b0e 0%, #364655 55%, #72142f 100%)"
          eyebrow={{ ar: "حضور يتجاوز الحدود", en: "Reach beyond borders" }}
          title={{
            ar: "ثقة تعبر الحدود",
            en: "Trust that travels beyond borders.",
          }}
          sub={{
            ar: "من المملكة إلى الخليج وتركيا وأوروبا المختارة — نخدم عملاءنا أينما كانت أصولهم.",
            en: "From the Kingdom to the Gulf, Türkiye, and selected Europe — we serve our clients wherever their assets are.",
          }}
        />

        <Faq />
        <ContactStrip />
        <CtaBand />
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
