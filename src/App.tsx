import { useEffect, Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useDataStore, selectFilteredRespondents } from '@/store/dataStore'
import { Sidebar } from '@/components/Sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: 'red', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <strong>React Error Boundary caught:</strong>{'\n'}
          {String(this.state.error)}{'\n\n'}
          Check the browser console for the component stack.
        </div>
      )
    }
    return this.props.children
  }
}

// Lazy page imports
import Overview from '@/pages/Overview'
import ConceptPerformance from '@/pages/ConceptPerformance'
import DriverAnalysis from '@/pages/DriverAnalysis'
import Crosstabs from '@/pages/Crosstabs'
import Correlation from '@/pages/Correlation'
import PriceSensitivity from '@/pages/PriceSensitivity'
import RawData from '@/pages/RawData'

const NAV_TABS = [
  { path: '/', label: 'Overview', end: true },
  { path: '/concept-performance', label: 'Concept Performance' },
  { path: '/driver-analysis', label: 'Driver Analysis' },
  { path: '/crosstabs', label: 'Crosstabs' },
  { path: '/correlation', label: 'Correlation' },
  { path: '/price-sensitivity', label: 'Price Sensitivity' },
  { path: '/raw-data', label: 'Raw Data' },
]

function ZeroNBanner() {
  const filtered = useDataStore(selectFilteredRespondents)
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🍦</span>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Breyers Survey Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Better For You Claims - Marketing Research Analysis (MKTG6051)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex">
        <Sidebar />

        {/* Right side: nav + content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Tab navigation */}
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
                          ? 'border-primary text-primary'
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

          {/* Zero-N alert banner */}
          <ZeroNBanner />

          {/* Page content */}
          <main className="flex-1 px-4 py-6 sm:px-6">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Error loading data</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="text-4xl mb-3" aria-hidden="true">🍦</div>
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
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
