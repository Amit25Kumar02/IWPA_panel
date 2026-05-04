import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const base = "#d1d5db";
const highlight = "#f9fafb";

// Table rows shimmer
export function TableRowsSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight}>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <Skeleton height={16} borderRadius={6} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SkeletonTheme>
  );
}

// Stat cards shimmer
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton height={14} width="60%" borderRadius={6} />
                <Skeleton height={32} width="50%" borderRadius={6} className="mt-2" />
              </div>
              <Skeleton height={48} width={48} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Card list shimmer (notices, publications, etc.)
export function CardListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-white border border-[#e5e7eb] rounded-lg">
            <div className="flex-1 space-y-2">
              <Skeleton height={14} width="50%" borderRadius={6} />
              <Skeleton height={12} width="30%" borderRadius={6} />
            </div>
            <div className="flex gap-2 ml-4">
              <Skeleton height={32} width={32} borderRadius={8} />
              <Skeleton height={32} width={32} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Email list shimmer
export function EmailListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight}>
      <div className="divide-y divide-[#e5e7eb]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            <Skeleton height={16} width={16} borderRadius={4} className="mt-1 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton height={13} width="30%" borderRadius={6} />
                <Skeleton height={13} width="15%" borderRadius={6} />
              </div>
              <Skeleton height={13} width="55%" borderRadius={6} />
              <Skeleton height={12} width="80%" borderRadius={6} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Magazine grid shimmer
export function MagazineGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} height={160} borderRadius={8} />
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Event cards grid shimmer
export function EventCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E5E7EB] overflow-hidden">
            <Skeleton height={192} borderRadius={0} />
            <div className="p-4 space-y-3">
              <Skeleton height={18} width="80%" borderRadius={6} />
              <Skeleton height={13} width="60%" borderRadius={6} />
              <Skeleton height={13} width="50%" borderRadius={6} />
              <Skeleton height={13} width="40%" borderRadius={6} />
              <Skeleton height={12} count={2} borderRadius={6} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Generic inline shimmer
export { Skeleton, SkeletonTheme };
export { base as skeletonBase, highlight as skeletonHighlight };
