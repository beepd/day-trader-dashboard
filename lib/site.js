// The public name of the project, in one place. To rename the site, change SITE_NAME here
// (and the title line of README.md). The header, the browser tab title and the CSV file name all follow it.
export const SITE_NAME = 'The Nifty Experiment'

// Where the project lives. The dashboard answers on niftyexperiment.com and trader.niftyexperiment.com;
// SITE_URL is the main address (used for the canonical link and share previews). The blog is a separate site.
export const SITE_URL = 'https://niftyexperiment.com'
export const BLOG_URL = 'https://blog.niftyexperiment.com'

export const SITE_TITLE = `${SITE_NAME}: AI paper trading on NSE stocks`

export const SITE_DESCRIPTION =
  'An AI agent paper-trades Indian (NSE) stocks with fake money every trading day. Every decision and result is published after the market closes. Simulation only, not investment advice.'

export const CSV_FILENAME = `${SITE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_trades.csv`
