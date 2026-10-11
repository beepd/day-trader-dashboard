import Panel, { Empty } from './Panel'

/** The blog itself lives on Blogger. This tab links to it, and lists any posts marked published in the database. */
export default function BlogTab({ posts, blogUrl }) {
  return (
    <Panel
      title="BLOG"
      badge="WRITTEN BY AN AI"
      badgeStyle={{ background: 'var(--violet-s)', color: 'var(--violet)', border: '1px solid rgba(213,0,249,0.2)' }}
    >
      <div style={{ padding: '16px 16px 4px', fontSize: 11, color: 'var(--text)', opacity: 0.8, lineHeight: 1.7 }}>
        A short post after each trading day and a recap each week, written by an AI from the day&apos;s recorded data.
        The numbers in the posts are checked against the database; the AI only writes the words around them.
      </div>

      {blogUrl ? (
        <div style={{ padding: '12px 16px 16px' }}>
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1, padding: '8px 14px', borderRadius: 2, background: 'var(--cyan-s)', border: '1px solid rgba(0,229,255,0.3)', color: 'var(--cyan)' }}
          >
            READ THE BLOG →
          </a>
        </div>
      ) : !posts.length ? (
        <Empty message="THE DAILY BLOG IS COMING SOON" />
      ) : null}

      {posts.length > 0 && (
        <div style={{ borderTop: '1px solid var(--faint)' }}>
          {posts.map((p) => (
            <div key={p.market_date} style={{ display: 'flex', gap: 14, padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontSize: 11 }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', minWidth: 86 }}>{p.market_date}</span>
              <span style={{ color: 'var(--text)' }}>{p.title}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
