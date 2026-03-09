import { useState } from 'react'
import { useDataStore, useFilteredRespondents } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/StatCard'
import { ScaleFootnote } from '@/components/ScaleFootnote'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'

const CONCEPTS = [
  { value: 'with higher protein', label: 'Higher Protein' },
  { value: 'with low or zero added sugar', label: 'Low/Zero Sugar' },
  { value: 'with higher protein and low or zero added sugar', label: 'Both Claims' },
]

const CONCEPT_COLORS: Record<string, string> = {
  'with higher protein': '#91b82b',
  'with low or zero added sugar': '#e1c4bd',
  'with higher protein and low or zero added sugar': '#47a0d0',
}

function QuestionSubtitle({ text }: { text: string }) {
  return <p className="text-xs italic text-muted-foreground mt-0.5 mb-2 leading-snug">{text}</p>
}

export default function ConceptPerformance() {
  const [groupA, setGroupA] = useState(CONCEPTS[0].value)
  const [groupB, setGroupB] = useState(CONCEPTS[1].value)
  const filtered = useFilteredRespondents()
  const conceptStats = useDataStore(s => s.conceptPerformanceStats)
  const questionText = useDataStore(s => s.questionText)

  const getConceptStats = (conceptLabel: string) => {
    const subset = filtered.filter(r => r.ConceptLabel === conceptLabel)
    if (subset.length === 0) return null
    const meanAppeal = subset.reduce((s, r) => s + r.Q11_Appeal, 0) / subset.length
    const meanPI = subset.reduce((s, r) => s + r.Q12_PurchaseIntent, 0) / subset.length
    return { n: subset.length, meanAppeal, meanPI }
  }

  const statsA = getConceptStats(groupA)
  const statsB = getConceptStats(groupB)

  const findTTest = (metric: 'appeal' | 'purchase_intent') => {
    if (!conceptStats) return null
    return conceptStats[metric].find(
      p =>
        (p.group1 === groupA && p.group2 === groupB) ||
        (p.group1 === groupB && p.group2 === groupA)
    ) ?? null
  }

  const appealTTest = findTTest('appeal')
  const piTTest = findTTest('purchase_intent')

  const labelA = CONCEPTS.find(c => c.value === groupA)?.label ?? groupA
  const labelB = CONCEPTS.find(c => c.value === groupB)?.label ?? groupB

  const barData = [
    { metric: 'Appeal', [labelA]: statsA?.meanAppeal ?? 0, [labelB]: statsB?.meanAppeal ?? 0 },
    { metric: 'Purchase Intent', [labelA]: statsA?.meanPI ?? 0, [labelB]: statsB?.meanPI ?? 0 },
  ]

  const q11Text = questionText?.['Q11_Appeal'] ?? ''
  const q12Text = questionText?.['Q12_PurchaseIntent'] ?? ''

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Concept Performance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pairwise comparison of appeal and purchase intent between concept cells
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Group A</label>
              <Select value={groupA} onValueChange={setGroupA}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONCEPTS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground font-medium">vs</span>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Group B</label>
              <Select value={groupB} onValueChange={setGroupB}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONCEPTS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {statsA && statsB && (
              <span className="text-sm text-muted-foreground">
                n = {statsA.n} vs {statsB.n}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Q11: Appeal</CardTitle>
            {q11Text && <QuestionSubtitle text={q11Text} />}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: labelA, value: statsA?.meanAppeal ?? 0 },
                  { name: labelB, value: statsB?.meanAppeal ?? 0 },
                ]}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(val: number) => [val.toFixed(2), 'Mean Appeal']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[groupA, groupB].map((g, i) => (
                    <Cell key={i} fill={CONCEPT_COLORS[g] ?? '#91b82b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ScaleFootnote scale="1 = Not at all appealing, 5 = Extremely appealing" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Q12: Purchase Intent</CardTitle>
            {q12Text && <QuestionSubtitle text={q12Text} />}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: labelA, value: statsA?.meanPI ?? 0 },
                  { name: labelB, value: statsB?.meanPI ?? 0 },
                ]}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(val: number) => [val.toFixed(2), 'Mean Purchase Intent']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[groupA, groupB].map((g, i) => (
                    <Cell key={i} fill={CONCEPT_COLORS[g] ?? '#e1c4bd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ScaleFootnote scale="1 = Very unlikely, 5 = Very likely" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-base">Appeal and Purchase Intent by Concept</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(val: number) => val.toFixed(2)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey={labelA} fill={CONCEPT_COLORS[groupA] ?? '#91b82b'} radius={[4, 4, 0, 0]} />
              <Bar dataKey={labelB} fill={CONCEPT_COLORS[groupB] ?? '#e1c4bd'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <ScaleFootnote scale="1 = Least favorable, 5 = Most favorable" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {appealTTest ? (
          <StatCard
            title="T-Test: Appeal (Q11)"
            result={appealTTest.result}
            group1Label={labelA}
            group2Label={appealTTest.group1 === groupA ? labelB : labelA}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Select two different concepts to view the t-test.</p>
            </CardContent>
          </Card>
        )}

        {piTTest ? (
          <StatCard
            title="T-Test: Purchase Intent (Q12)"
            result={piTTest.result}
            group1Label={labelA}
            group2Label={piTTest.group1 === groupA ? labelB : labelA}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Select two different concepts to view the t-test.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
