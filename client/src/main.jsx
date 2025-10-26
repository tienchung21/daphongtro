import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'

// Leaflet CSS cho Map component
import 'leaflet/dist/leaflet.css'

import App from './App.jsx'

// Setup React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút - data coi là fresh trong 5 phút
      cacheTime: 10 * 60 * 1000, // 10 phút - data giữ trong cache 10 phút
      refetchOnWindowFocus: false, // Không refetch khi user quay lại tab
      retry: 1, // Retry 1 lần nếu request fail
      refetchOnMount: true, // Refetch khi component mount (nếu data stale)
    }
  }
})

createRoot(document.getElementById('root')).render(
  // Tạm thời disable StrictMode để debug dropdown issue
  // <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* React Query Devtools - chỉ hiện trong development */}
      {import.meta.env.MODE === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  // </StrictMode>,
)
