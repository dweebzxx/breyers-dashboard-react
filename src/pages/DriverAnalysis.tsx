import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Info } from 'lucide-react'
import { useDataStore, useFilteredRespondents } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const PREDICTOR_LABELS: Record<string, string> = {
  const: 'Intercept',
  Q8_AttrImportance_1: 'Taste',
  Q8_AttrImportance_2: 'Price',
  Q8_AttrImportance_3: 'Brand Reputation',
  Q8_AttrImportance_4: 'Low/Zero Sugar',
  Q8_AttrImportance_5: 'High Protein',
  Q8_AttrImportance_6: 'Clean Ingredients',
  Q8_AttrImportance_7: 'Low Calorie',
  ClaimCell_HighProtein: 'Concept: Higher Protein (vs ref)',
  ClaimCell_LowSugar: 'Concept: Low Sugar (vs ref)',
  ClaimCell_Both: 'Concept: Both Claims (vs ref)',
}

const DUMMY_KEYS = ['ClaimCell_HighProtein', 'ClaimCell_LowSugar', 'ClaimCell_Both']

const REF_OPTIONS = [
  { value: '1', label: 'Higher Protein' },
  { value: '2', label: 'Low Sugar (default)' },
  { value: '3', label: 'Both Claims' },
]

interface OLSRow {
  predictor: string
  coef: number
  se: number
  pvalue: number
  ciLow: number
  ciHigh: number
}

interface LogitRow {
  predictor: string
  coef: number
  or: number
  se: number
  pvalue: number
  orCiLow: number
  orCiHigh: number
}

const olsHelper = createColumnHelper<OLSRow>()
const logitHelper = createColumnHelper<LogitRow>()

function fmt2(v: number) { return v.toFixed(2) }
function fmt4(v: number) {
  if (v < 0.001) return '< 0.001'
  return v.toFixed(4)
}

export default function DriverAnalysis() {
  const [refCell, setRefCell] = useState('2')
  const olsStats = useDataStore(s => s.regressionOLSStats)
  const logitStats = useDataStore(s => s.regressionLogitStats)
  const questionText = useDataStore(s => s.questionText)
  const filtered = useFilteredRespondents()

  // Check if dummies should be shown
  const uniqueCells = useMemo(
    () => new Set(filtered.map(r => r.ClaimCell)),
    [filtered]
  )
  const showDummies = uniqueCells.size > 1

  const ols = olsStats?.[refCell]
  const logit = logitStats?.[refCell]

  // Build OLS rows
  const olsRows = useMemo((): OLSRow[] => {
    if (!ols) return []
    const predictors = ['const', ...ols.predictor_cols]
    return predictors
      .filter(p => showDummies || !DUMMY_KEYS.includes(p))
      .map(p => ({
        predictor: PREDICTOR_LABELS[p] ?? p,
        coef: ols.coefficients[p],
        se: ols.std_errors[p],
        pvalue: ols.p_values[p],
        ciLow: ols.conf_int_low[p],
        ciHigh: ols.conf_int_high[p],
      }))
  }, [ols, showDummies])

  // Build Logit rows
  const logitRows = useMemo((): LogitRow[] => {
    if (!logit) return []
    const predictors = ['const', ...logit.predictor_cols]
    return predictors
      .filter(p => showDummies || !DUMMY_KEYS.includes(p))
      .map(p => ({
        predictor: PREDICTOR_LABELS[p] ?? p,
        coef: logit.coefficients[p],
        or: logit.odds_ratios[p],
        se: logit.std_errors[p],
        pvalue: logit.p_values[p],
        orCiLow: logit.or_ci_low[p],
        orCiHigh: logit.or_ci_high[p],
      }))
  }, [logit, showDummies])

  const olsColumns = [
    olsHelper.accessor('predictor', { header: 'Predictor', cell: i => <span className="font-medium">{i.getValue()}</span> }),
    olsHelper.accessor('coef', { header: 'Coefficient', cell: i => <span className="tabular-nums">{fmt2(i.getValue())}</span> }),
    olsHelper.accessor('se', { header: 'Std. Error', cell: i => <span className="tabular-nums">{fmt2(i.getValue())}</span> }),
    olsHelper.accessor('pvalue', {
      header: 'p-value',
      cell: i => {
        const p = i.getValue()
        return (
          <span className={cn('tabular-nums', p < 0.05 && 'text-green-700 font-semibold')}>
            {fmt4(p)}
          </span>
        )
      },
    }),
    olsHelper.accessor(row => `[${fmt2(row.ciLow)}, ${fmt2(row.ciHigh)}]`, {
      id: 'ci',
      header: '95% CI',
      cell: i => <span className="tabular-nums text-xs">{i.getValue()}</span>,
    }),
  ]

  const logitColumns = [
    logitHelper.accessor('predictor', { header: 'Predictor', cell: i => <span className="font-medium">{i.getValue()}</span> }),
    logitHelper.accessor('coef', { header: 'Coefficient', cell: i => <span className="tabular-nums">{fmt2(i.getValue())}</span> }),
    logitHelper.accessor('or', { header: 'Odds Ratio', cell: i => <span className="tabular-nums">{fmt2(i.getValue())}</span> }),
    logitHelper.accessor('se', { header: 'Std. Error', cell: i => <span className="tabular-nums">{fmt2(i.getValue())}</span> }),
    logitHelper.accessor('pvalue', {
      header: 'p-value',
      cell: i => {
        const p = i.getValue()
        return (
          <span className={cn('tabular-nums', p < 0.05 && 'text-green-700 font-semibold')}>
            {fmt4(p)}
          </span>
        )
      },
    }),
    logitHelper.accessor(row => `[${fmt2(row.orCiLow)}, ${fmt2(row.orCiHigh)}]`, {
      id: 'orci',
      header: 'OR 95% CI',
      cell: i => <span className="tabular-nums text-xs">{i.getValue()}</span>,
    }),
  ]

  const olsTable = useReactTable({ data: olsRows, columns: olsColumns, getCoreRowModel: getCoreRowModel() })
  const logitTable = useReactTable({ data: logitRows, columns: logitColumns, getCoreRowModel: getCoreRowModel() })

  if (!ols || !logit) {
    return <p className="text-muted-foreground p-4">Loading regression results...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Driver Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          OLS and logistic regression identifying key drivers of purchase intent
        </p>
      </div>

      {/* Reference group selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap">ClaimCell Reference Group</label>
            <Select value={refCell} onValueChange={setRefCell}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REF_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              R&sup2; = {ols.r_squared.toFixed(3)} | F p-value: {ols.f_pvalue < 0.001 ? '< 0.001' : ols.f_pvalue.toFixed(4)} | N = {ols.n_obs}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Defensive alert when dummies hidden */}
      {!showDummies && (
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>Concept comparison variables removed</AlertTitle>
          <AlertDescription>
            Concept comparison variables removed due to filter selection. Only one concept cell is present in the filtered data.
          </AlertDescription>
        </Alert>
      )}

      {/* OLS Regression Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">OLS Regression</CardTitle>
          <CardDescription>
            Outcome: Purchase Intent (Q12, 1-5 scale) | Adj. R&sup2; = {ols.adj_r_squared.toFixed(3)}
          </CardDescription>
          {questionText?.['Q12_PurchaseIntent'] && (
            <p className="text-xs italic text-muted-foreground mt-0.5 leading-snug">
              {questionText['Q12_PurchaseIntent']}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {olsTable.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(h => (
                    <TableHead key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {olsTable.getRowModel().rows.map((row, idx) => {
                const isSignif = row.original.pvalue < 0.05
                const isIntercept = row.original.predictor === 'Intercept'
                const nextRow = olsTable.getRowModel().rows[idx + 1]
                const isLastBeforeDrivers = isIntercept && nextRow && nextRow.original.predictor !== 'Intercept'
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      isSignif ? 'bg-[#91b82b]/10 font-bold hover:bg-[#91b82b]/15' : '',
                      isLastBeforeDrivers ? 'border-b-2 border-border' : ''
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className={isSignif ? 'font-bold' : ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="px-4 pb-3 pt-1">
            <p className="text-xs text-muted-foreground">
              Bold highlighted rows indicate p &lt; 0.05. The Intercept row is separated by a border from the attribute drivers. Reference group: {REF_OPTIONS.find(o => o.value === refCell)?.label}.
              Scale: 1 = Not at all important, 5 = Extremely important (attribute importance predictors).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logit Regression Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Logistic Regression</CardTitle>
          <CardDescription>
            Outcome: Top 2 Box Purchase Intent (Likely/Very Likely) | Pseudo R&sup2; = {logit.pseudo_r_squared.toFixed(3)} | LLR p-value: {logit.llr_pvalue < 0.001 ? '< 0.001' : logit.llr_pvalue.toFixed(4)}
          </CardDescription>
          {questionText?.['Q12_PurchaseIntent'] && (
            <p className="text-xs italic text-muted-foreground mt-0.5 leading-snug">
              {questionText['Q12_PurchaseIntent']}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {logitTable.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(h => (
                    <TableHead key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {logitTable.getRowModel().rows.map((row, idx) => {
                const isSignif = row.original.pvalue < 0.05
                const isIntercept = row.original.predictor === 'Intercept'
                const nextRow = logitTable.getRowModel().rows[idx + 1]
                const isLastBeforeDrivers = isIntercept && nextRow && nextRow.original.predictor !== 'Intercept'
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      isSignif ? 'bg-[#91b82b]/10 font-bold hover:bg-[#91b82b]/15' : '',
                      isLastBeforeDrivers ? 'border-b-2 border-border' : ''
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className={isSignif ? 'font-bold' : ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="px-4 pb-3 pt-1">
            <p className="text-xs text-muted-foreground">
              Bold highlighted rows indicate p &lt; 0.05. The Intercept row is separated from attribute drivers. OR = Odds Ratio. Reference group: {REF_OPTIONS.find(o => o.value === refCell)?.label}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Significance legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="success">p &lt; 0.05</Badge>
        <span>Statistically significant at the 5% level</span>
      </div>
    </div>
  )
}
