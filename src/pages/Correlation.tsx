import { useDataStore } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COL_LABELS: Record<string, string> = {
  Q8_AttrImportance_1: 'Taste',
  Q8_AttrImportance_2: 'Price',
  Q8_AttrImportance_3: 'Brand Rep.',
  Q8_AttrImportance_4: 'Low Sugar',
  Q8_AttrImportance_5: 'High Protein',
  Q8_AttrImportance_6: 'Clean Ingr.',
  Q8_AttrImportance_7: 'Low Calorie',
  Q11_Appeal: 'Appeal',
  Q12_PurchaseIntent: 'Purch. Intent',
}

function corrCellStyle(r: number | null): React.CSSProperties {
  if (r === null) {
    return { backgroundColor: '#e5e7eb', color: '#6b7280' }
  }
  const abs = Math.abs(r)
  if (r > 0) {
    const other = Math.round(255 - abs * 160)
    const bg = `rgb(${other}, ${other + 10}, ${255})`
    const fg = abs > 0.45 ? '#ffffff' : '#1f2937'
    return { backgroundColor: bg, color: fg }
  } else {
    const red = 255
    const other = Math.round(255 - abs * 160)
    const bg = `rgb(${red}, ${other}, ${other})`
    const fg = abs > 0.45 ? '#ffffff' : '#1f2937'
    return { backgroundColor: bg, color: fg }
  }
}

function sigStars(pvalue: number | null): string {
  if (pvalue === null) return ''
  if (pvalue < 0.01) return '**'
  if (pvalue < 0.05) return '*'
  return ''
}

export default function Correlation() {
  const corrStats = useDataStore(s => s.correlationStats)

  if (!corrStats) {
    return <p className="text-muted-foreground p-4">Loading correlation data...</p>
  }

  const cols = corrStats.columns

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Correlation Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pearson correlation matrix for attribute importance ratings, appeal, and purchase intent
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Pearson Correlation Matrix (n = {corrStats.n_obs})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left font-medium text-muted-foreground min-w-[120px]">
                  Variable
                </th>
                {cols.map(c => (
                  <th
                    key={c}
                    className="px-2 py-2 text-center font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {COL_LABELS[c] ?? c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cols.map(row => (
                <tr key={row} className="border-t border-border/40">
                  <td className="px-2 py-2 font-medium whitespace-nowrap text-sm">
                    {COL_LABELS[row] ?? row}
                  </td>
                  {cols.map(col => {
                    const r = corrStats.corr_matrix[row]?.[col] ?? null
                    const p = corrStats.pvalue_matrix[row]?.[col] ?? null
                    const isDiagonal = row === col
                    const style = corrCellStyle(isDiagonal ? null : r)
                    const stars = isDiagonal ? '' : sigStars(p)
                    return (
                      <td
                        key={col}
                        className="px-2 py-2 text-center tabular-nums rounded"
                        style={style}
                      >
                        {isDiagonal ? (
                          <span className="text-muted-foreground">--</span>
                        ) : (
                          <>
                            <span>{r !== null ? r.toFixed(2) : 'N/A'}</span>
                            {stars && (
                              <span className="ml-0.5 font-bold text-amber-600">{stars}</span>
                            )}
                          </>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: 'rgb(55, 90, 255)' }} />
          <span>Strong positive correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: 'rgb(185, 185, 255)' }} />
          <span>Weak positive correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: '#e5e7eb' }} />
          <span>Diagonal (self-correlation)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: 'rgb(255, 185, 185)' }} />
          <span>Weak negative correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-600">*</span>
          <span>p &lt; 0.05</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-600">**</span>
          <span>p &lt; 0.01</span>
        </div>
      </div>

      {/* Full-label reference */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Variable Reference</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
            {cols.map(c => (
              <div key={c} className="flex gap-2">
                <span className="font-medium text-foreground w-28 shrink-0">
                  {COL_LABELS[c] ?? c}
                </span>
                <span className="text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Scale (Attribute Importance): 1 = Not at all important, 5 = Extremely important.
            Appeal (Q11): 1 = Not at all appealing, 5 = Extremely appealing.
            Purchase Intent (Q12): 1 = Very unlikely, 5 = Very likely.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
