import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()

  useEffect(() => {
    const activeRoom = localStorage.getItem('beerio_active_room')
    if (activeRoom) {
      navigate(`/room/${activeRoom}`, { replace: true })
    }
  }, [navigate])

  return (
    <div className="screen" style={{ justifyContent: 'center', minHeight: '100svh' }}>
      <button
        onClick={() => setLang(lang === 'en' ? 'no' : 'en')}
        style={{
          position: 'fixed', top: 16, right: 16, background: 'none', border: 'none',
          fontSize: '1.6rem', cursor: 'pointer', zIndex: 10,
        }}
        aria-label="Toggle language"
      >
        {lang === 'en' ? '🇳🇴' : '🇬🇧'}
      </button>

      <div className="wordmark" style={{ marginBottom: 4 }}>
        <span className="wordmark-text">🍺 beerio</span>
        <span className="wordmark-sub">{t.tagline}</span>
      </div>

      <div className="home-grid" style={{ marginTop: 8 }}>
        <Link to="/create" className="home-card create">
          <span className="icon">⚡</span>
          <span className="label">{t.create}</span>
          <span className="desc">{t.createDesc}</span>
        </Link>

        <Link to="/join" className="home-card join">
          <span className="icon">🔗</span>
          <span className="label">{t.join}</span>
          <span className="desc">{t.joinDesc}</span>
        </Link>
      </div>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
        {t.madeFor}
      </p>
    </div>
  )
}
