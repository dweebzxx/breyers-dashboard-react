/**
 * Zustand store for survey data and pre-computed statistics.
 * Data is loaded once from public/data/ JSON files.
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

  // Actions
  loadAll: () => Promise<void>
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
