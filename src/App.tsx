import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useDataStore, useFilteredRespondents } from '@/store/dataStore'
import { Sidebar } from '@/components/Sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import Overview from '@/pages/Overview'
import ConceptPerformance from '@/pages/ConceptPerformance'
import DriverAnalysis from '@/pages/DriverAnalysis'
import Crosstabs from '@/pages/Crosstabs'
import Correlation from '@/pages/Correlation'
import PriceSensitivity from '@/pages/PriceSensitivity'
import RawData from '@/pages/RawData'
import Demographics from '@/pages/Demographics'

const NAV_TABS = [
  { path: '/', label: 'Overview', end: true },
  { path: '/concept-performance', label: 'Concept Performance' },
  { path: '/driver-analysis', label: 'Driver Analysis' },
  { path: '/crosstabs', label: 'Crosstabs' },
  { path: '/correlation', label: 'Correlation' },
  { path: '/price-sensitivity', label: 'Price Sensitivity' },
  { path: '/demographics', label: 'Demographics' },
  { path: '/raw-data', label: 'Raw Data' },
]

function ZeroNBanner() {
  const filtered = useFilteredRespondents()
  const totalN = useDataStore(s => s.respondents.length)
  const isLoading = useDataStore(s => s.isLoading)

  if (isLoading || totalN === 0 || filtered.length > 0) return null

  return (
    <div className="px-6 pt-4">
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No data matches current filters</AlertTitle>
        <AlertDescription>
          Adjust the sidebar filters to include more respondents.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function AppShell() {
  const loadAll = useDataStore(s => s.loadAll)
  const isLoading = useDataStore(s => s.isLoading)
  const error = useDataStore(s => s.error)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3f4f7' }}>
      <header className="border-b bg-card shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#91b82b' }}
            >
              <div className="w-3 h-3 rounded-full bg-white/80" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Breyers Survey Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Better For You Claims — Marketing Research Analysis (MKTG6051)
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar />

        <div className="flex-1 min-w-0 flex flex-col">
          <nav className="border-b bg-card" aria-label="Dashboard sections">
            <div className="px-4 sm:px-6">
              <div className="flex overflow-x-auto">
                {NAV_TABS.map(tab => (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.end}
                    className={({ isActive }) =>
                      [
                        'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-[#5a8834] text-[#5a8834]'
                          : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground',
                      ].join(' ')
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          <ZeroNBanner />

          <main className="flex-1 px-4 py-6 sm:px-6">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Error loading data</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div
                    className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
                    style={{ borderColor: '#91b82b', borderTopColor: 'transparent' }}
                  />
                  <p className="text-muted-foreground text-sm">Loading survey data...</p>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/concept-performance" element={<ConceptPerformance />} />
                <Route path="/driver-analysis" element={<DriverAnalysis />} />
                <Route path="/crosstabs" element={<Crosstabs />} />
                <Route path="/correlation" element={<Correlation />} />
                <Route path="/price-sensitivity" element={<PriceSensitivity />} />
                <Route path="/demographics" element={<Demographics />} />
                <Route path="/raw-data" element={<RawData />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
