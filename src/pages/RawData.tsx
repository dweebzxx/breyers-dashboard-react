import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { useFilteredRespondents } from '@/store/dataStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type RowData = {
  id: string
  concept: string
  appeal: string
  purchaseIntent: string
  t2b: string
  purchaseFreq: string
  dietFocus: string
  age: string
  income: string
  householdType: string
}

const helper = createColumnHelper<RowData>()

const COLUMNS = [
  helper.accessor('id', { header: 'Respondent ID', size: 110 }),
  helper.accessor('concept', { header: 'Concept Cell', size: 140 }),
  helper.accessor('purchaseFreq', { header: 'Purchase Freq.', size: 130 }),
  helper.accessor('appeal', { header: 'Appeal (Q11)', size: 120 }),
  helper.accessor('purchaseIntent', { header: 'Purchase Intent (Q12)', size: 150 }),
  helper.accessor('t2b', { header: 'Top 2 Box PI', size: 120 }),
  helper.accessor('dietFocus', { header: 'Diet Focus (Q21)', size: 130 }),
  helper.accessor('age', { header: 'Age Group (Q23)', size: 130 }),
  helper.accessor('income', { header: 'Income (Q24)', size: 150 }),
  helper.accessor('householdType', { header: 'Household Type', size: 180 }),
]

const APPEAL_LABELS: Record<number, string> = {
  1: 'Not at all appealing',
  2: 'Slightly appealing',
  3: 'Moderately appealing',
  4: 'Very appealing',
  5: 'Extremely appealing',
}

const PI_LABELS: Record<number, string> = {
  1: 'Very unlikely',
  2: 'Unlikely',
  3: 'Neither likely nor unlikely',
  4: 'Likely',
  5: 'Very likely',
}

const FREQ_LABELS: Record<number, string> = {
  1: 'Weekly',
  2: '2-3 times per month',
  3: 'Monthly',
  4: 'Less often',
}

const DIET_LABELS: Record<number, string> = {
  1: 'Limit sugar',
  2: 'Increase protein',
  3: 'Both',
  4: 'Neither',
}

const AGE_LABELS: Record<number, string> = {
  1: '18-24',
  2: '25-34',
  3: '35-44',
  4: '45-54',
  5: '55-64',
  6: '65+',
}

const INCOME_LABELS: Record<number, string> = {
  1: 'Less than $25,000',
  2: '$25,000-$49,999',
  3: '$50,000-$74,999',
  4: '$75,000-$99,999',
  5: '$100,000-$149,999',
  6: '$150,000 or more',
  7: 'Prefer not to say',
}

const HH_LABELS: Record<number, string> = {
  1: 'Live alone',
  2: 'With partner (no children)',
  3: 'With partner and children',
  4: 'Single parent',
  6: 'Other',
}

const CONCEPT_SHORT: Record<number, string> = {
  1: 'Higher Protein',
  2: 'Low/Zero Sugar',
  3: 'Both Claims',
}

export default function RawData() {
  const filtered = useFilteredRespondents()
  const [globalFilter, setGlobalFilter] = useState('')

  const tableData = useMemo((): RowData[] =>
    filtered.map(r => ({
      id: r['Respondent ID'] ?? r.RandomID,
      concept: CONCEPT_SHORT[r.ClaimCell] ?? String(r.ClaimCell),
      appeal: APPEAL_LABELS[r.Q11_Appeal] ?? String(r.Q11_Appeal),
      purchaseIntent: PI_LABELS[r.Q12_PurchaseIntent] ?? String(r.Q12_PurchaseIntent),
      t2b: r.Top2Box_PI === 1 ? 'Top 2 Box' : 'Bottom 3 Box',
      purchaseFreq: FREQ_LABELS[r.Q4_PurchaseFreq] ?? String(r.Q4_PurchaseFreq),
      dietFocus: DIET_LABELS[r.Q21_DietFocus] ?? String(r.Q21_DietFocus),
      age: AGE_LABELS[r.Q23_Age] ?? String(r.Q23_Age),
      income: INCOME_LABELS[r.Q24_Income] ?? String(r.Q24_Income),
      householdType: HH_LABELS[r.Q22_HouseholdType] ?? String(r.Q22_HouseholdType),
    })),
    [filtered]
  )

  const table = useReactTable({
    data: tableData,
    columns: COLUMNS,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  })

  const downloadCSV = () => {
    const headers = COLUMNS.map(c => String(c.header ?? '')).join(',')
    const rows = tableData.map(r =>
      [r.id, r.concept, r.purchaseFreq, r.appeal, r.purchaseIntent, r.t2b, r.dietFocus, r.age, r.income, r.householdType]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'breyers-survey-filtered.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const { pageIndex, pageSize } = table.getState().pagination
  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageStart = pageIndex * pageSize + 1
  const pageEnd = Math.min((pageIndex + 1) * pageSize, totalFiltered)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Raw Data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Respondent-level data with human-readable labels
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Input
          placeholder="Search respondents..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalFiltered} respondents
          </span>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(h => (
                    <TableHead key={h.id} style={{ minWidth: h.column.columnDef.size }}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} className="text-center py-8 text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {totalFiltered > 0
            ? `Showing ${pageStart} to ${pageEnd} of ${totalFiltered} results`
            : 'No results'}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
