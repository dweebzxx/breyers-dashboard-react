import { useState } from 'react'
import { useDataStore } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScaleFootnote } from '@/components/ScaleFootnote'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const CONCEPT_LABELS: Record<string, string> = {
  'with higher protein': 'Higher Protein',
  'with low or zero added sugar': 'Low/Zero Sugar',
  'with higher protein and low or zero added sugar': 'Both Claims',
}

const CONCEPT_COLORS: Record<string, string> = {
  'with higher protein': '#2563eb',
  'with low or zero added sugar': '#f59e0b',
  'with higher protein and low or zero added sugar': '#0d9488',
}

export default function PriceSensitivity() {
  const [showBreakout, setShowBreakout] = useState(false)
  const priceStats = useDataStore(s => s.priceSensitivityStats)

  if (!priceStats) {
    return <p className="text-muted-foreground p-4">Loading price sensitivity data...</p>
  }

  const concepts = Object.keys(priceStats.price_points[0]?.by_concept ?? {})

  // Build line chart data
  const chartData = priceStats.price_points.map(pp => {
    const row: Record<string, string | number> = { price: pp.price_label, overall: pp.overall_mean }
    if (showBreakout) {
      concepts.forEach(c => {
        row[CONCEPT_LABELS[c] ?? c] = pp.by_concept[c]
      })
    }
    return row
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Price Sensitivity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mean purchase likelihood across price points ($3.99 to $7.99)
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={showBreakout ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowBreakout(!showBreakout)}
        >
          {showBreakout ? 'Hide Concept Breakout' : 'Show Concept Breakout'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {showBreakout ? 'Showing one line per concept' : 'Showing overall mean'}
        </span>
      </div>

      {/* Line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Purchase Likelihood by Price Point
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="price" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis
                domain={[1, 5]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(val: number, name: string) => [val.toFixed(2), name]}
              />
              {(showBreakout || true) && <Legend wrapperStyle={{ fontSize: 12 }} />}

              {!showBreakout && (
                <Line
                  type="monotone"
                  dataKey="overall"
                  name="Overall Mean"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#2563eb' }}
                  activeDot={{ r: 7 }}
                />
              )}

              {showBreakout &&
                concepts.map(c => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={CONCEPT_LABELS[c] ?? c}
                    stroke={CONCEPT_COLORS[c] ?? '#888'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
          <ScaleFootnote scale="1 = Very unlikely, 5 = Very likely to purchase at this price" />
        </CardContent>
      </Card>

      {/* Price sensitivity data table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mean Purchase Likelihood by Price and Concept</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Overall</th>
                {concepts.map(c => (
                  <th key={c} className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                    {CONCEPT_LABELS[c] ?? c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priceStats.price_points.map((pp, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">{pp.price_label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {pp.overall_mean.toFixed(2)}
                  </td>
                  {concepts.map(c => (
                    <td key={c} className="px-3 py-2.5 text-right tabular-nums">
                      {(pp.by_concept[c] ?? 0).toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 pb-3 pt-1 text-xs text-muted-foreground">
            Scale: 1 = Very unlikely, 5 = Very likely. Pre-computed from full sample (n = 169).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
