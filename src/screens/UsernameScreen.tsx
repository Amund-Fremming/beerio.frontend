import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, isApiError } from '../services/api'
import ErrorBanner from '../components/ErrorBanner'

export default function UsernameScreen() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
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
      sessionStorage.setItem(`beerio_username_${roomId}`, name)
      navigate(`/room/${roomId}`, { replace: true })
    } catch (err) {
      if (isApiError(err) && err.status === 400) {
        setError('That name is already taken in this room. Pick another.')
      } else if (isApiError(err) && err.status === 404) {
        setError('Room not found.')
      } else if (isApiError(err)) {
        setError(`Error ${err.status}: ${err.message}`)
      } else {
        setError('Could not reach the server. Is it running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div className="card">
        <h1 className="screen-title">👋 What's your name?</h1>
        <p className="screen-sub">
          Joining room <strong style={{ color: 'var(--accent)' }}>{roomId}</strong>
        </p>
      </div>

      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Your name</label>
          <input
            type="text"
            placeholder="e.g. Alice"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            maxLength={32}
          />
        </div>

        {error && <ErrorBanner message={error} />}

        <button className="btn btn-primary" type="submit" disabled={loading || !username.trim()}>
          {loading ? <><span className="spinner" />Joining…</> : 'Let\'s drink! 🍺'}
        </button>
      </form>
    </div>
  )
}
