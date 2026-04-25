import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'
import { api, isApiError } from '../services/api'

export default function JoinRoomScreen() {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = roomId.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      // Verify the room exists before navigating
      await api.getRoom(id)
      navigate(`/room/${id}/join`)
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        setError(`Room "${id}" not found.`)
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
      <button className="back-link" onClick={() => navigate('/')}>← Back</button>

      <h1 className="screen-title">🔗 Join Room</h1>

      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 'auto', marginBottom: 'auto' }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Room ID</label>
          <input
            type="text"
            placeholder="e.g. abc123"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        {error && <ErrorBanner message={error} />}

        <button className="btn btn-primary" type="submit" disabled={loading || !roomId.trim()}>
          {loading ? <><span className="spinner" />Checking…</> : 'Join room →'}
        </button>
      </form>
    </div>
  )
}
