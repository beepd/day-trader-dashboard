// The public name of the project, in one place. To rename the site, change SITE_NAME here
// (and the title line of README.md). The header, the browser tab title and the CSV file name all follow it.
export const SITE_NAME = 'The Nifty Experiment'

export const SITE_TITLE = `${SITE_NAME}: AI paper trading on NSE stocks`

export const SITE_DESCRIPTION =
  'An AI agent paper-trades Indian (NSE) stocks with fake money every trading day. Every decision and result is published after the market closes. Simulation only, not investment advice.'

export const CSV_FILENAME = `${SITE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_trades.csv`
