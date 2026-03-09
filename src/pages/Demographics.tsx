import { useMemo } from 'react'
import { useFilteredRespondents } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

const GROUP_COLORS = ['#91b82b', '#47a0d0', '#e1c4bd', '#d2b974', '#5a8834', '#000000']

const AGE_LABELS: Record<number, string> = {
  1: '18–24',
  2: '25–34',
  3: '35–44',
  4: '45–54',
  5: '55–64',
  6: '65+',
}
const INCOME_LABELS: Record<number, string> = {
  1: '<$25k',
  2: '$25–49k',
  3: '$50–74k',
  4: '$75–99k',
  5: '$100–149k',
  6: '$150k+',
  7: 'Prefer not',
}
const HH_LABELS: Record<number, string> = {
  1: 'Alone',
  2: 'Partner, no children',
  3: 'Partner + children',
  4: 'Single parent',
  6: 'Other',
}
const DIET_LABELS: Record<number, string> = {
  1: 'Limit sugar',
  2: 'Increase protein',
  3: 'Both',
  4: 'Neither',
}
const FREQ_LABELS: Record<number, string> = {
  1: 'Weekly',
  2: '2–3x/Month',
  3: 'Monthly',
  4: 'Less Often',
}
const CHANNEL_LABELS: Record<number, string> = {
  1: 'Grocery',
  2: 'Supercenter',
  3: 'Club store',
  4: 'Convenience',
  5: 'Online',
  6: 'Other',
}

function countBy(
  data: { val: number }[],
  labels: Record<number, string>
) {
  const counts: Record<number, number> = {}
  for (const { val } of data) {
    counts[val] = (counts[val] ?? 0) + 1
  }
  return Object.entries(labels).map(([k, label]) => ({
    label,
    count: counts[Number(k)] ?? 0,
  }))
}

interface DemoChartProps {
  title: string
  data: { label: string; count: number }[]
  n: number
  variant?: 'bar' | 'pie'
}

function DemoChart({ title, data, n, variant = 'bar' }: DemoChartProps) {
  const withPct = data.map(d => ({
    ...d,
    pct: n > 0 ? ((d.count / n) * 100).toFixed(1) : '0.0',
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {n === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
        ) : variant === 'pie' ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={withPct.filter(d => d.count > 0)}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ label, pct }) => `${label} (${pct}%)`}
                labelLine={false}
              >
                {withPct.filter(d => d.count > 0).map((_, i) => (
                  <Cell key={i} fill={GROUP_COLORS[i % GROUP_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number, name: string) => [
                  `${val} (${withPct.find(d => d.label === name)?.pct ?? ''}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={withPct}
              margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(val: number, _name: string, props) => [
                  `${val} (${props.payload.pct}%)`,
                  'Count',
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {withPct.map((_, i) => (
                  <Cell key={i} fill={GROUP_COLORS[i % GROUP_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default function Demographics() {
  const filtered = useFilteredRespondents()
  const n = filtered.length

  const ageData = useMemo(
    () => countBy(filtered.map(r => ({ val: r.Q23_Age })), AGE_LABELS),
    [filtered]
  )
  const incomeData = useMemo(
    () => countBy(filtered.map(r => ({ val: r.Q24_Income })), INCOME_LABELS),
    [filtered]
  )
  const hhData = useMemo(
    () => countBy(filtered.map(r => ({ val: r.Q22_HouseholdType })), HH_LABELS),
    [filtered]
  )
  const dietData = useMemo(
    () => countBy(filtered.map(r => ({ val: r.Q21_DietFocus })), DIET_LABELS),
    [filtered]
  )
  const freqData = useMemo(
    () => countBy(filtered.map(r => ({ val: r.Q4_PurchaseFreq })), FREQ_LABELS),
    [filtered]
  )
  const channelData = useMemo(
    () => countBy(filtered.map(r => ({ val: r.Q5_UsualChannel })), CHANNEL_LABELS),
    [filtered]
  )

  const brandCounts = useMemo(() => {
    const brands = [
      { key: 'Brand_Breyers', label: 'Breyers' },
      { key: 'Brand_BenJerrys', label: "Ben & Jerry's" },
      { key: 'Brand_HaloTop', label: 'Halo Top' },
      { key: 'Brand_Enlightened', label: 'Enlightened' },
      { key: 'Brand_Nicks', label: "Nick's" },
      { key: 'Brand_StorePrivate', label: 'Store Brand' },
      { key: 'Brand_LocalRegional', label: 'Local/Regional' },
    ]
    return brands.map(b => ({
      label: b.label,
      count: filtered.filter(r => r[b.key as keyof typeof r]).length,
      pct: n > 0 ? ((filtered.filter(r => r[b.key as keyof typeof r]).length / n) * 100).toFixed(1) : '0.0',
    })).sort((a, b) => b.count - a.count)
  }, [filtered, n])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Demographics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Respondent profile breakdown across key demographic and behavioral variables
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <DemoChart title="Age Group (Q23)" data={ageData} n={n} />
        <DemoChart title="Household Income (Q24)" data={incomeData} n={n} />
        <DemoChart title="Household Type (Q22)" data={hhData} n={n} />
        <DemoChart title="Diet Focus (Q21)" data={dietData} n={n} variant="pie" />
        <DemoChart title="Ice Cream Purchase Frequency (Q4)" data={freqData} n={n} />
        <DemoChart title="Usual Purchase Channel (Q5)" data={channelData} n={n} />
      </div>

      {n > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Brands Purchased (Multi-Select)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={brandCounts}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(val: number, _name: string, props) => [
                    `${val} (${props.payload.pct}%)`,
                    'Count',
                  ]}
                />
                <Bar dataKey="count" fill="#47a0d0" radius={[0, 4, 4, 0]}>
                  {brandCounts.map((_, i) => (
                    <Cell key={i} fill={GROUP_COLORS[i % GROUP_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Respondents could select multiple brands. Percentages are out of filtered N = {n}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
