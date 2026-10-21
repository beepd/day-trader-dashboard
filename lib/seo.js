import { SITE_NAME } from './site'

// What Google shows for each tab: the title and the one-line description under it.
// The overview tab keeps the site-wide title and description from layout.jsx, so it is not listed here.
// "path" is the tab's own address, used as its canonical link (its "real address" for search engines).
// The blog tab is not here: it is a separate site, and the old /?tab=blog address points to the home page.
export const TAB_SEO = {
  days: {
    title: `Day by day: every pick, verdict and result | ${SITE_NAME}`,
    description:
      'Pick any trading day and see what the AI agent shortlisted, why it chose its trades, and how each one ended. Paper trading on NSE stocks with fake money. Not investment advice.',
    path: '/?tab=days',
  },
  trades: {
    title: `All trades: full log of the AI's paper trades | ${SITE_NAME}`,
    description:
      'The complete list of simulated NSE trades made by the AI agent, with entry, target, stop-loss and result. Download it as CSV. Fake money, simulation only.',
    path: '/?tab=trades',
  },
  about: {
    title: `About the experiment | ${SITE_NAME}`,
    description:
      'What The Nifty Experiment is: an AI agent that paper-trades Indian stocks every day with fake money, publishes everything, and is not investment advice.',
    path: '/?tab=about',
  },
}

// Tabs that should appear in sitemap.xml
export const SITEMAP_TABS = Object.values(TAB_SEO).map((t) => t.path)
