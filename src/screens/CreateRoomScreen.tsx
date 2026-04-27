import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'
import { api, isApiError } from '../services/api'
import { useI18n } from '../i18n'

const UNIT_SIZES = [0.33, 0.5] as const

export default function CreateRoomScreen() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [unitSize, setUnitSize] = useState<0.33 | 0.5>(0.33)
  const [unitGoal, setUnitGoal] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const goal = parseFloat(unitGoal)
    if (isNaN(goal) || goal <= 0) {
      setError(t.positiveGoal)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { room_id } = await api.createRoom(unitSize, goal)
      navigate(`/room/${room_id}/join`)
    } catch (err) {
      if (isApiError(err)) {
        setError(`${t.failedCreateRoom} (${err.status}): ${err.message}`)
      } else {
        setError(t.serverDown)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <button className="back-link" onClick={() => navigate('/')}>{t.back}</button>

      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 'auto', marginBottom: 'auto' }} onSubmit={handleSubmit}>
        <div className="field">
          <label>{t.unitSize}</label>
          <div className="segmented">
            {UNIT_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={unitSize === s ? 'active' : ''}
                onClick={() => setUnitSize(s)}
              >
                🍺 {s}L
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>{t.unitGoal}</label>
          <input
            type="number"
            min="1"
            step="0.5"
            placeholder={t.unitGoalPlaceholder}
            value={unitGoal}
            onChange={(e) => setUnitGoal(e.target.value)}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t.unitGoalHint}
          </span>
        </div>

        {error && <ErrorBanner message={error} />}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" />{t.creatingRoom}</> : t.createRoom}
        </button>
      </form>
    </div>
  )
}
