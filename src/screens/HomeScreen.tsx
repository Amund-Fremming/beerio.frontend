import { Link } from 'react-router-dom'

export default function HomeScreen() {
  return (
    <div className="screen" style={{ justifyContent: 'center', minHeight: '100vh' }}>
      <div className="wordmark">
        🍺 beer<span>io</span>
      </div>
      <p className="screen-sub" style={{ textAlign: 'center', marginTop: -8 }}>
        Track your drinks. Crown the champion.
      </p>

      <div className="home-grid" style={{ marginTop: 12 }}>
        <Link to="/create" className="home-card">
          <span className="icon">🆕</span>
          <span className="label">Create room</span>
          <span className="desc">Start a new game</span>
        </Link>

        <Link to="/join" className="home-card">
          <span className="icon">🔗</span>
          <span className="label">Join room</span>
          <span className="desc">Enter a room ID</span>
        </Link>
      </div>
    </div>
  )
}
