import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

// Leaflet CSS cho Map component
import 'leaflet/dist/leaflet.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // Tạm thời disable StrictMode để debug dropdown issue
  // <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>,
)
