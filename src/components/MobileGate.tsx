import { useEffect, useState } from 'react'

const MOBILE_MAX = 520

export default function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_MAX)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= MOBILE_MAX)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!isMobile) {
    return (
      <div className="desktop-wall">
        <span className="big-icon">📱</span>
        <h1>Mobile only.</h1>
        <p>
          Beerio is built for your phone.<br />
          Open it on mobile or shrink this window below {MOBILE_MAX}px.
        </p>
        <div className="qr-hint">
          🔗 Share the URL with your phone and crack a cold one 🍺
        </div>
      </div>
    )
  }

  return <>{children}</>
}
