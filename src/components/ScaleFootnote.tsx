import { cn } from '@/lib/utils'

interface ScaleFootnoteProps {
  scale: string
  className?: string
}

/**
 * Typography component for rendering scale definitions at the bottom of charts.
 * Example: scale="1 = Not at all appealing, 5 = Extremely appealing"
 */
export function ScaleFootnote({ scale, className }: ScaleFootnoteProps) {
  return (
    <p className={cn('mt-2 text-xs text-muted-foreground italic', className)}>
      Scale: {scale}
    </p>
  )
}
