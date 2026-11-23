import type { BrandIconKey } from "./brand-icons";
import type { Lang } from "./i18n";

/**
 * Tools listed on the Resources page.
 *
 * To add one, append an entry to `RESOURCES`:
 * - `logo` is a supplied logo in `public/resources/logos/` (160x160 PNG). When set,
 *   it is used as-is.
 * - Otherwise `domain` is used to load the site's own icon in the visitor's browser.
 * - `icon` is the offline fallback: a simple-icons glyph from `brand-icons.ts`.
 *   Without one, the fallback is a monogram tile in `color`.
 * Categories become the filter chips, in the order they first appear.
 */
export type Resource = {
  name: string;
  url: string;
  domain: string;
  maker: string;
  category: string;
  description: string;
  /** Romanian and Russian descriptions; `description` is the English one. */
  tr: { ro: string; ru: string };
  logo?: string;
  icon?: BrandIconKey;
  color: string;
};

export const RESOURCES: Resource[] = [
  {
    name: "ChatGPT",
    tr: { ro: "Asistent AI universal pentru postări și emailuri, idei noi, rezumate de documente și răspunsuri la întrebări de afaceri.", ru: "Универсальный ИИ-ассистент: посты и письма, новые идеи, краткие пересказы документов и ответы на деловые вопросы." },
    logo: "/resources/logos/chatgpt.png",
    url: "https://chatgpt.com/",
    domain: "chatgpt.com",
    maker: "OpenAI",
    category: "AI assistants",
    description:
      "General-purpose AI assistant for drafting posts and emails, brainstorming ideas, summarising documents and answering business questions.",
    color: "#10A37F",
  },
  {
    name: "ChatGPT Scheduled Tasks",
    tr: { ro: "Programează ChatGPT să ruleze o cerere periodic: rezumate zilnice de știri, idei săptămânale de conținut sau mementouri automate.", ru: "Запускайте запросы ChatGPT по расписанию: ежедневные сводки новостей, еженедельные идеи для контента или автоматические напоминания." },
    logo: "/resources/logos/chatgpt.png",
    url: "https://chatgpt.com/scheduled",
    domain: "chatgpt.com",
    maker: "OpenAI",
    category: "AI assistants",
    description:
      "Have ChatGPT run a prompt on a schedule: daily news digests, weekly content ideas or reminders delivered automatically.",
    color: "#10A37F",
  },
  {
    name: "Claude",
    tr: { ro: "Asistent AI pentru scris, analiză și cercetare. Puternic cu documente lungi, raționament atent și crearea de instrumente sau pagini mici.", ru: "ИИ-ассистент для текстов, анализа и исследований. Силён в длинных документах, вдумчивых рассуждениях и создании небольших инструментов и страниц." },
    url: "https://claude.ai",
    domain: "claude.ai",
    maker: "Anthropic",
    category: "AI assistants",
    description:
      "AI assistant for writing, analysis and research. Strong with long documents, careful reasoning and building small tools or pages.",
    icon: "claude",
    color: "#D97757",
  },
  {
    name: "Perplexity",
    tr: { ro: "Motor de răspunsuri AI care caută pe web și își citează sursele. Bun pentru cercetare rapidă de piață și concurență, ușor de verificat.", ru: "ИИ-поисковик, который ищет в интернете и указывает источники. Удобен для быстрого и проверяемого анализа рынка и конкурентов." },
    url: "https://www.perplexity.ai/",
    domain: "perplexity.ai",
    maker: "Perplexity",
    category: "AI assistants",
    description:
      "AI answer engine that searches the web and cites its sources. Good for quick market and competitor research you can check.",
    icon: "perplexity",
    color: "#1FB8CD",
  },
  {
    name: "Canva",
    tr: { ro: "Creează postări, flyere, prezentări, logouri și videoclipuri scurte din mii de șabloane, cu instrumente AI integrate.", ru: "Создавайте посты, флаеры, презентации, логотипы и короткие видео из тысяч шаблонов со встроенными ИИ-инструментами." },
    logo: "/resources/logos/canva.png",
    url: "https://www.canva.com/",
    domain: "canva.com",
    maker: "Canva",
    category: "Design & content",
    description:
      "Design social posts, flyers, presentations, logos and short videos from thousands of templates, with built-in AI tools.",
    color: "#00C4CC",
  },
  {
    name: "Gamma",
    tr: { ro: "Transformă o schiță sau o cerere într-o prezentare, un document sau un site de o pagină în câteva minute, cu AI.", ru: "Превращайте план или запрос в готовую презентацию, документ или одностраничный сайт за несколько минут с помощью ИИ." },
    logo: "/resources/logos/gamma.png",
    url: "https://gamma.app/",
    domain: "gamma.app",
    maker: "Gamma",
    category: "Design & content",
    description:
      "Turn an outline or prompt into a polished presentation, document or one-page website in minutes with AI.",
    color: "#6A3BE4",
  },
  {
    name: "Nano Banana",
    tr: { ro: "Modelul de imagini Gemini de la Google pentru a genera și edita imagini din text: fotografii de produs, fundaluri și editări rapide.", ru: "Модель изображений Gemini от Google: создание и редактирование картинок по тексту — фото товаров, фоны и быстрые правки." },
    logo: "/resources/logos/nano-banana.png",
    url: "https://aistudio.google.com/models/nano-banana",
    domain: "aistudio.google.com",
    maker: "Google AI Studio",
    category: "Design & content",
    description:
      "Google's Gemini image model for generating and editing images from text: product shots, backgrounds and quick visual edits.",
    icon: "googlegemini",
    color: "#8E75B2",
  },
  {
    name: "Pexels",
    tr: { ro: "Fotografii și videoclipuri gratuite pe care le poți folosi în postări, reclame și site-uri fără să plătești licență.", ru: "Бесплатные фото и видео для постов, рекламы и сайтов без оплаты лицензии." },
    url: "https://pexels.com",
    domain: "pexels.com",
    maker: "Pexels",
    category: "Design & content",
    description: "Free stock photos and videos you can use in posts, ads and websites without paying for a licence.",
    icon: "pexels",
    color: "#05A081",
  },
  {
    name: "CapCut",
    tr: { ro: "Editor video pentru Reels și TikTok cu șabloane, subtitrări automate, efecte și eliminarea fundalului, pe telefon sau calculator.", ru: "Видеоредактор для Reels и TikTok: шаблоны, автосубтитры, эффекты и удаление фона — на телефоне или компьютере." },
    logo: "/resources/logos/capcut.png",
    url: "https://www.capcut.com/",
    domain: "capcut.com",
    maker: "CapCut",
    category: "Video & audio",
    description:
      "Video editor for Reels and TikToks with templates, auto-captions, effects and background removal, on phone or desktop.",
    color: "#000000",
  },
  {
    name: "Google Flow",
    tr: { ro: "Instrument AI de filmare bazat pe modelele Veo de la Google. Generează clipuri și scene video din text și imagini.", ru: "ИИ-инструмент для видеосъёмки на моделях Veo от Google. Создаёт видеоклипы и сцены по тексту и изображениям." },
    logo: "/resources/logos/google-flow.png",
    url: "https://flow.google.com/",
    domain: "labs.google",
    maker: "Google Labs",
    category: "Video & audio",
    description:
      "AI filmmaking tool built on Google's Veo models. Generate video clips and scenes from text prompts and images.",
    icon: "google",
    color: "#4285F4",
  },
  {
    name: "ElevenLabs",
    tr: { ro: "Voci AI realiste pentru voiceover, reclame și videoclipuri: text în vorbire, clonarea vocii și dublaj în alte limbi.", ru: "Реалистичные ИИ-голоса для озвучки, рекламы и видео: синтез речи, клонирование голоса и дубляж на другие языки." },
    url: "https://elevenlabs.io/",
    domain: "elevenlabs.io",
    maker: "ElevenLabs",
    category: "Video & audio",
    description:
      "Realistic AI voices for voiceovers, ads and videos: text to speech, voice cloning and dubbing into other languages.",
    icon: "elevenlabs",
    color: "#000000",
  },
  {
    name: "Epidemic Sound",
    tr: { ro: "Muzică și efecte sonore licențiate pentru videoclipuri și rețele sociale, ca să nu-ți fie conținutul blocat pentru drepturi de autor.", ru: "Лицензионная музыка и звуковые эффекты для видео и соцсетей, чтобы контент не заглушали и не удаляли из-за авторских прав." },
    url: "https://epidemicsound.com",
    domain: "epidemicsound.com",
    maker: "Epidemic Sound",
    category: "Video & audio",
    description:
      "Licensed music and sound effects for videos and social media, so your content isn't muted or taken down for copyright.",
    color: "#000000",
  },
  {
    name: "Meta Business Suite",
    tr: { ro: "Gestionează Facebook și Instagram într-un singur loc: programează postări, răspunde la mesaje și vezi cum performează conținutul.", ru: "Управляйте Facebook и Instagram в одном месте: планируйте публикации, отвечайте на сообщения и смотрите статистику контента." },
    url: "https://creators.facebook.com/tools/meta-business-suite/",
    domain: "business.facebook.com",
    maker: "Meta",
    category: "Social media & ads",
    description:
      "Manage your Facebook and Instagram in one place: schedule posts, answer messages and see how your content performs.",
    icon: "meta",
    color: "#0467DF",
  },
  {
    name: "Meta Ad Library",
    tr: { ro: "Caută orice reclamă activă pe Facebook și Instagram. Vezi ce promovează concurenții și cum își formulează mesajele.", ru: "Ищите любую активную рекламу в Facebook и Instagram. Смотрите, что рекламируют конкуренты и как они это формулируют." },
    url: "https://www.facebook.com/ads/library/",
    domain: "facebook.com",
    maker: "Meta",
    category: "Social media & ads",
    description:
      "Search every ad currently running on Facebook and Instagram. See what competitors advertise and how they word it.",
    icon: "facebook",
    color: "#0866FF",
  },
  {
    name: "ManyChat",
    tr: { ro: "Automatizează mesajele pe Instagram, Messenger și WhatsApp: răspunsuri automate la comentarii, colectarea de clienți potențiali și răspunsuri la întrebări frecvente.", ru: "Автоматизируйте сообщения в Instagram, Messenger и WhatsApp: автоответы на комментарии, сбор заявок и ответы на частые вопросы." },
    logo: "/resources/logos/manychat.png",
    url: "https://get.manychat.com/",
    domain: "manychat.com",
    maker: "ManyChat",
    category: "Social media & ads",
    description:
      "Automate Instagram DMs, Messenger and WhatsApp: auto-reply to comments, capture leads and answer common questions.",
    color: "#0084FF",
  },
  {
    name: "Apify",
    tr: { ro: "Instrumente gata făcute de extragere a datelor din Instagram, TikTok, Google Maps și altele. Adună postări, recenzii și liste de afaceri într-un tabel.", ru: "Готовые парсеры для Instagram, TikTok, Google Maps и других сайтов. Собирайте посты, отзывы и списки компаний в таблицу." },
    logo: "/resources/logos/apify.png",
    url: "https://console.apify.com/",
    domain: "apify.com",
    maker: "Apify",
    category: "Research & SEO",
    description:
      "Ready-made scrapers for Instagram, TikTok, Google Maps and more. Collect posts, reviews and business listings into a spreadsheet.",
    color: "#246DFF",
  },
  {
    name: "AnswerThePublic",
    tr: { ro: "Vezi întrebările și expresiile pe care oamenii le caută despre un subiect. Excelent pentru idei de conținut și pagini de întrebări frecvente.", ru: "Узнайте, какие вопросы и фразы люди ищут по теме. Отлично подходит для идей контента и страниц с частыми вопросами." },
    logo: "/resources/logos/answerthepublic.png",
    url: "https://answerthepublic.com/en",
    domain: "answerthepublic.com",
    maker: "NP Digital",
    category: "Research & SEO",
    description:
      "See the questions and phrases people search around a topic. Great for content ideas and FAQ pages.",
    color: "#2E2E5E",
  },
  {
    name: "Semrush",
    tr: { ro: "Cercetare SEO și a concurenței: volume de căutare, traficul rivalilor, reclamele lor și un audit al propriului site.", ru: "SEO и анализ конкурентов: объёмы запросов, трафик соперников, их реклама и аудит вашего сайта." },
    url: "https://www.semrush.com/",
    domain: "semrush.com",
    maker: "Semrush",
    category: "Research & SEO",
    description:
      "SEO and competitor research: keyword volumes, the traffic rivals get, the ads they run, and an audit of your own website.",
    icon: "semrush",
    color: "#FF642D",
  },
  {
    name: "Google Trends",
    tr: { ro: "Compară cum se schimbă interesul pentru o căutare în timp și pe țări. Util pentru sezonalitate și cerere.", ru: "Сравнивайте, как меняется интерес к запросу во времени и по странам. Полезно для оценки сезонности и спроса." },
    url: "https://trends.google.com/trends/",
    domain: "trends.google.com",
    maker: "Google",
    category: "Research & SEO",
    description:
      "Compare how interest in a search term changes over time and by country. Useful for spotting seasonality and demand.",
    icon: "google",
    color: "#4285F4",
  },
  {
    name: "Google Analytics",
    tr: { ro: "Analiză gratuită a site-ului: cine te vizitează, de unde vin vizitatorii și ce pagini îi transformă în clienți.", ru: "Бесплатная аналитика сайта: кто к вам заходит, откуда приходят посетители и какие страницы превращают их в клиентов." },
    url: "https://marketingplatform.google.com/about/analytics/",
    domain: "analytics.google.com",
    maker: "Google",
    category: "Research & SEO",
    description:
      "Free website analytics: who visits your site, where they come from, and which pages turn visitors into customers.",
    icon: "googleanalytics",
    color: "#E37400",
  },
  {
    name: "Value Proposition Generator",
    tr: { ro: "Instrument AI gratuit care redactează o propunere de valoare dintr-o scurtă descriere a clientului, a problemei lui și a produsului tău.", ru: "Бесплатный ИИ-инструмент, который составляет ценностное предложение по краткому описанию клиента, его проблемы и вашего продукта." },
    url: "https://ideabuddy.com/free-ai-tools/value-proposition-generator/",
    domain: "ideabuddy.com",
    maker: "IdeaBuddy",
    category: "Strategy & planning",
    description:
      "Free AI tool that drafts a value proposition from a short description of your customer, their problem and your product.",
    color: "#2563EB",
  },
  {
    name: "Trello",
    tr: { ro: "Panouri, liste și carduri simple pentru planificarea proiectelor, a calendarului de conținut și a sarcinilor echipei.", ru: "Простые доски, списки и карточки для планирования проектов, контент-календаря и задач команды." },
    url: "https://trello.com/",
    domain: "trello.com",
    maker: "Atlassian",
    category: "Productivity & automation",
    description:
      "Simple boards, lists and cards to plan projects, content calendars and team tasks, and see what's in progress at a glance.",
    icon: "trello",
    color: "#0052CC",
  },
  {
    name: "Mailchimp",
    tr: { ro: "Email marketing: construiește o listă de abonați, creează newslettere și configurează emailuri automate de bun venit și follow-up.", ru: "Email-маркетинг: собирайте базу подписчиков, делайте рассылки и настраивайте автоматические приветственные и повторные письма." },
    url: "https://mailchimp.com/",
    domain: "mailchimp.com",
    maker: "Intuit",
    category: "Productivity & automation",
    description:
      "Email marketing: build a subscriber list, design newsletters and set up automatic welcome and follow-up emails.",
    icon: "mailchimp",
    color: "#FFE01B",
  },
  {
    name: "Zapier",
    tr: { ro: "Conectează aplicațiile și automatizează munca repetitivă fără cod, de ex. trimite clienții noi din formulare direct într-un tabel și pe email.", ru: "Связывайте приложения и автоматизируйте рутину без кода, например отправляйте новые заявки из форм прямо в таблицу и на почту." },
    url: "https://zapier.com/",
    domain: "zapier.com",
    maker: "Zapier",
    category: "Productivity & automation",
    description:
      "Connect your apps and automate repetitive work without code, e.g. send new form leads straight to a sheet and your email.",
    icon: "zapier",
    color: "#FF4F00",
  },
];

export const describe = (r: Resource, lang: Lang) => (lang === "en" ? r.description : r.tr[lang]);

/** Category names per language. Keys are the English names used in RESOURCES. */
export const CATEGORY_TEXT: Record<string, { ro: string; ru: string }> = {
  "AI assistants": { ro: "Asistenți AI", ru: "ИИ-ассистенты" },
  "Design & content": { ro: "Design și conținut", ru: "Дизайн и контент" },
  "Video & audio": { ro: "Video și audio", ru: "Видео и аудио" },
  "Social media & ads": { ro: "Rețele sociale și reclame", ru: "Соцсети и реклама" },
  "Research & SEO": { ro: "Cercetare și SEO", ru: "Исследования и SEO" },
  "Strategy & planning": { ro: "Strategie și planificare", ru: "Стратегия и планирование" },
  "Productivity & automation": { ro: "Productivitate și automatizare", ru: "Продуктивность и автоматизация" },
};
export const categoryName = (c: string, lang: Lang) => (lang === "en" ? c : (CATEGORY_TEXT[c]?.[lang] ?? c));

/** Categories in first-seen order. */
export const CATEGORIES = [...new Set(RESOURCES.map((r) => r.category))];

export function hostOf(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/^www\./, "").replace(/\/$/, "");
  } catch {
    return url;
  }
}
