/**
 * Statistics result types for the Breyers Survey Dashboard.
 * These types mirror the JSON structure produced by scripts/precompute-stats.py.
 */

// ──────────────────────────────────────────────
// T-Test
// ──────────────────────────────────────────────

export interface TTestResult {
  group1_mean: number | null
  group2_mean: number | null
  t_statistic: number | null
  p_value: number | null
  ci_low: number | null
  ci_high: number | null
  n1: number
  n2: number
  mean_diff: number | null
  error: string | null
}

export interface ConceptPairComparison {
  group1: string
  group2: string
  result: TTestResult
}

export interface ConceptPerformanceStats {
  appeal: ConceptPairComparison[]
  purchase_intent: ConceptPairComparison[]
}

// ──────────────────────────────────────────────
// Regression
// ──────────────────────────────────────────────

export interface RegressionCoefficients {
  [predictor: string]: number
}

export interface OLSRegressionResult {
  model_type: 'OLS'
  n_obs: number
  r_squared: number
  adj_r_squared: number
  f_statistic: number
  f_pvalue: number
  coefficients: RegressionCoefficients
  std_errors: RegressionCoefficients
  p_values: RegressionCoefficients
  conf_int_low: RegressionCoefficients
  conf_int_high: RegressionCoefficients
  predictor_cols: string[]
  reference_cell: number
  error: string | null
}

export interface LogitRegressionResult {
  model_type: 'Logit'
  n_obs: number
  pseudo_r_squared: number
  llr_pvalue: number
  coefficients: RegressionCoefficients
  odds_ratios: RegressionCoefficients
  std_errors: RegressionCoefficients
  p_values: RegressionCoefficients
  conf_int_low: RegressionCoefficients
  conf_int_high: RegressionCoefficients
  or_ci_low: RegressionCoefficients
  or_ci_high: RegressionCoefficients
  predictor_cols: string[]
  reference_cell: number
  error: string | null
}

export interface RegressionStats {
  /** Results keyed by reference_cell (1, 2, or 3) */
  [referenceCell: string]: OLSRegressionResult
}

export interface LogitStats {
  [referenceCell: string]: LogitRegressionResult
}

// ──────────────────────────────────────────────
// Correlation
// ──────────────────────────────────────────────

export interface CorrelationStats {
  columns: string[]
  n_obs: number
  corr_matrix: Record<string, Record<string, number>>
  pvalue_matrix: Record<string, Record<string, number | null>>
  error: string | null
}

// ──────────────────────────────────────────────
// Overview
// ──────────────────────────────────────────────

export interface ConceptSummary {
  concept_label: string
  claim_cell: number
  n: number
  mean_appeal: number
  mean_pi: number
  top2box_pct: number
}

export interface OverviewStats {
  total_n: number
  concept_distribution: ConceptSummary[]
}

// ──────────────────────────────────────────────
// Price Sensitivity
// ──────────────────────────────────────────────

export interface PricePointData {
  price_col: string
  price_label: string
  overall_mean: number
  by_concept: Record<string, number>
}

export interface PriceSensitivityStats {
  price_points: PricePointData[]
}

// ──────────────────────────────────────────────
// Crosstabs options
// ──────────────────────────────────────────────

export interface CrosstabVariable {
  column: string
  label: string
  value_labels: Record<string, string>
}

export interface CrosstabsOptions {
  row_variables: CrosstabVariable[]
  col_variables: CrosstabVariable[]
}
