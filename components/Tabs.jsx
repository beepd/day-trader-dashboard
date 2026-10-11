import Link from 'next/link'

const TABS = [
  ['overview', 'OVERVIEW'],
  ['days', 'DAY BY DAY'],
  ['trades', 'ALL TRADES'],
  ['blog', 'BLOG'],
  ['about', 'ABOUT'],
]

/** The section links. The chosen tab lives in the address (?tab=days), so every view can be shared as a link. */
export default function Tabs({ active, blogUrl }) {
  return (
    <nav aria-label="Sections" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
      {TABS.map(([key, label]) => {
        const on = key === active
        const style = {
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, padding: '10px 14px', marginBottom: -1,
          color: on ? 'var(--cyan)' : 'var(--muted)',
          borderBottom: on ? '2px solid var(--cyan)' : '2px solid transparent',
        }
        // The blog is its own site: this tab opens it directly (the old /?tab=blog address still works for shared links)
        if (key === 'blog' && blogUrl) {
          return (
            <a key={key} href={blogUrl} target="_blank" rel="noopener noreferrer" style={style} aria-label="Blog (opens in a new tab)">
              {label} <span aria-hidden="true">↗</span>
            </a>
          )
        }
        return (
          <Link
            key={key}
            href={key === 'overview' ? '/' : `/?tab=${key}`}
            aria-current={on ? 'page' : undefined}
            style={style}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
