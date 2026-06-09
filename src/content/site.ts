import type { LocalizedText } from "@/i18n/config";

export const CONTACT = {
  phone1: "0566633391",
  phone2: "0508050604",
  phoneIntl: "+966566633391",
  whatsapp: "966566633391",
  email: "info@edarah.sa",
  website: "edarah.sa",
  twitter: "Edarah_sa",
  instagram: "Edarah_sa",
  addressLine: { ar: "الرياض، المملكة العربية السعودية", en: "Riyadh, Kingdom of Saudi Arabia" } as LocalizedText,
};

export type NavLink = { href: string; label: LocalizedText };

export const NAV_LINKS: NavLink[] = [
  { href: "#about", label: { ar: "من نحن", en: "About" } },
  { href: "#services", label: { ar: "خدماتنا", en: "Services" } },
  { href: "#process", label: { ar: "مراحل العمل", en: "Process" } },
  { href: "#standards", label: { ar: "معاييرنا", en: "Standards" } },
  { href: "#reach", label: { ar: "نطاق التغطية", en: "Reach" } },
  { href: "#faq", label: { ar: "الأسئلة الشائعة", en: "FAQs" } },
  { href: "#contact", label: { ar: "تواصل معنا", en: "Contact" } },
];

export type Service = {
  id: string;
  icon: string;
  title: LocalizedText;
  desc: LocalizedText;
  items: LocalizedText[];
};

export const SERVICES: Service[] = [
  {
    id: "valuation",
    icon: "building2",
    title: { ar: "خدمات التقييم العقاري", en: "Real Estate Valuation" },
    desc: {
      ar: "تقييم دقيق لجميع أنواع الأصول العقارية وفق المعايير الدولية.",
      en: "Accurate valuation of every asset type per international standards.",
    },
    items: [
      { ar: "تقييم الأراضي بجميع أنواعها (سكنية، تجارية، صناعية، زراعية)", en: "Land of all types (residential, commercial, industrial, agricultural)" },
      { ar: "تقييم المباني (فلل، شقق، قصور، عمائر، فنادق، مجمعات)", en: "Buildings (villas, apartments, palaces, hotels, compounds)" },
      { ar: "المشاريع التطويرية والأبراج متعددة الاستخدام", en: "Development projects & mixed-use towers" },
      { ar: "المستودعات والمباني الاستثمارية", en: "Warehouses & investment properties" },
    ],
  },
  {
    id: "indicators",
    icon: "lineChart",
    title: { ar: "المؤشرات والبيانات العقارية", en: "Real Estate Data & Indicators" },
    desc: {
      ar: "تحليلات ومؤشرات سوقية تدعم قرارات الاستثمار.",
      en: "Market analytics and indicators that power investment decisions.",
    },
    items: [
      { ar: "تحليل العرض والطلب في السوق", en: "Market supply & demand analysis" },
      { ar: "متابعة معدلات الإيجارات وتكلفة البناء", en: "Rental rates & construction cost monitoring" },
      { ar: "إنتاج مؤشرات القوة الشرائية", en: "Purchasing-power indicators" },
      { ar: "إعداد قواعد بيانات تاريخية للقطاعات", en: "Historical sector databases" },
    ],
  },
  {
    id: "special",
    icon: "scale",
    title: { ar: "التقييمات الخاصة", en: "Specialized Valuations" },
    desc: {
      ar: "تقييمات لأغراض رسمية وقانونية ومالية.",
      en: "Valuations for official, legal, and financial purposes.",
    },
    items: [
      { ar: "التمويل والتأمين", en: "Financing & insurance" },
      { ar: "التقاضي والتحكيم", en: "Litigation & arbitration" },
      { ar: "التوريث والضرائب", en: "Inheritance & taxation" },
      { ar: "تقارير معتمدة لدى الجهات الرسمية", en: "Reports accepted by official entities" },
    ],
  },
  {
    id: "studies",
    icon: "clipboard",
    title: { ar: "الدراسات العقارية", en: "Real Estate Studies" },
    desc: {
      ar: "دراسات جدوى وتحليلات سوق متعمقة.",
      en: "Feasibility studies and deep market analysis.",
    },
    items: [
      { ar: "دراسة الجدوى الاقتصادية", en: "Economic feasibility studies" },
      { ar: "تحليل السوق والطلب المستقبلي", en: "Market & future demand analysis" },
      { ar: "دراسة أعلى وأفضل استخدام", en: "Highest & best use analysis" },
      { ar: "تحليل المحافظ العقارية للمؤسسات", en: "Institutional portfolio analysis" },
    ],
  },
  {
    id: "advisory",
    icon: "compass",
    title: { ar: "الاستشارات العقارية", en: "Real Estate Advisory" },
    desc: {
      ar: "إرشاد استراتيجي للمستثمرين والمطورين.",
      en: "Strategic guidance for investors and developers.",
    },
    items: [
      { ar: "نصائح استراتيجية للمستثمرين والمطورين", en: "Strategic advice for investors & developers" },
      { ar: "دعم قرارات البيع والشراء والتطوير", en: "Support for buy / sell / develop decisions" },
      { ar: "تحليل العائد المتوقع على الاستثمار", en: "Expected ROI analysis" },
    ],
  },
];

export const VALUES: { icon: string; title: LocalizedText; desc: LocalizedText }[] = [
  { icon: "badgeCheck", title: { ar: "المهنية", en: "Professionalism" }, desc: { ar: "كل تقرير شهادة رسمية تُبنى عليها قرارات كبيرة.", en: "Every report is a formal certificate behind major decisions." } },
  { icon: "eye", title: { ar: "الشفافية", en: "Transparency" }, desc: { ar: "نوضح كل خطوة ونشرح منهجيتنا بوضوح.", en: "We explain every step and our methodology clearly." } },
  { icon: "target", title: { ar: "الدقة والموثوقية", en: "Accuracy & Reliability" }, desc: { ar: "نعتمد على تحليل ميداني ومعادلات علمية.", en: "Grounded in field analysis and scientific models." } },
  { icon: "shieldCheck", title: { ar: "الاستقلالية", en: "Independence" }, desc: { ar: "موضوعية وحياد تام في كل تقرير.", en: "Full objectivity and neutrality in every report." } },
  { icon: "lock", title: { ar: "الخصوصية", en: "Confidentiality" }, desc: { ar: "نحمي معلومات عملائنا بسرّية تامة.", en: "We safeguard client information with full discretion." } },
];

export const PROCESS_STEPS: { n: string; title: LocalizedText; desc: LocalizedText }[] = [
  { n: "01", title: { ar: "التواصل وتحديد النطاق", en: "Contact & scope" }, desc: { ar: "نفهم الغرض من التقييم ونتفق على نطاق العمل والجدول الزمني.", en: "We define the purpose and agree on scope and timeline." } },
  { n: "02", title: { ar: "جمع البيانات", en: "Data gathering" }, desc: { ar: "جمع المستندات والسجلات القانونية والمعلومات المطلوبة.", en: "Collecting documents, legal records, and required data." } },
  { n: "03", title: { ar: "المعاينة الميدانية", en: "On-site inspection" }, desc: { ar: "زيارة العقار ومعاينته بواسطة خبراء معتمدين.", en: "On-site inspection by certified experts." } },
  { n: "04", title: { ar: "التحليل والمنهجية", en: "Analysis & methodology" }, desc: { ar: "تحليل السوق وتطبيق منهجية التقييم المناسبة.", en: "Market analysis and the right valuation methodology." } },
  { n: "05", title: { ar: "إعداد التقرير", en: "Report preparation" }, desc: { ar: "إعداد تقرير مفصل ومتكامل وفق المعايير.", en: "Preparing a detailed, standards-compliant report." } },
  { n: "06", title: { ar: "التسليم والاعتماد", en: "Delivery & sign-off" }, desc: { ar: "تسليم التقرير النهائي موقّعًا ومعتمدًا.", en: "Final report delivered, signed, and certified." } },
];

export const STANDARDS: { abbr: string; title: LocalizedText; desc: LocalizedText }[] = [
  { abbr: "TAQEEM", title: { ar: "الهيئة السعودية للمقيّمين", en: "Saudi Authority (TAQEEM)" }, desc: { ar: "اعتماد رسمي من الهيئة السعودية للمقيّمين العقاريين.", en: "Official accreditation by the Saudi Authority for Accredited Valuers." } },
  { abbr: "IVS", title: { ar: "معايير التقييم الدولية", en: "Int'l Valuation Standards" }, desc: { ar: "تطبيق المعايير الدولية (IVS) في جميع التقارير.", en: "IVS applied across all our reports." } },
  { abbr: "IVSC", title: { ar: "مجلس معايير التقييم", en: "Valuation Standards Council" }, desc: { ar: "التزام بأطر مجلس معايير التقييم الدولي.", en: "Aligned with the international valuation standards council." } },
  { abbr: "RICS", title: { ar: "المعهد الملكي للمساحين", en: "Royal Institution (RICS)" }, desc: { ar: "ممارسات متوافقة مع أفضل المعايير العالمية.", en: "Practices aligned with leading global standards." } },
];

export const STATS: { value: string; label: LocalizedText }[] = [
  { value: "+100,000", label: { ar: "ساعة عمل موثّقة", en: "Documented work hours" } },
  { value: "+100", label: { ar: "جهة تعاملت معنا", en: "Institutional clients" } },
  { value: "2012", label: { ar: "عام التأسيس", en: "Founded" } },
  { value: "6+", label: { ar: "دول نخدمها", en: "Countries served" } },
];

export const METHOD_CARDS: { key: string; title: LocalizedText; desc: LocalizedText }[] = [
  { key: "market", title: { ar: "أسلوب السوق (المقارنة)", en: "Market (Comparison)" }, desc: { ar: "مقارنة العقار بعقارات مماثلة في نفس المنطقة والتوقيت.", en: "Compare with similar assets in the same area and time." } },
  { key: "cost", title: { ar: "أسلوب التكلفة", en: "Cost Approach" }, desc: { ar: "تكلفة إعادة البناء بنفس المواصفات مطروحًا منها الإهلاك.", en: "Rebuild cost at current specs, minus depreciation." } },
  { key: "income", title: { ar: "أسلوب الدخل", en: "Income Approach" }, desc: { ar: "القيمة الحالية للدخل المتوقع — للعقارات الاستثمارية.", en: "Present value of expected income — for income assets." } },
];

export const VALUED_TYPES: LocalizedText[] = [
  { ar: "الأراضي بجميع تصنيفاتها", en: "Land of all classifications" },
  { ar: "الفلل والقصور والمجمعات السكنية", en: "Villas, palaces & residential compounds" },
  { ar: "الأبراج التجارية والسكنية", en: "Commercial & residential towers" },
  { ar: "المشاريع العقارية قيد التطوير", en: "Projects under development" },
  { ar: "المستودعات والمرافق الصناعية", en: "Warehouses & industrial facilities" },
  { ar: "المباني متعددة الاستخدام", en: "Mixed-use buildings" },
  { ar: "صناديق الاستثمار العقاري", en: "Real estate investment funds" },
];

export const REACH = {
  domestic: { ar: "جميع مناطق المملكة العربية السعودية", en: "All regions of Saudi Arabia" } as LocalizedText,
  international: [
    { ar: "الإمارات", en: "UAE" },
    { ar: "الكويت", en: "Kuwait" },
    { ar: "البحرين", en: "Bahrain" },
    { ar: "تركيا", en: "Turkey" },
    { ar: "دول أوروبية مختارة", en: "Selected European countries" },
  ] as LocalizedText[],
};

export const TEAM: { name: LocalizedText; role: LocalizedText; note: LocalizedText }[] = [
  {
    name: { ar: "سعود الدهمشي", en: "Saud Al-Dahmshi" },
    role: { ar: "الرئيس التنفيذي", en: "Chief Executive" },
    note: { ar: "خبرة تفوق 20 عامًا في سوق العقار وإدارة المشاريع العقارية.", en: "20+ years in real estate and project management." },
  },
  {
    name: { ar: "عمر بك", en: "Omar Beck" },
    role: { ar: "مدير الاستراتيجية والتطوير", en: "Strategy & Development Director" },
    note: { ar: "خبرة دولية وتعليم تنفيذي من INSEAD.", en: "International expertise; executive education from INSEAD." },
  },
];

export const PARTNERS: LocalizedText[] = [
  { ar: "شركة دلتا السعودية لمشاريع الطاقة", en: "Delta Saudi Energy Projects" },
  { ar: "شركة منصات العقارية", en: "Manassat Real Estate" },
  { ar: "مجموعة الزامل العقارية", en: "Al-Zamil Real Estate Group" },
  { ar: "أحمد محمد السيف وأولاده", en: "Ahmed M. Al-Saif & Sons" },
  { ar: "شركة زوايا العقارية", en: "Zawaya Real Estate" },
  { ar: "الراجحي للتطوير", en: "Al-Rajhi Development" },
  { ar: "عبد الحميد الزامل وشريكه العقارية", en: "Abdulhamid Al-Zamil & Partner" },
  { ar: "التعاونية للتأمين", en: "Tawuniya Insurance" },
  { ar: "ثروات للأوراق المالية", en: "Tharawat Securities" },
  { ar: "بن سعيدان للخدمات العقارية", en: "Bin Saidan Real Estate" },
  { ar: "إعمار المتقدمة", en: "Emaar Advanced" },
  { ar: "نهاز للاستثمار التجاري", en: "Nahaz Commercial Investment" },
  { ar: "اللجين المعمارية للتطوير", en: "Allujain Architectural Dev." },
  { ar: "فيريلي آند ميتشل", en: "Verily & Mitchell" },
];

export const FAQS: { q: LocalizedText; a: LocalizedText }[] = [
  {
    q: { ar: "كم يستغرق إنجاز تقرير التقييم؟", en: "How long does a valuation take?" },
    a: { ar: "يعتمد على نوع العقار ونطاق العمل، ويتم الاتفاق على جدول زمني واضح مسبقًا. تتيح لك المنصة متابعة كل مرحلة لحظيًا.", en: "It depends on the property type and scope; a clear timeline is agreed upfront. The portal lets you track every stage in real time." },
  },
  {
    q: { ar: "هل تقاريركم معتمدة رسميًا؟", en: "Are your reports officially accredited?" },
    a: { ar: "نعم، جميع تقاريرنا معتمدة من الهيئة السعودية للمقيّمين العقاريين (تقييم) ومتوافقة مع معايير التقييم الدولية (IVS).", en: "Yes — all reports are accredited by TAQEEM and comply with International Valuation Standards (IVS)." },
  },
  {
    q: { ar: "ما المستندات المطلوبة لبدء التقييم؟", en: "What documents are needed to start?" },
    a: { ar: "عادةً صك الملكية والمخطط والصور والتراخيص ذات الصلة. يمكنك رفعها مباشرةً عبر المنصة عند إنشاء الطلب.", en: "Typically the title deed, site plan, photos, and relevant licenses — uploadable directly when you create a request." },
  },
  {
    q: { ar: "هل تخدمون خارج المملكة؟", en: "Do you operate outside Saudi Arabia?" },
    a: { ar: "نعم، نخدم عملاءنا في الإمارات والكويت والبحرين وتركيا ودول أوروبية مختارة.", en: "Yes — we serve clients in the UAE, Kuwait, Bahrain, Turkey, and selected European countries." },
  },
  {
    q: { ar: "كيف أطلب تقييمًا؟", en: "How do I request a valuation?" },
    a: { ar: "أنشئ حسابًا، ثم قدّم طلبًا يحدد نوع العقار والغرض والموقع، وارفع المستندات. سيتولى فريقنا الباقي مع إشعارات بكل تحديث.", en: "Create an account, submit a request with the property type, purpose, and location, and upload documents. Our team handles the rest — with a notification at every update." },
  },
];

export const PROPERTY_TYPE_QUICK: LocalizedText[] = [
  { ar: "أرض", en: "Land" },
  { ar: "فيلا", en: "Villa" },
  { ar: "شقة", en: "Apartment" },
  { ar: "عمارة", en: "Building" },
  { ar: "برج تجاري", en: "Commercial tower" },
  { ar: "مستودع", en: "Warehouse" },
  { ar: "مشروع تطويري", en: "Development project" },
  { ar: "أخرى", en: "Other" },
];
