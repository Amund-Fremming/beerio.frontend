import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'
import { useI18n } from '../i18n'
import { api, isApiError } from '../services/api'

export default function UsernameScreen() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = username.trim()
    if (!name || !roomId) return
    setLoading(true)
    setError(null)
    try {
      await api.joinRoom(roomId, name)
      localStorage.setItem(`beerio_username_${roomId}`, name)
      localStorage.setItem('beerio_active_room', roomId)
      navigate(`/room/${roomId}`, { replace: true })
    } catch (err) {
      if (isApiError(err) && err.status === 400) {
        setError(t.nameTaken)
      } else if (isApiError(err) && err.status === 404) {
        setError(t.roomNotFound)
      } else if (isApiError(err)) {
        setError(`Error ${err.status}: ${err.message}`)
      } else {
        setError(t.serverDown)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div className="card">
        <h1 className="screen-title">{t.whatsYourName}</h1>
        <p className="screen-sub">
          {t.joiningRoom} <strong style={{ color: 'var(--accent)' }}>{roomId}</strong>
        </p>
      </div>

      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>{t.yourName}</label>
          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            maxLength={32}
          />
        </div>

        {error && <ErrorBanner message={error} />}

        <button className="btn btn-primary" type="submit" disabled={loading || !username.trim()}>
          {loading ? <><span className="spinner" />{t.joining}</> : t.letsDrink}
        </button>
      </form>
    </div>
  )
}
