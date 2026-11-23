import { Calculator, CalendarDays, LayoutGrid, PenLine, type LucideIcon } from "lucide-react";
import type { Lang } from "./i18n";

/**
 * Every tool the hub offers. The dashboard cards, the header navigation and
 * the per-tool pages all read from this list, so a new tool is added here once.
 *
 * `kind: "native"` tools are React pages in this app. `kind: "embedded"` tools
 * are standalone HTML apps served from `public/tools/` and shown in a
 * same-origin frame, so their code runs unchanged.
 *
 * `text` holds the visible copy per language; English is required.
 */
export type ToolText = {
  name: string;
  short: string;
  tagline: string;
  description: string;
  features: string[];
};

export type Tool = {
  slug: string;
  href: string;
  icon: LucideIcon;
  category: Record<Lang, string>;
  kind: "native" | "embedded";
  /** For embedded tools: the standalone file, also usable in its own tab. */
  src?: string;
  text: Record<Lang, ToolText>;
};

export const TOOLS: Tool[] = [
  {
    slug: "canvas",
    href: "/canvas",
    icon: LayoutGrid,
    category: { en: "Strategy", ro: "Strategie", ru: "Стратегия" },
    kind: "native",
    text: {
      en: {
        name: "Canvas Lab",
        short: "Canvas Lab",
        tagline: "Business Model Canvas with a live feasibility score",
        description:
          "Map your business on the nine-block canvas, watch the feasibility score update as you type, and run an AI diagnostic that flags weak assumptions and missing inputs.",
        features: [
          "Guided prompts and worked examples for all nine blocks",
          "Live score for audience fit, pricing and differentiation",
          "AI block-by-block diagnostic and missing-input scan",
          "Export as a PNG image or copy as Markdown",
        ],
      },
      ro: {
        name: "Canvas Lab",
        short: "Canvas Lab",
        tagline: "Business Model Canvas cu scor de fezabilitate în timp real",
        description:
          "Descrie-ți afacerea pe canvasul cu nouă blocuri, urmărește cum se actualizează scorul de fezabilitate și rulează un diagnostic AI care semnalează ipotezele slabe și datele lipsă.",
        features: [
          "Întrebări ghidate și exemple pentru toate cele nouă blocuri",
          "Scor live pentru publicul țintă, preț și diferențiere",
          "Diagnostic AI pe fiecare bloc și căutarea datelor lipsă",
          "Export ca imagine PNG sau copiere în Markdown",
        ],
      },
      ru: {
        name: "Canvas Lab",
        short: "Canvas Lab",
        tagline: "Бизнес-модель Canvas с оценкой реализуемости в реальном времени",
        description:
          "Опишите бизнес на канвасе из девяти блоков, следите, как обновляется оценка реализуемости, и запустите ИИ-диагностику, которая находит слабые допущения и недостающие данные.",
        features: [
          "Подсказки и примеры для всех девяти блоков",
          "Живая оценка: аудитория, цена и отличие от конкурентов",
          "ИИ-диагностика по блокам и поиск недостающих данных",
          "Экспорт в PNG или копирование в Markdown",
        ],
      },
    },
  },
  {
    slug: "price-builder",
    href: "/price-builder",
    icon: Calculator,
    category: { en: "Finance", ro: "Finanțe", ru: "Финансы" },
    kind: "embedded",
    src: "/tools/price-builder.html",
    text: {
      en: {
        name: "Price Builder",
        short: "Price Builder",
        tagline: "Set a price that covers delivery, ads and profit",
        description:
          "Enter fulfilment costs, customer acquisition costs and a target margin. The recommended price updates instantly, with a breakdown and a reality check.",
        features: [
          "Fulfilment, CAC and profit built into one price",
          "CAC from cost per click, leads and paying customers",
          "Price breakdown chart and reality check",
          "Download the full model as an Excel workbook",
        ],
      },
      ro: {
        name: "Constructor de preț",
        short: "Preț",
        tagline: "Un preț care acoperă livrarea, reclamele și profitul",
        description:
          "Introdu costurile de livrare, costul de atragere a clienților și marja dorită. Prețul recomandat se actualizează instantaneu, cu o defalcare și o verificare realistă.",
        features: [
          "Livrare, CAC și profit într-un singur preț",
          "CAC calculat din costul per clic, solicitări și clienți plătitori",
          "Grafic al componentelor prețului și verificare realistă",
          "Descarcă modelul complet ca registru Excel",
        ],
      },
      ru: {
        name: "Конструктор цены",
        short: "Цена",
        tagline: "Цена, которая покрывает себестоимость, рекламу и прибыль",
        description:
          "Введите себестоимость, стоимость привлечения клиента и целевую маржу. Рекомендуемая цена обновляется мгновенно, с разбивкой и проверкой реальностью.",
        features: [
          "Себестоимость, CAC и прибыль в одной цене",
          "CAC по цене клика, заявкам и платящим клиентам",
          "Диаграмма состава цены и проверка реальностью",
          "Скачайте всю модель как таблицу Excel",
        ],
      },
    },
  },
  {
    slug: "uvp",
    href: "/uvp",
    icon: PenLine,
    category: { en: "Marketing", ro: "Marketing", ru: "Маркетинг" },
    kind: "embedded",
    src: "/tools/uvp-workbench.html",
    text: {
      en: {
        name: "UVP & Copy Workbench",
        short: "UVP Workbench",
        tagline: "Turn one clear idea into a full set of marketing copy",
        description:
          "Describe your customer, their pain and your product. Get value propositions, Instagram and TikTok bios, website hero copy, hooks and ads, written natively in four languages.",
        features: [
          "Interface and copy in English, Romanian, Russian and Ukrainian",
          "AI copywriter, with offline templates as a fallback",
          "UVPs, social bios, hero copy, hooks, PAS and AIDA ads",
          "Copy any piece or download everything as CSV",
        ],
      },
      ro: {
        name: "Atelier UVP și texte",
        short: "Atelier UVP",
        tagline: "O idee clară transformată într-un set complet de texte de marketing",
        description:
          "Descrie clientul, problema lui și produsul tău. Primești propuneri de valoare, descrieri pentru Instagram și TikTok, texte pentru site, hook-uri și reclame, scrise natural în patru limbi.",
        features: [
          "Interfață și texte în engleză, română, rusă și ucraineană",
          "Copywriter AI, cu șabloane offline ca rezervă",
          "UVP-uri, descrieri, texte pentru site, hook-uri, reclame PAS și AIDA",
          "Copiază orice text sau descarcă totul în CSV",
        ],
      },
      ru: {
        name: "Мастерская UVP и текстов",
        short: "Мастерская UVP",
        tagline: "Одна ясная идея — полный набор маркетинговых текстов",
        description:
          "Опишите клиента, его боль и ваш продукт. Получите ценностные предложения, описания для Instagram и TikTok, тексты для сайта, хуки и рекламу на четырёх языках.",
        features: [
          "Интерфейс и тексты на английском, румынском, русском и украинском",
          "ИИ-копирайтер, а без него — офлайн-шаблоны",
          "UVP, описания профилей, тексты для сайта, хуки, реклама PAS и AIDA",
          "Копируйте любой текст или скачайте всё в CSV",
        ],
      },
    },
  },
  {
    slug: "feed-planner",
    href: "/feed-planner",
    icon: CalendarDays,
    category: { en: "Social media", ro: "Rețele sociale", ru: "Соцсети" },
    kind: "embedded",
    src: "/tools/feed-planner/index.html",
    text: {
      en: {
        name: "Feed Planner",
        short: "Feed Planner",
        tagline: "Plan a month of Instagram or TikTok posts",
        description:
          "Set up your brand, add photos and videos, and see the month as a feed grid or calendar. Write the captions yourself or let Gemini plan and write them.",
        features: [
          "Brand projects with colours, logo, voice and content pillars",
          "Single posts, carousels and reels, with feed and calendar views",
          "Plan with Gemini: captions, CTAs, hashtags and posting order",
          "Copy the plan or download all images as a zip",
        ],
      },
      ro: {
        name: "Planificator de feed",
        short: "Feed",
        tagline: "Planifică o lună de postări pe Instagram sau TikTok",
        description:
          "Configurează brandul, adaugă fotografii și videoclipuri și vezi luna ca grilă de feed sau calendar. Scrie singur descrierile sau lasă Gemini să le planifice și să le scrie.",
        features: [
          "Proiecte de brand cu culori, logo, ton și teme de conținut",
          "Postări simple, carusele și reels, în vizualizare feed și calendar",
          "Planificare cu Gemini: descrieri, CTA, hashtaguri și ordinea postărilor",
          "Copiază planul sau descarcă toate imaginile într-o arhivă zip",
        ],
      },
      ru: {
        name: "Планировщик ленты",
        short: "Лента",
        tagline: "Планируйте месяц публикаций в Instagram или TikTok",
        description:
          "Настройте бренд, добавьте фото и видео и посмотрите месяц в виде ленты или календаря. Пишите подписи сами или доверьте Gemini план и тексты.",
        features: [
          "Проекты брендов: цвета, логотип, тон и темы контента",
          "Посты, карусели и рилсы, вид ленты и календаря",
          "План с Gemini: подписи, призывы, хэштеги и порядок публикаций",
          "Скопируйте план или скачайте все изображения архивом zip",
        ],
      },
    },
  },
];

export const TOOL_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t])) as Record<string, Tool>;

export const toolText = (tool: Tool, lang: Lang): ToolText => tool.text[lang] ?? tool.text.en;
