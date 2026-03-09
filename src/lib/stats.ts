/**
 * Statistical utility functions for client-side computation.
 * Chi-square implementation based on Numerical Recipes algorithm.
 */

// Gamma function helpers
function gammln(xx: number): number {
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5,
  ]
  let y = xx
  const tmp = xx + 5.5
  let ser = 1.000000000190015
  for (const c of cof) {
    ser += c / ++y
  }
  return (xx + 0.5) * Math.log(tmp) - tmp + Math.log(2.5066282746310005 * ser / xx)
}

function gser(a: number, x: number): number {
  if (x <= 0) return 0
  let ap = a
  let del = 1 / a
  let sum = del
  for (let n = 0; n < 200; n++) {
    ap++
    del *= x / ap
    sum += del
    if (Math.abs(del) < Math.abs(sum) * 3e-7) break
  }
  return sum * Math.exp(-x + a * Math.log(x) - gammln(a))
}

function gcf(a: number, x: number): number {
  const FPMIN = 1e-300
  let b = x + 1 - a
  let c = 1 / FPMIN
  let d = 1 / b
  let h = d
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = b + an / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 3e-7) break
  }
  return Math.exp(-x + a * Math.log(x) - gammln(a)) * h
}

function gammp(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0
  if (x < a + 1) return gser(a, x)
  return 1 - gcf(a, x)
}

/** Returns the two-tailed p-value for a chi-square statistic. */
export function chiSquarePValue(chi2: number, df: number): number {
  if (chi2 <= 0 || df <= 0) return 1
  return 1 - gammp(df / 2, chi2 / 2)
}

export interface ChiSquareResult {
  chi2: number
  df: number
  pvalue: number
  n: number
}

/**
 * Computes Pearson chi-square from a 2D observed frequency matrix.
 * Each row is an array of column counts.
 */
export function computeChiSquare(matrix: number[][]): ChiSquareResult {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0
  if (rows < 2 || cols < 2) {
    return { chi2: 0, df: 0, pvalue: 1, n: 0 }
  }

  const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0))
  const colTotals = Array.from({ length: cols }, (_, j) =>
    matrix.reduce((sum, row) => sum + row[j], 0)
  )
  const n = rowTotals.reduce((a, b) => a + b, 0)

  if (n === 0) return { chi2: 0, df: 0, pvalue: 1, n: 0 }

  let chi2 = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / n
      if (expected > 0) {
        chi2 += (matrix[i][j] - expected) ** 2 / expected
      }
    }
  }

  const df = (rows - 1) * (cols - 1)
  return { chi2, df, pvalue: chiSquarePValue(chi2, df), n }
}
