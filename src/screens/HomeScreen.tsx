import { Link } from 'react-router-dom'

export default function HomeScreen() {
  return (
    <div className="screen" style={{ justifyContent: 'center', minHeight: '100svh' }}>
      <div className="wordmark" style={{ marginBottom: 4 }}>
        <span className="wordmark-text">🍺 beerio</span>
        <span className="wordmark-sub">track · drink · conquer</span>
      </div>

      <div className="home-grid" style={{ marginTop: 8 }}>
        <Link to="/create" className="home-card create">
          <span className="icon">⚡</span>
          <span className="label">Create</span>
          <span className="desc">Start a new game</span>
        </Link>

        <Link to="/join" className="home-card join">
          <span className="icon">🔗</span>
          <span className="label">Join</span>
          <span className="desc">Enter a room ID</span>
        </Link>
      </div>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
        Made for mobile. Consumed with friends.
      </p>
    </div>
  )
}
