import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useDataStore, useFilteredRespondents } from '@/store/dataStore'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

const CONCEPT_OPTIONS = [
  { value: 1, label: 'Higher Protein' },
  { value: 2, label: 'Low/Zero Sugar' },
  { value: 3, label: 'Both Claims' },
]

const DIET_OPTIONS = [
  { value: 1, label: 'Limit Sugar' },
  { value: 2, label: 'Increase Protein' },
  { value: 3, label: 'Both' },
  { value: 4, label: 'Neither' },
]

const AGE_OPTIONS = [
  { value: 1, label: '18–24' },
  { value: 2, label: '25–34' },
  { value: 3, label: '35–44' },
  { value: 4, label: '45–54' },
  { value: 5, label: '55–64' },
  { value: 6, label: '65+' },
]

interface ToggleGroupProps {
  label: string
  options: { value: number; label: string }[]
  selected: number[]
  onChange: (vals: number[]) => void
}

function ToggleGroup({ label, options, selected, onChange }: ToggleGroupProps) {
  const toggle = (val: number) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val))
    } else {
      onChange([...selected, val])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-[#5a8834] hover:underline leading-none"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
                active
                  ? 'border-[#5a8834] bg-[#91b82b] text-white shadow-sm'
                  : 'border-border bg-background text-foreground hover:border-[#5a8834] hover:bg-[#91b82b]/10'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

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

  const loadAll = useDataStore(s => s.loadAll)
  useEffect(() => {
    if (!isLoading && totalN === 0) {
      loadAll()
    }
  }, [isLoading, totalN, loadAll])

  const hasActiveFilters =
    filters.conceptCells.length > 0 ||
    filters.dietFocus.length > 0 ||
    filters.ageGroups.length > 0

  return (
    <aside
      className={cn(
        'w-56 shrink-0 border-r bg-card flex flex-col gap-0 sticky top-0 self-start h-[calc(100vh-4rem)] overflow-y-auto',
        className
      )}
    >
      <div className="p-4 space-y-4">
        {/* N counter */}
        <div className="rounded-lg bg-[#91b82b]/10 border border-[#5a8834]/30 p-3 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Filtered N</p>
          <p className="text-3xl font-bold text-[#5a8834] tabular-nums">{filteredN}</p>
          {totalN > 0 && filteredN < totalN && (
            <p className="text-xs text-muted-foreground mt-0.5">of {totalN} total</p>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setConceptFilter([])
              setDietFocusFilter([])
              setAgeGroupFilter([])
            }}
            className="w-full rounded-md border border-[#5a8834] py-1.5 text-xs font-medium text-[#5a8834] hover:bg-[#91b82b]/10 transition-colors"
          >
            Clear All Filters
          </button>
        )}

        <Separator />

        <div className="space-y-4">
          <ToggleGroup
            label="Concept Cell"
            options={CONCEPT_OPTIONS}
            selected={filters.conceptCells}
            onChange={setConceptFilter}
          />

          <ToggleGroup
            label="Diet Focus (Q21)"
            options={DIET_OPTIONS}
            selected={filters.dietFocus}
            onChange={setDietFocusFilter}
          />

          <ToggleGroup
            label="Age Group (Q23)"
            options={AGE_OPTIONS}
            selected={filters.ageGroups}
            onChange={setAgeGroupFilter}
          />
        </div>

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
