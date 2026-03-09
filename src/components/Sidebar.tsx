import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useDataStore, useFilteredRespondents } from '@/store/dataStore'
import { MultiSelect } from '@/components/ui/multiselect'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

const CONCEPT_OPTIONS = [
  { value: 1, label: 'Higher Protein' },
  { value: 2, label: 'Low/Zero Sugar' },
  { value: 3, label: 'Both Claims' },
]

const DIET_OPTIONS = [
  { value: 1, label: 'Limit sugar' },
  { value: 2, label: 'Increase protein' },
  { value: 3, label: 'Both' },
  { value: 4, label: 'Neither' },
]

const AGE_OPTIONS = [
  { value: 1, label: '18-24' },
  { value: 2, label: '25-34' },
  { value: 3, label: '35-44' },
  { value: 4, label: '45-54' },
  { value: 5, label: '55-64' },
  { value: 6, label: '65+' },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const filters = useDataStore(s => s.filters)
  const setConceptFilter = useDataStore(s => s.setConceptFilter)
  const setDietFocusFilter = useDataStore(s => s.setDietFocusFilter)
  const setAgeGroupFilter = useDataStore(s => s.setAgeGroupFilter)
  const filteredRespondents = useFilteredRespondents()
  const filteredN = filteredRespondents.length
  const totalN = useDataStore(s => s.respondents.length)
  const isLoading = useDataStore(s => s.isLoading)

  // Trigger data load on mount if needed
  const loadAll = useDataStore(s => s.loadAll)
  useEffect(() => {
    if (!isLoading && totalN === 0) {
      loadAll()
    }
  }, [isLoading, totalN, loadAll])

  return (
    <aside
      className={cn(
        'w-60 shrink-0 border-r bg-card flex flex-col gap-0 sticky top-0 self-start h-[calc(100vh-4rem)] overflow-y-auto',
        className
      )}
    >
      <div className="p-4 space-y-5">
        {/* N counter */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Filtered N</p>
          <p className="text-3xl font-bold text-primary tabular-nums">{filteredN}</p>
          {totalN > 0 && filteredN < totalN && (
            <p className="text-xs text-muted-foreground mt-0.5">of {totalN} total</p>
          )}
        </div>

        <Separator />

        {/* Filters */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filters
          </h3>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Concept Cell</label>
            <MultiSelect
              options={CONCEPT_OPTIONS}
              selected={filters.conceptCells}
              onChange={setConceptFilter}
              placeholder="All concepts"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Diet Focus (Q21)</label>
            <MultiSelect
              options={DIET_OPTIONS}
              selected={filters.dietFocus}
              onChange={setDietFocusFilter}
              placeholder="All diet groups"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Age Group (Q23)</label>
            <MultiSelect
              options={AGE_OPTIONS}
              selected={filters.ageGroups}
              onChange={setAgeGroupFilter}
              placeholder="All age groups"
            />
          </div>
        </div>

        {/* Zero N alert */}
        {!isLoading && totalN > 0 && filteredN === 0 && (
          <>
            <Separator />
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No results</AlertTitle>
              <AlertDescription>No data matches the current filters.</AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </aside>
  )
}
