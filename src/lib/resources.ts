import type { BrandIconKey } from "./brand-icons";

/**
 * Tools listed on the Resources page.
 *
 * To add one, append an entry to `RESOURCES`:
 * - `domain` is used to load the site's own icon in the visitor's browser.
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
  icon?: BrandIconKey;
  color: string;
};

export const RESOURCES: Resource[] = [
  {
    name: "ChatGPT",
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
