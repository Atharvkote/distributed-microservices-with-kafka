import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  /** Number of loading rows */
  rows?: number;
  /** Number of columns */
  cols?: number;
  /** Whether to show a header row */
  showHeader?: boolean;
}

/**
 * TableSkeleton — animated loading placeholder for data tables.
 *
 * Usage:
 *   <TableSkeleton rows={5} cols={6} />
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 5,
  showHeader = true,
}) => {
  return (
    <div className="glass rounded-xl border border-border/50 overflow-hidden">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              {Array.from({ length: cols }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-3 w-20 rounded-md" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="border-border/30">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  {colIdx === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-32 rounded-md" />
                        <Skeleton className="h-2.5 w-20 rounded-md" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton
                      className={`h-3 rounded-md ${
                        colIdx === cols - 1 ? 'w-16 ml-auto' : 'w-24'
                      }`}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(TableSkeleton);
