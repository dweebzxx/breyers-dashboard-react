import { useState, useMemo } from 'react'
import { useDataStore, useFilteredRespondents } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChiStatCard } from '@/components/StatCard'
import { computeChiSquare } from '@/lib/stats'
import type { Respondent } from '@/types/survey'

function getRespondentValue(r: Respondent, col: string): number | null {
  const val = (r as unknown as Record<string, unknown>)[col]
  if (typeof val === 'number') return val
  return null
}

export default function Crosstabs() {
  const crosstabsOptions = useDataStore(s => s.crosstabsOptions)
  const filtered = useFilteredRespondents()

  const rowVars = crosstabsOptions?.row_variables ?? []
  const colVars = crosstabsOptions?.col_variables ?? []

  const [rowVarKey, setRowVarKey] = useState(rowVars[0]?.column ?? '')
  const [colVarKey, setColVarKey] = useState(colVars[0]?.column ?? '')

  const rowVarDef = rowVars.find(v => v.column === rowVarKey)
  const colVarDef = colVars.find(v => v.column === colVarKey)

  // Sorted numeric keys for row and col
  const rowKeys = Object.keys(rowVarDef?.value_labels ?? {}).map(Number).sort((a, b) => a - b)
  const colKeys = Object.keys(colVarDef?.value_labels ?? {}).map(Number).sort((a, b) => a - b)

  // Build frequency matrix
  const { matrix, rowTotals, colTotals, grandTotal } = useMemo(() => {
    const matrix = rowKeys.map(rk =>
      colKeys.map(ck =>
        filtered.filter(r => getRespondentValue(r, rowVarKey) === rk && getRespondentValue(r, colVarKey) === ck).length
      )
    )
    const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0))
    const colTotals = colKeys.map((_, ci) => matrix.reduce((s, row) => s + row[ci], 0))
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0)
    return { matrix, rowTotals, colTotals, grandTotal }
  }, [filtered, rowVarKey, colVarKey, rowKeys.join(','), colKeys.join(',')])

  const chiResult = useMemo(() => computeChiSquare(matrix), [matrix])

  if (!crosstabsOptions) {
    return <p className="text-muted-foreground p-4">Loading crosstabs options...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Crosstabs Tool</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Frequency cross-tabulation with chi-square test of independence
        </p>
      </div>

      {/* Variable selectors */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Row Variable</label>
              <Select value={rowVarKey} onValueChange={setRowVarKey}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rowVars.map(v => (
                    <SelectItem key={v.column} value={v.column}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Column Variable</label>
              <Select value={colVarKey} onValueChange={setColVarKey}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colVars.map(v => (
                    <SelectItem key={v.column} value={v.column}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Frequency matrix */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {rowVarDef?.label ?? rowVarKey} by {colVarDef?.label ?? colVarKey}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            {grandTotal === 0 ? (
              <p className="text-sm text-muted-foreground p-6">No data for the current filter selection.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                      {rowVarDef?.label}
                    </th>
                    {colKeys.map(ck => (
                      <th key={ck} className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                        {colVarDef?.value_labels[String(ck)] ?? String(ck)}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-right font-medium text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rowKeys.map((rk, ri) => (
                    <tr key={rk} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium">
                        {rowVarDef?.value_labels[String(rk)] ?? String(rk)}
                      </td>
                      {colKeys.map((_, ci) => {
                        const count = matrix[ri]?.[ci] ?? 0
                        const rowPct = rowTotals[ri] > 0 ? ((count / rowTotals[ri]) * 100).toFixed(1) : '0.0'
                        return (
                          <td key={ci} className="px-3 py-2.5 text-right tabular-nums">
                            <span className="font-semibold">{count}</span>
                            <span className="text-xs text-muted-foreground ml-1">({rowPct}%)</span>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold bg-muted/10">
                        {rowTotals[ri]}
                      </td>
                    </tr>
                  ))}
                  {/* Column totals row */}
                  <tr className="border-t bg-muted/20">
                    <td className="px-4 py-2.5 font-semibold">Total</td>
                    {colTotals.map((ct, ci) => (
                      <td key={ci} className="px-3 py-2.5 text-right tabular-nums font-semibold">{ct}</td>
                    ))}
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold bg-muted/20">{grandTotal}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {grandTotal > 0 && (
              <p className="px-4 pb-3 pt-1 text-xs text-muted-foreground">
                Cell format: Count (Row %). N = {grandTotal}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Chi-square result */}
        <div>
          {grandTotal > 0 && chiResult.df > 0 ? (
            <ChiStatCard
              title="Chi-Square Test"
              chi2={chiResult.chi2}
              df={chiResult.df}
              pvalue={chiResult.pvalue}
              n={chiResult.n}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Chi-square requires at least 2 rows and 2 columns with data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
