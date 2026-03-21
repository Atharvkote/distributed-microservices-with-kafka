import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Force a specific height (e.g. 'h-10', 'h-32') via className */
  /** Force a specific width (e.g. 'w-full', 'w-48') via className */
  /** Use 'rounded-full' for circular skeletons */
}

/**
 * Skeleton — animated loading placeholder.
 *
 * Usage:
 *   <Skeleton className="h-10 w-64 rounded-xl" />  ← text line
 *   <Skeleton className="h-40 w-full rounded-2xl" /> ← card
 *   <Skeleton className="size-10 rounded-full" />    ← avatar
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-shimmer rounded-lg", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonText — a block of skeleton lines mimicking typography.
 */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 rounded-md",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText }
