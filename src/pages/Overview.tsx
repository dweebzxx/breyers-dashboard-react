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

const CHART_COLORS = ['#91b82b', '#47a0d0', '#e1c4bd', '#d2b974', '#5a8834']

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

interface Insight {
  label: string
  detail: string
  color: string
}

function buildInsights(
  filtered: ReturnType<typeof useFilteredRespondents>,
  n: number
): Insight[] {
  if (n === 0) return []

  const insights: Insight[] = []

  const t2bPct = (filtered.filter(r => r.Top2Box_PI === 1).length / n) * 100
  const bestCell = [1, 2, 3]
    .map(c => {
      const sub = filtered.filter(r => r.ClaimCell === c)
      return { cell: c, t2b: sub.length > 0 ? (sub.filter(r => r.Top2Box_PI === 1).length / sub.length) * 100 : 0 }
    })
    .sort((a, b) => b.t2b - a.t2b)[0]

  insights.push({
    label: 'Purchase Intent',
    detail: `${t2bPct.toFixed(1)}% of respondents rate purchase intent in the top 2 box (Likely or Very Likely).`,
    color: '#91b82b',
  })

  insights.push({
    label: 'Strongest Concept',
    detail: `${CONCEPT_SHORT[bestCell.cell]} leads with ${bestCell.t2b.toFixed(1)}% Top 2 Box purchase intent.`,
    color: '#47a0d0',
  })

  const meanAppeal = filtered.reduce((s, r) => s + r.Q11_Appeal, 0) / n
  const appealBenchmark = meanAppeal >= 3.5 ? 'above' : 'below'
  insights.push({
    label: 'Concept Appeal',
    detail: `Average appeal score is ${meanAppeal.toFixed(2)} out of 5 — ${appealBenchmark} the midpoint of the scale.`,
    color: '#d2b974',
  })

  const proteinDiet = filtered.filter(r => r.Q21_DietFocus === 2 || r.Q21_DietFocus === 3).length
  const proteinPct = (proteinDiet / n) * 100
  insights.push({
    label: 'Protein-Focused Audience',
    detail: `${proteinPct.toFixed(0)}% of respondents are actively trying to increase protein intake — a key target for higher-protein claims.`,
    color: '#5a8834',
  })

  const sugarDiet = filtered.filter(r => r.Q21_DietFocus === 1 || r.Q21_DietFocus === 3).length
  const sugarPct = (sugarDiet / n) * 100
  insights.push({
    label: 'Sugar-Conscious Audience',
    detail: `${sugarPct.toFixed(0)}% of respondents are limiting sugar — a strong base for the low/zero sugar concept.`,
    color: '#e1c4bd',
  })

  const weekly = filtered.filter(r => r.Q4_PurchaseFreq === 1).length
  const weeklyPct = (weekly / n) * 100
  insights.push({
    label: 'Frequent Buyers',
    detail: `${weeklyPct.toFixed(0)}% of respondents purchase ice cream weekly, indicating a high-engagement consumer base.`,
    color: '#000000',
  })

  return insights
}

export default function Overview() {
  const filtered = useFilteredRespondents()
  const filteredN = filtered.length

  const t2bCount = filtered.filter(r => r.Top2Box_PI === 1).length
  const t2bPct = filteredN > 0 ? (t2bCount / filteredN) * 100 : 0
  const meanAppeal =
    filteredN > 0 ? filtered.reduce((s, r) => s + r.Q11_Appeal, 0) / filteredN : 0

  const insights = buildInsights(filtered, filteredN)

  const conceptData = [1, 2, 3]
    .map(cell => {
      const subset = filtered.filter(r => r.ClaimCell === cell)
      return { concept: CONCEPT_SHORT[cell], n: subset.length }
    })
    .sort((a, b) => b.n - a.n)

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

      {/* Top Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border p-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: insight.color }}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{insight.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <Bar dataKey="count" fill="#47a0d0" radius={[4, 4, 0, 0]} />
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
