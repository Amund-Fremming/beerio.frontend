import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n'
import MobileGate from './components/MobileGate'
import HomeScreen from './screens/HomeScreen'
import CreateRoomScreen from './screens/CreateRoomScreen'
import JoinRoomScreen from './screens/JoinRoomScreen'
import UsernameScreen from './screens/UsernameScreen'
import RoomScreen from './screens/RoomScreen'

function App() {
  return (
    <I18nProvider>
    <MobileGate>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/create" element={<CreateRoomScreen />} />
        <Route path="/join" element={<JoinRoomScreen />} />
        <Route path="/room/:roomId/join" element={<UsernameScreen />} />
        <Route path="/room/:roomId" element={<RoomScreen />} />
      </Routes>
    </BrowserRouter>
    </MobileGate>
    </I18nProvider>
  )
}

export default App
