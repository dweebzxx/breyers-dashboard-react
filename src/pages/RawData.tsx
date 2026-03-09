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
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q9: string
  q10: string
  q11: string
  q12: string
  q13: string
  q14: string
  q16: string
  q17a: string
  q17b: string
  q17c: string
  q17d: string
  q17e: string
  q18: string
  q19: string
  q20: string
  q21: string
  q22: string
  q23: string
  q24: string
  t2b: string
}

const helper = createColumnHelper<RowData>()

const COLUMNS = [
  helper.accessor('id', { header: 'Respondent ID', size: 120 }),
  helper.accessor('concept', { header: 'Concept Cell', size: 140 }),
  helper.accessor('q1', { header: 'Q1 Consent', size: 110 }),
  helper.accessor('q2', { header: 'Q2 Purchase Recent', size: 150 }),
  helper.accessor('q3', { header: 'Q3 Decision Role', size: 130 }),
  helper.accessor('q4', { header: 'Q4 Purchase Freq', size: 150 }),
  helper.accessor('q5', { header: 'Q5 Usual Channel', size: 130 }),
  helper.accessor('q9', { header: 'Q9 Tradeoff', size: 130 }),
  helper.accessor('q10', { header: 'Q10 Active Seeking', size: 150 }),
  helper.accessor('q11', { header: 'Q11 Appeal', size: 180 }),
  helper.accessor('q12', { header: 'Q12 Purchase Intent', size: 190 }),
  helper.accessor('t2b', { header: 'Top 2 Box PI', size: 120 }),
  helper.accessor('q13', { header: 'Q13 Replacement', size: 130 }),
  helper.accessor('q14', { header: 'Q14 Interest Comparison', size: 180 }),
  helper.accessor('q16', { header: 'Q16 Purchase Location', size: 160 }),
  helper.accessor('q17a', { header: 'Q17a $3.99', size: 130 }),
  helper.accessor('q17b', { header: 'Q17b $4.99', size: 130 }),
  helper.accessor('q17c', { header: 'Q17c $5.99', size: 130 }),
  helper.accessor('q17d', { header: 'Q17d $6.99', size: 130 }),
  helper.accessor('q17e', { header: 'Q17e $7.99', size: 130 }),
  helper.accessor('q18', { header: 'Q18 Price Too Expensive', size: 170 }),
  helper.accessor('q19', { header: 'Q19 Club Store 4-Pack', size: 160 }),
  helper.accessor('q20', { header: 'Q20 Online Delivery', size: 150 }),
  helper.accessor('q21', { header: 'Q21 Diet Focus', size: 150 }),
  helper.accessor('q22', { header: 'Q22 Household Type', size: 180 }),
  helper.accessor('q23', { header: 'Q23 Age Group', size: 130 }),
  helper.accessor('q24', { header: 'Q24 Income', size: 180 }),
]

const CONSENT_LABELS: Record<number, string> = { 1: 'Yes', 2: 'No' }
const PURCHASE_RECENT_LABELS: Record<number, string> = { 1: 'Yes', 2: 'No' }
const DECISION_LABELS: Record<number, string> = {
  1: 'Primary decision maker',
  2: 'Share equally',
  3: 'Other decides',
}
const FREQ_LABELS: Record<number, string> = {
  1: 'Weekly',
  2: '2-3x per month',
  3: 'Monthly',
  4: 'Less often',
}
const CHANNEL_LABELS: Record<number, string> = {
  1: 'Grocery store',
  2: 'Supercenter/Mass',
  3: 'Club store',
  4: 'Convenience store',
  5: 'Online delivery',
  6: 'Other',
}
const TRADEOFF_LABELS: Record<number, string> = {
  1: 'More taste / less health',
  2: 'Equal balance',
  3: 'More health / less taste',
}
const SEEKING_LABELS: Record<number, string> = {
  1: 'Yes, actively',
  2: 'Somewhat',
  3: 'No',
}
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
const REPLACEMENT_LABELS: Record<number, string> = {
  1: 'Yes',
  2: 'No',
  3: 'Not sure',
}
const INTEREST_LABELS: Record<number, string> = {
  1: 'Much less interested',
  2: 'Somewhat less interested',
  3: 'About the same',
  4: 'Somewhat more interested',
  5: 'Much more interested',
}
const LOCATION_LABELS: Record<number, string> = {
  1: 'Grocery store',
  2: 'Supercenter/Mass',
  3: 'Club store',
  4: 'Convenience store',
  5: 'Online delivery',
  6: 'Other',
}
const PRICE_LABELS: Record<number, string> = {
  1: 'Definitely would not buy',
  2: 'Probably would not buy',
  3: 'Might or might not buy',
  4: 'Probably would buy',
  5: 'Definitely would buy',
}
const PRICE_EXPENSIVE_LABELS: Record<number, string> = {
  1: '$4.99',
  2: '$5.99',
  3: '$6.99',
  4: '$7.99',
  5: 'None of the above',
}
const CLUB_LABELS: Record<number, string> = {
  1: 'Definitely would not buy',
  2: 'Probably would not buy',
  3: 'Might or might not buy',
  4: 'Probably would buy',
  5: 'Definitely would buy',
}
const ONLINE_LABELS: Record<number, string> = {
  1: 'Definitely would not buy',
  2: 'Probably would not buy',
  3: 'Might or might not buy',
  4: 'Probably would buy',
  5: 'Definitely would buy',
}
const DIET_LABELS: Record<number, string> = {
  1: 'Limit sugar',
  2: 'Increase protein',
  3: 'Both',
  4: 'Neither',
}
const HH_LABELS: Record<number, string> = {
  1: 'Live alone',
  2: 'With partner (no children)',
  3: 'With partner and children',
  4: 'Single parent',
  6: 'Other',
}
const AGE_LABELS: Record<number, string> = {
  1: '18–24',
  2: '25–34',
  3: '35–44',
  4: '45–54',
  5: '55–64',
  6: '65+',
}
const INCOME_LABELS: Record<number, string> = {
  1: 'Less than $25,000',
  2: '$25,000–$49,999',
  3: '$50,000–$74,999',
  4: '$75,000–$99,999',
  5: '$100,000–$149,999',
  6: '$150,000 or more',
  7: 'Prefer not to say',
}
const CONCEPT_SHORT: Record<number, string> = {
  1: 'Higher Protein',
  2: 'Low/Zero Sugar',
  3: 'Both Claims',
}

function lbl<T extends number | null | undefined>(
  map: Record<number, string>,
  val: T
): string {
  if (val == null) return '—'
  return map[val as number] ?? String(val)
}

export default function RawData() {
  const filtered = useFilteredRespondents()
  const [globalFilter, setGlobalFilter] = useState('')

  const tableData = useMemo((): RowData[] =>
    filtered.map(r => ({
      id: r['Respondent ID'] ?? r.RandomID,
      concept: CONCEPT_SHORT[r.ClaimCell] ?? String(r.ClaimCell),
      q1: lbl(CONSENT_LABELS, r.Q1_Consent),
      q2: lbl(PURCHASE_RECENT_LABELS, r.Q2_PurchaseRecent),
      q3: lbl(DECISION_LABELS, r.Q3_DecisionRole),
      q4: lbl(FREQ_LABELS, r.Q4_PurchaseFreq),
      q5: lbl(CHANNEL_LABELS, r.Q5_UsualChannel),
      q9: lbl(TRADEOFF_LABELS, r.Q9_Tradeoff),
      q10: lbl(SEEKING_LABELS, r.Q10_ActiveSeeking),
      q11: lbl(APPEAL_LABELS, r.Q11_Appeal),
      q12: lbl(PI_LABELS, r.Q12_PurchaseIntent),
      t2b: r.Top2Box_PI === 1 ? 'Top 2 Box' : 'Bottom 3 Box',
      q13: lbl(REPLACEMENT_LABELS, r.Q13_Replacement),
      q14: lbl(INTEREST_LABELS, r.Q14_InterestComparison),
      q16: lbl(LOCATION_LABELS, r.Q16_PurchaseLocation),
      q17a: lbl(PRICE_LABELS, r.Q17a_Price399),
      q17b: lbl(PRICE_LABELS, r.Q17b_Price499),
      q17c: lbl(PRICE_LABELS, r.Q17c_Price599),
      q17d: lbl(PRICE_LABELS, r.Q17d_Price699),
      q17e: lbl(PRICE_LABELS, r.Q17e_Price799),
      q18: lbl(PRICE_EXPENSIVE_LABELS, r.Q18_PriceTooExpensive),
      q19: lbl(CLUB_LABELS, r.Q19_ClubStore4Pack),
      q20: lbl(ONLINE_LABELS, r.Q20_OnlineDelivery),
      q21: lbl(DIET_LABELS, r.Q21_DietFocus),
      q22: lbl(HH_LABELS, r.Q22_HouseholdType),
      q23: lbl(AGE_LABELS, r.Q23_Age),
      q24: lbl(INCOME_LABELS, r.Q24_Income),
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
      Object.values(r)
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
          Full respondent-level data with human-readable labels (Q1–Q24)
        </p>
      </div>

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

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(h => (
                    <TableHead
                      key={h.id}
                      style={{ minWidth: h.column.columnDef.size }}
                      className="whitespace-nowrap"
                    >
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
                      <TableCell key={cell.id} className="text-sm whitespace-nowrap">
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
