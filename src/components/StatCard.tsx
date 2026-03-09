import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TTestResult } from '@/types/stats'

interface StatCardProps {
  title: string
  result: TTestResult
  group1Label?: string
  group2Label?: string
  className?: string
}

function fmt2(val: number | null): string {
  if (val === null || isNaN(val)) return 'N/A'
  return val.toFixed(2)
}

function fmt4(val: number | null): string {
  if (val === null || isNaN(val)) return 'N/A'
  if (val < 0.001) return '< 0.001'
  return val.toFixed(4)
}

export function StatCard({ title, result, group1Label = 'Group A', group2Label = 'Group B', className }: StatCardProps) {
  const isSignificant = result.p_value !== null && result.p_value < 0.05

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {result.p_value !== null ? (
            <Badge variant={isSignificant ? 'success' : 'muted'}>
              {isSignificant ? 'Significant (p < 0.05)' : 'Not Significant'}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {result.error ? (
          <p className="text-sm text-destructive">{result.error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {/* Group means */}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Mean ({group1Label})</p>
              <p className="font-semibold tabular-nums">{fmt2(result.group1_mean)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Mean ({group2Label})</p>
              <p className="font-semibold tabular-nums">{fmt2(result.group2_mean)}</p>
            </div>

            {/* Mean difference */}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Mean Difference</p>
              <p className="font-semibold tabular-nums">{fmt2(result.mean_diff)}</p>
            </div>

            {/* t statistic */}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">t-statistic</p>
              <p className="font-semibold tabular-nums">{fmt2(result.t_statistic)}</p>
            </div>

            {/* p-value */}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">p-value</p>
              <p className={cn('font-semibold tabular-nums', isSignificant && 'text-green-700')}>
                {fmt4(result.p_value)}
              </p>
            </div>

            {/* 95% CI */}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">95% CI</p>
              <p className="font-semibold tabular-nums">
                [{fmt2(result.ci_low)}, {fmt2(result.ci_high)}]
              </p>
            </div>

            {/* Sample sizes */}
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">n ({group1Label})</p>
              <p className="font-semibold tabular-nums">{result.n1}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">n ({group2Label})</p>
              <p className="font-semibold tabular-nums">{result.n2}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** StatCard variant for Chi-square results */
interface ChiStatCardProps {
  title: string
  chi2: number
  df: number
  pvalue: number
  n: number
  className?: string
}

export function ChiStatCard({ title, chi2, df, pvalue, n, className }: ChiStatCardProps) {
  const isSignificant = pvalue < 0.05

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={isSignificant ? 'success' : 'muted'}>
            {isSignificant ? 'Significant (p < 0.05)' : 'Not Significant'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Chi-square</p>
            <p className="font-semibold tabular-nums">{chi2.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Degrees of Freedom</p>
            <p className="font-semibold tabular-nums">{df}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">p-value</p>
            <p className={cn('font-semibold tabular-nums', isSignificant && 'text-green-700')}>
              {pvalue < 0.001 ? '< 0.001' : pvalue.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">N</p>
            <p className="font-semibold tabular-nums">{n}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
