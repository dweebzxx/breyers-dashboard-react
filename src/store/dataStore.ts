/**
 * Zustand store for survey data, pre-computed statistics, and UI filter state.
 */

import { create } from 'zustand'
import type { Respondent, Labels, QuestionText } from '@/types/survey'
import type {
  OverviewStats,
  ConceptPerformanceStats,
  RegressionStats,
  LogitStats,
  CorrelationStats,
  PriceSensitivityStats,
  CrosstabsOptions,
} from '@/types/stats'

interface FilterState {
  conceptCells: number[]   // [] = all
  dietFocus: number[]      // [] = all
  ageGroups: number[]      // [] = all
}

interface DataState {
  // Loading state
  isLoading: boolean
  error: string | null

  // Survey data
  respondents: Respondent[]
  labels: Labels | null
  questionText: QuestionText | null

  // Pre-computed statistics
  overviewStats: OverviewStats | null
  conceptPerformanceStats: ConceptPerformanceStats | null
  regressionOLSStats: RegressionStats | null
  regressionLogitStats: LogitStats | null
  correlationStats: CorrelationStats | null
  priceSensitivityStats: PriceSensitivityStats | null
  crosstabsOptions: CrosstabsOptions | null

  // Filter state
  filters: FilterState

  // Actions
  loadAll: () => Promise<void>
  setConceptFilter: (vals: number[]) => void
  setDietFocusFilter: (vals: number[]) => void
  setAgeGroupFilter: (vals: number[]) => void
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const useDataStore = create<DataState>((set) => ({
  isLoading: false,
  error: null,

  respondents: [],
  labels: null,
  questionText: null,

  overviewStats: null,
  conceptPerformanceStats: null,
  regressionOLSStats: null,
  regressionLogitStats: null,
  correlationStats: null,
  priceSensitivityStats: null,
  crosstabsOptions: null,

  filters: {
    conceptCells: [],
    dietFocus: [],
    ageGroups: [],
  },

  setConceptFilter: (vals) =>
    set(state => ({ filters: { ...state.filters, conceptCells: vals } })),
  setDietFocusFilter: (vals) =>
    set(state => ({ filters: { ...state.filters, dietFocus: vals } })),
  setAgeGroupFilter: (vals) =>
    set(state => ({ filters: { ...state.filters, ageGroups: vals } })),

  loadAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const [
        respondents,
        labels,
        questionText,
        overviewStats,
        conceptPerformanceStats,
        regressionOLSStats,
        regressionLogitStats,
        correlationStats,
        priceSensitivityStats,
        crosstabsOptions,
      ] = await Promise.all([
        fetchJSON<Respondent[]>('/data/survey.json'),
        fetchJSON<Labels>('/data/labels.json'),
        fetchJSON<QuestionText>('/data/question-text.json'),
        fetchJSON<OverviewStats>('/data/stats/overview.json'),
        fetchJSON<ConceptPerformanceStats>('/data/stats/concept-performance.json'),
        fetchJSON<RegressionStats>('/data/stats/regression-ols.json'),
        fetchJSON<LogitStats>('/data/stats/regression-logit.json'),
        fetchJSON<CorrelationStats>('/data/stats/correlations.json'),
        fetchJSON<PriceSensitivityStats>('/data/stats/price-sensitivity.json'),
        fetchJSON<CrosstabsOptions>('/data/stats/crosstabs-options.json'),
      ])

      set({
        isLoading: false,
        respondents,
        labels,
        questionText,
        overviewStats,
        conceptPerformanceStats,
        regressionOLSStats,
        regressionLogitStats,
        correlationStats,
        priceSensitivityStats,
        crosstabsOptions,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error loading data',
      })
    }
  },
}))

/** Selector: returns respondents filtered by the current filter state. */
export function selectFilteredRespondents(state: DataState): Respondent[] {
  const { respondents, filters } = state
  return respondents.filter(r => {
    if (filters.conceptCells.length > 0 && !filters.conceptCells.includes(r.ClaimCell)) return false
    if (filters.dietFocus.length > 0 && !filters.dietFocus.includes(r.Q21_DietFocus)) return false
    if (filters.ageGroups.length > 0 && !filters.ageGroups.includes(r.Q23_Age)) return false
    return true
  })
}
