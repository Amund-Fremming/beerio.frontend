import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, isApiError, type RoomState, type PlayerScore } from '../services/api'
import ErrorBanner from '../components/ErrorBanner'

const UNIT_SIZES = [0.33, 0.5] as const

function avatarEmoji(name: string) {
  const emojis = ['🐻', '🦊', '🐺', '🦁', '🐯', '🐸', '🦄', '🐼', '🦋', '🐙']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return emojis[Math.abs(hash) % emojis.length]
}

function formatScore(score: number, unitSize: number) {
  const beers = score
  const litres = score * unitSize
  return `${beers.toFixed(2)} units · ${litres.toFixed(2)}L`
}

export default function RoomScreen() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const myUsername = roomId ? sessionStorage.getItem(`beerio_username_${roomId}`) : null

  const [room, setRoom] = useState<RoomState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [drinkSize, setDrinkSize] = useState<0.33 | 0.5>(0.33)
  const [pendingDrink, setPendingDrink] = useState<string | null>(null)
  const [drinkError, setDrinkError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchRoom = useCallback(async () => {
    if (!roomId) return
    try {
      const data = await api.getRoom(roomId)
      setRoom(data)
      setLoadError(null)
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        setLoadError('Room not found.')
      } else {
        setLoadError('Lost connection to server.')
      }
    }
  }, [roomId])

  // Redirect to join if no username in session
  useEffect(() => {
    if (!myUsername && roomId) {
      navigate(`/room/${roomId}/join`, { replace: true })
    }
  }, [myUsername, roomId, navigate])

  // Initial load + polling
  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, 3000)
    return () => clearInterval(interval)
  }, [fetchRoom])

  async function handleDrink(username: string) {
    if (!roomId || pendingDrink) return
    setPendingDrink(username)
    setDrinkError(null)
    try {
      const updated: PlayerScore = await api.drink(roomId, username, drinkSize)
      setRoom((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.username === username ? { ...p, score: updated.score } : p,
          ),
        }
      })
    } catch (err) {
      if (isApiError(err)) {
        setDrinkError(`Failed to add drink (${err.status}): ${err.message}`)
      } else {
        setDrinkError('Failed to add drink. Try again.')
      }
    } finally {
      setPendingDrink(null)
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/room/${roomId}/join`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!myUsername) return null

  if (!room && !loadError) {
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  const topScore = room ? Math.max(...room.players.map((p) => p.score), 0) : 0

  return (
    <div className="screen">
      {/* Header */}
      <div className="card card-sm">
        <div className="room-header">
          <div>
            <div className="room-id">
              Room <strong>{roomId}</strong>
            </div>
          </div>
          <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copyLink}>
            {copied ? '✓ Copied!' : '🔗 Share link'}
          </button>
        </div>
      </div>

      {loadError && <ErrorBanner message={loadError} />}

      {/* Unit goal progress */}
      {room && (
        <div className="card card-sm">
          <div className="progress-wrap">
            <div className="progress-label">
              <span>🏆 Goal progress</span>
              <span>
                {topScore.toFixed(2)} / {room.unit_goal} units
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((topScore / room.unit_goal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Drink size selector */}
      <div className="card card-sm">
        <div className="unit-control">
          <span className="unit-control-label">Add beer size</span>
          <div className="segmented" style={{ width: 'auto', minWidth: 160 }}>
            {UNIT_SIZES.map((s) => (
              <button
                key={s}
                className={drinkSize === s ? 'active' : ''}
                onClick={() => setDrinkSize(s)}
              >
                🍺 {s}L
              </button>
            ))}
          </div>
        </div>
      </div>

      {drinkError && <ErrorBanner message={drinkError} />}

      {/* Player list */}
      {room && (
        <div className="players-list">
          {room.players.length === 0 && (
            <div className="empty-state">
              <span className="icon">🍺</span>
              No players yet — share the link!
            </div>
          )}
          {[...room.players]
            .sort((a, b) => b.score - a.score)
            .map((player, idx) => (
              <div
                key={player.username}
                className={`player-row${player.username === myUsername ? ' is-me' : ''}`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="player-avatar">{avatarEmoji(player.username)}</div>

                <div className="player-info">
                  <div className="player-name">
                    {idx === 0 && room.players.length > 1 ? '👑 ' : ''}
                    {player.username}
                    {player.username === myUsername && <span className="you-badge">YOU</span>}
                  </div>
                  <div className="player-score">
                    <strong>{player.score.toFixed(2)}</strong>{' '}
                    {formatScore(player.score, room.unit_size)}
                  </div>
                </div>

                <div className="player-actions">
                  <button
                    className="btn-icon minus"
                    title="Remove drink (not supported by API)"
                    disabled
                  >
                    −
                  </button>
                  <button
                    className="btn-icon plus"
                    title={`Add ${drinkSize}L`}
                    disabled={pendingDrink === player.username}
                    onClick={() => handleDrink(player.username)}
                  >
                    {pendingDrink === player.username ? (
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                    ) : (
                      '+'
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Invite more */}
      <div className="card card-sm" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🎉 Invite friends —{' '}
          <button
            onClick={copyLink}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: 0,
            }}
          >
            copy invite link
          </button>
        </p>
      </div>
    </div>
  )
}
