import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'

// Lazy page imports (stubs for now — filled in future phases)
const Overview = () => <div className="p-6"><h2 className="text-2xl font-semibold">Overview</h2><p className="text-muted-foreground mt-2">Summary statistics will be displayed here.</p></div>
const ConceptPerformance = () => <div className="p-6"><h2 className="text-2xl font-semibold">Concept Performance</h2><p className="text-muted-foreground mt-2">T-test results for concept comparisons will be displayed here.</p></div>
const DriverAnalysis = () => <div className="p-6"><h2 className="text-2xl font-semibold">Driver Analysis</h2><p className="text-muted-foreground mt-2">OLS and logistic regression results will be displayed here.</p></div>
const Crosstabs = () => <div className="p-6"><h2 className="text-2xl font-semibold">Crosstabs</h2><p className="text-muted-foreground mt-2">Cross-tabulation analysis will be displayed here.</p></div>
const Correlation = () => <div className="p-6"><h2 className="text-2xl font-semibold">Correlation</h2><p className="text-muted-foreground mt-2">Correlation matrix will be displayed here.</p></div>
const PriceSensitivity = () => <div className="p-6"><h2 className="text-2xl font-semibold">Price Sensitivity</h2><p className="text-muted-foreground mt-2">Price likelihood curves will be displayed here.</p></div>
const RawData = () => <div className="p-6"><h2 className="text-2xl font-semibold">Raw Data</h2><p className="text-muted-foreground mt-2">Full respondent-level data will be displayed here.</p></div>

const NAV_TABS = [
  { path: '/', label: 'Overview', end: true },
  { path: '/concept-performance', label: 'Concept Performance' },
  { path: '/driver-analysis', label: 'Driver Analysis' },
  { path: '/crosstabs', label: 'Crosstabs' },
  { path: '/correlation', label: 'Correlation' },
  { path: '/price-sensitivity', label: 'Price Sensitivity' },
  { path: '/raw-data', label: 'Raw Data' },
]

function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🍦</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">Breyers Survey Dashboard</h1>
              <p className="text-sm text-muted-foreground">Better For You Claims — Marketing Research Analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b bg-card" aria-label="Dashboard sections">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {NAV_TABS.map((tab) => (
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

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/concept-performance" element={<ConceptPerformance />} />
          <Route path="/driver-analysis" element={<DriverAnalysis />} />
          <Route path="/crosstabs" element={<Crosstabs />} />
          <Route path="/correlation" element={<Correlation />} />
          <Route path="/price-sensitivity" element={<PriceSensitivity />} />
          <Route path="/raw-data" element={<RawData />} />
        </Routes>
      </main>
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
