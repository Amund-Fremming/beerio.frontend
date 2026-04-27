import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MobileGate from './components/MobileGate'
import { I18nProvider } from './i18n'
import CreateRoomScreen from './screens/CreateRoomScreen'
import HomeScreen from './screens/HomeScreen'
import JoinRoomScreen from './screens/JoinRoomScreen'
import RoomScreen from './screens/RoomScreen'
import UsernameScreen from './screens/UsernameScreen'

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
