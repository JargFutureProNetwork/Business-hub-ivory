"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Site language. English is the default; a visitor's choice is saved as
 * `ivory-lang` and mirrored on `<html lang>`, which the embedded tools follow
 * through `public/tools/hub-bridge.js`.
 */
export type Lang = "en" | "ro" | "ru";
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "ro", label: "Română", short: "RO" },
  { code: "ru", label: "Русский", short: "RU" },
];
export const LANG_KEY = "ivory-lang";
const isLang = (v: unknown): v is Lang => v === "en" || v === "ro" || v === "ru";

const D = {
  en: {
    nav_dashboard: "Dashboard",
    nav_resources: "Resources",
    business_hub: "Business Hub",
    home_aria: "Ivory Center Business Hub home",
    theme_to_light: "Switch to light mode",
    theme_to_dark: "Switch to dark mode",
    menu_open: "Open menu",
    menu_close: "Close menu",
    language: "Language",
    eyebrow: "Ivory Center · Utah-Moldova Business Partnership",
    welcome: "Welcome to the Business Hub",
    intro:
      "Practical tools for entrepreneurs, in one place. Test your business model, set a price that pays, write marketing copy your customers will read, and plan your social media month. Everything runs in your browser.",
    start_canvas: "Start with Canvas Lab",
    browse_tools: "Browse all tools",
    tools: "Tools",
    tools_available: "{n} tools available",
    open_tool: "Open {name}",
    fit_title: "How the tools fit together",
    fit_sub: "Each tool works on its own. Used in this order, each one feeds the next.",
    step_model: "Model",
    step_model_text: "Lay out who you serve, what you offer and how you earn, then check the score.",
    step_price: "Price",
    step_price_text: "Find the price that covers delivery, customer acquisition and the profit you need.",
    step_message: "Message",
    step_message_text: "Turn your offer into a value proposition and ready-to-post marketing copy.",
    step_plan: "Plan",
    step_plan_text: "Lay out a month of posts, preview your feed and write the captions.",
    resources: "Resources",
    resources_teaser: "{n} recommended tools for AI, design, video, social media, research and automation.",
    view_resources: "View resources",
    open_full: "Open full screen",
    open_short: "Open",
    loading: "Loading {name}…",
    res_intro:
      "Tools we recommend for running and marketing a small business: AI assistants, design, video, social media, research and automation. Each opens in a new tab.",
    res_search: "Search resources",
    res_placeholder: "Search tools, e.g. video, email, SEO",
    res_all: "All",
    res_filter: "Filter by category",
    res_count: "{n} tools",
    res_count_of: "{n} of {m} tools",
    res_none: "No tools match that search.",
    res_clear: "Clear filters",
    f_follow: "Follow",
    f_contact: "Contact",
    f_founded: "Est. 2015 by Clark Ivory & Walter Plumb III",
    f_storage: "Storage settings",
    flag: "Flag of Moldova",
    c_title: "Save your work in this browser?",
    c_text:
      "The tools can keep your canvases, drafts and feed plans (including photos and videos) in this browser, so nothing is lost if you close the page. Nothing is sent to a server and we use no tracking cookies. If you decline, your work disappears when you leave.",
    c_accept: "Accept",
    c_decline: "Decline",
    c_saved: "Your work is saved in this browser.",
    c_declined: "Your work isn't saved in this browser.",
  },
  ro: {
    nav_dashboard: "Panou",
    nav_resources: "Resurse",
    business_hub: "Centrul de afaceri",
    home_aria: "Pagina principală Ivory Center Business Hub",
    theme_to_light: "Treci la modul luminos",
    theme_to_dark: "Treci la modul întunecat",
    menu_open: "Deschide meniul",
    menu_close: "Închide meniul",
    language: "Limbă",
    eyebrow: "Ivory Center · Parteneriatul de afaceri Utah–Moldova",
    welcome: "Bine ai venit în Business Hub",
    intro:
      "Instrumente practice pentru antreprenori, într-un singur loc. Testează-ți modelul de afaceri, stabilește un preț care aduce profit, scrie texte de marketing pe care clienții le citesc și planifică luna pe rețelele sociale. Totul rulează în browserul tău.",
    start_canvas: "Începe cu Canvas Lab",
    browse_tools: "Vezi toate instrumentele",
    tools: "Instrumente",
    tools_available: "{n} instrumente disponibile",
    open_tool: "Deschide {name}",
    fit_title: "Cum se leagă instrumentele",
    fit_sub: "Fiecare instrument funcționează separat. Folosite în această ordine, fiecare îl alimentează pe următorul.",
    step_model: "Modelul",
    step_model_text: "Descrie pe cine servești, ce oferi și cum câștigi, apoi verifică scorul.",
    step_price: "Prețul",
    step_price_text: "Găsește prețul care acoperă livrarea, atragerea clienților și profitul de care ai nevoie.",
    step_message: "Mesajul",
    step_message_text: "Transformă oferta într-o propunere de valoare și texte de marketing gata de publicat.",
    step_plan: "Planul",
    step_plan_text: "Planifică o lună de postări, previzualizează feedul și scrie descrierile.",
    resources: "Resurse",
    resources_teaser: "{n} instrumente recomandate pentru AI, design, video, rețele sociale, cercetare și automatizare.",
    view_resources: "Vezi resursele",
    open_full: "Deschide pe tot ecranul",
    open_short: "Deschide",
    loading: "Se încarcă {name}…",
    res_intro:
      "Instrumente pe care le recomandăm pentru a conduce și promova o afacere mică: asistenți AI, design, video, rețele sociale, cercetare și automatizare. Fiecare se deschide într-o filă nouă.",
    res_search: "Caută resurse",
    res_placeholder: "Caută instrumente, de ex. video, email, SEO",
    res_all: "Toate",
    res_filter: "Filtrează după categorie",
    res_count: "{n} instrumente",
    res_count_of: "{n} din {m} instrumente",
    res_none: "Niciun instrument nu corespunde căutării.",
    res_clear: "Șterge filtrele",
    f_follow: "Urmărește-ne",
    f_contact: "Contact",
    f_founded: "Fondat în 2015 de Clark Ivory și Walter Plumb III",
    f_storage: "Setări de stocare",
    flag: "Drapelul Moldovei",
    c_title: "Salvezi munca în acest browser?",
    c_text:
      "Instrumentele pot păstra în acest browser canvasurile, ciornele și planurile de feed (inclusiv fotografii și videoclipuri), ca să nu pierzi nimic dacă închizi pagina. Nimic nu este trimis pe un server și nu folosim cookie-uri de urmărire. Dacă refuzi, munca dispare când pleci.",
    c_accept: "Accept",
    c_decline: "Refuz",
    c_saved: "Munca ta este salvată în acest browser.",
    c_declined: "Munca ta nu este salvată în acest browser.",
  },
  ru: {
    nav_dashboard: "Главная",
    nav_resources: "Ресурсы",
    business_hub: "Бизнес-хаб",
    home_aria: "Главная страница Ivory Center Business Hub",
    theme_to_light: "Включить светлую тему",
    theme_to_dark: "Включить тёмную тему",
    menu_open: "Открыть меню",
    menu_close: "Закрыть меню",
    language: "Язык",
    eyebrow: "Ivory Center · Деловое партнёрство Юта–Молдова",
    welcome: "Добро пожаловать в Business Hub",
    intro:
      "Практичные инструменты для предпринимателей в одном месте. Проверьте бизнес-модель, назначьте цену, которая приносит прибыль, напишите тексты, которые прочтут клиенты, и спланируйте месяц в соцсетях. Всё работает прямо в браузере.",
    start_canvas: "Начать с Canvas Lab",
    browse_tools: "Все инструменты",
    tools: "Инструменты",
    tools_available: "Доступно инструментов: {n}",
    open_tool: "Открыть {name}",
    fit_title: "Как инструменты связаны между собой",
    fit_sub: "Каждый инструмент работает сам по себе. Если идти по порядку, каждый помогает следующему.",
    step_model: "Модель",
    step_model_text: "Опишите, кого вы обслуживаете, что предлагаете и как зарабатываете, затем проверьте оценку.",
    step_price: "Цена",
    step_price_text: "Найдите цену, которая покрывает себестоимость, привлечение клиентов и нужную прибыль.",
    step_message: "Сообщение",
    step_message_text: "Превратите предложение в ценностное предложение и готовые маркетинговые тексты.",
    step_plan: "План",
    step_plan_text: "Спланируйте месяц публикаций, посмотрите ленту заранее и напишите подписи.",
    resources: "Ресурсы",
    resources_teaser: "Рекомендуемых инструментов: {n} — ИИ, дизайн, видео, соцсети, исследования и автоматизация.",
    view_resources: "Смотреть ресурсы",
    open_full: "Открыть на весь экран",
    open_short: "Открыть",
    loading: "Загрузка: {name}…",
    res_intro:
      "Инструменты, которые мы рекомендуем для ведения и продвижения малого бизнеса: ИИ-ассистенты, дизайн, видео, соцсети, исследования и автоматизация. Каждый открывается в новой вкладке.",
    res_search: "Поиск ресурсов",
    res_placeholder: "Поиск, например: видео, email, SEO",
    res_all: "Все",
    res_filter: "Фильтр по категории",
    res_count: "Инструментов: {n}",
    res_count_of: "{n} из {m}",
    res_none: "По этому запросу ничего не найдено.",
    res_clear: "Сбросить фильтры",
    f_follow: "Мы в соцсетях",
    f_contact: "Контакты",
    f_founded: "Основано в 2015 году: Clark Ivory и Walter Plumb III",
    f_storage: "Настройки хранения",
    flag: "Флаг Молдовы",
    c_title: "Сохранять вашу работу в этом браузере?",
    c_text:
      "Инструменты могут хранить ваши канвасы, черновики и планы публикаций (включая фото и видео) в этом браузере, чтобы ничего не потерялось при закрытии страницы. Ничего не отправляется на сервер, и мы не используем отслеживающие cookie. Если откажетесь, работа исчезнет, когда вы уйдёте.",
    c_accept: "Принять",
    c_decline: "Отказаться",
    c_saved: "Ваша работа сохраняется в этом браузере.",
    c_declined: "Ваша работа не сохраняется в этом браузере.",
  },
} satisfies Record<Lang, Record<string, string>>;

export type MsgKey = keyof (typeof D)["en"];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: MsgKey, vars?: Record<string, string | number>) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // The saved choice is only known in the browser; the pre-paint script in the
  // layout has already copied it onto <html lang>.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const l = document.documentElement.getAttribute("lang");
    if (isLang(l) && l !== "en") setLangState(l);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.setAttribute("lang", l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (k: MsgKey, vars?: Record<string, string | number>) => {
      let s: string = D[lang][k] ?? D.en[k];
      if (vars) for (const [name, v] of Object.entries(vars)) s = s.split(`{${name}}`).join(String(v));
      return s;
    },
    [lang],
  );

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const c = useContext(LangCtx);
  if (!c) throw new Error("useLang must be used inside LangProvider");
  return c;
}
