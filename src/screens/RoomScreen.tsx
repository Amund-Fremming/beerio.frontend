import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'
import { api, isApiError, type RoomState } from '../services/api'

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

  const myUsername = roomId ? localStorage.getItem(`beerio_username_${roomId}`) : null

  const [room, setRoom] = useState<RoomState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [drinkSize, setDrinkSize] = useState<0.33 | 0.5>(0.33)
  const [pendingDrink, setPendingDrink] = useState<string | null>(null)
  const [pendingUndrink, setPendingUndrink] = useState<string | null>(null)
  const [drinkError, setDrinkError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

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
    if (myUsername && roomId) {
      localStorage.setItem('beerio_active_room', roomId)
    }
  }, [myUsername, roomId, navigate])

  // Initial load + polling
  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, 3000)
    return () => clearInterval(interval)
  }, [fetchRoom])

  async function handleUndrink(username: string) {
    if (!roomId || pendingUndrink) return
    const player = room?.players.find((p) => p.username === username)
    if (!player || player.score <= 0) return
    setPendingUndrink(username)
    setDrinkError(null)
    try {
      const updated = await api.undrink(roomId, username, drinkSize)
      setRoom(updated)
    } catch (err) {
      if (isApiError(err)) {
        setDrinkError(`Failed to remove drink (${err.status}): ${err.message}`)
      } else {
        setDrinkError('Failed to remove drink. Try again.')
      }
    } finally {
      setPendingUndrink(null)
    }
  }

  async function handleDrink(username: string) {
    if (!roomId || pendingDrink) return
    setPendingDrink(username)
    setDrinkError(null)
    try {
      const updated = await api.drink(roomId, username, drinkSize)
      setRoom(updated)
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
      {/* Leave confirmation modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Leave room?</p>
            <p className="modal-desc">You'll go back to the home page, but you'll stay in the game.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { localStorage.removeItem('beerio_active_room'); navigate('/'); }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="room-topbar">
        <div className="room-code-display">
          <span className="room-code-prefix">ROOM</span>
          <span className="room-code-value">{roomId}</span>
        </div>
        <div className="topbar-actions">
          <button className={`share-pill${copied ? ' copied' : ''}`} onClick={copyLink}>
            {copied ? '✓ Copied' : '🔗 Share'}
          </button>
          <button className="leave-pill" onClick={() => setShowLeaveModal(true)}>🚪 Leave</button>
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
      <div className="size-row">
        <span className="size-label">🍺 Beer size</span>
        <div className="size-toggle">
          <span
            className={`size-opt${drinkSize === 0.33 ? ' active' : ''}`}
            onClick={() => setDrinkSize(0.33)}
          >
            0.33L
          </span>
          <button
            className={`toggle-track${drinkSize === 0.5 ? ' on' : ''}`}
            onClick={() => setDrinkSize(drinkSize === 0.33 ? 0.5 : 0.33)}
            aria-label="Toggle beer size"
          >
            <span className="toggle-thumb" />
          </button>
          <span
            className={`size-opt${drinkSize === 0.5 ? ' active' : ''}`}
            onClick={() => setDrinkSize(0.5)}
          >
            0.5L
          </span>
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
                    title={`Remove ${drinkSize}L`}
                    disabled={pendingUndrink === player.username}
                    onClick={() => handleUndrink(player.username)}
                  >
                    {pendingUndrink === player.username ? (
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                    ) : (
                      '−'
                    )}
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


    </div>
  )
}
