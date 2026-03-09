import { useFilteredRespondents } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScaleFootnote } from '@/components/ScaleFootnote'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const CONCEPT_SHORT: Record<number, string> = {
  1: 'Higher Protein',
  2: 'Low/Zero Sugar',
  3: 'Both Claims',
}

const FREQ_LABELS: Record<number, string> = {
  1: 'Weekly',
  2: '2-3x/Month',
  3: 'Monthly',
  4: 'Less Often',
}

const CHART_COLORS = ['#2563eb', '#f59e0b', '#0d9488', '#7c3aed', '#dc2626']

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold text-foreground tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function Overview() {
  const filtered = useFilteredRespondents()
  const filteredN = filtered.length

  const t2bCount = filtered.filter(r => r.Top2Box_PI === 1).length
  const t2bPct = filteredN > 0 ? (t2bCount / filteredN) * 100 : 0
  const meanAppeal =
    filteredN > 0 ? filtered.reduce((s, r) => s + r.Q11_Appeal, 0) / filteredN : 0

  // Concept distribution sorted descending by n
  const conceptData = [1, 2, 3]
    .map(cell => {
      const subset = filtered.filter(r => r.ClaimCell === cell)
      return { concept: CONCEPT_SHORT[cell], n: subset.length }
    })
    .sort((a, b) => b.n - a.n)

  // Purchase frequency sorted descending by count
  const freqData = [1, 2, 3, 4]
    .map(key => ({
      label: FREQ_LABELS[key],
      count: filtered.filter(r => r.Q4_PurchaseFreq === key).length,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Executive Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Summary statistics for Breyers Better For You ice cream concept study
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Total Respondents (N)"
          value={String(filteredN)}
          sub="Filtered respondents"
        />
        <KpiCard
          label="Top 2 Box Purchase Intent"
          value={`${t2bPct.toFixed(1)}%`}
          sub="Likely or Very Likely"
        />
        <KpiCard
          label="Average Appeal"
          value={meanAppeal.toFixed(2)}
          sub="Scale: 1 to 5"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Concept distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Concept Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredN === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={conceptData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="concept"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(val: number) => [val, 'Respondents (n)']}
                    />
                    <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                      {conceptData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <ScaleFootnote scale="Bars sorted by respondent count (descending)" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Purchase frequency */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Purchase Frequency (Q4)</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredN === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={freqData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(val: number) => [val, 'Respondents (n)']}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <ScaleFootnote scale="Ice cream purchase frequency (sorted descending)" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Concept summary table */}
      {filteredN > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Concept Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Concept</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">n</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Mean Appeal</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Mean PI</th>
                  <th className="text-right py-2 pl-2 font-medium text-muted-foreground">T2B%</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(cell => {
                  const subset = filtered.filter(r => r.ClaimCell === cell)
                  const n = subset.length
                  const appeal = n > 0 ? subset.reduce((s, r) => s + r.Q11_Appeal, 0) / n : 0
                  const pi = n > 0 ? subset.reduce((s, r) => s + r.Q12_PurchaseIntent, 0) / n : 0
                  const t2b = n > 0 ? (subset.filter(r => r.Top2Box_PI === 1).length / n) * 100 : 0
                  return (
                    <tr key={cell} className="border-b last:border-0">
                      <td className="py-2 pr-4">Breyers {CONCEPT_SHORT[cell]}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{n}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{appeal.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{pi.toFixed(2)}</td>
                      <td className="py-2 pl-2 text-right tabular-nums">{t2b.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Acknowledgments */}
      <p className="text-xs text-muted-foreground border-t pt-4">
        Acknowledgments: Dashboard architecture, data processing, and code generation were assisted by an AI coding agent.
      </p>
    </div>
  )
}
