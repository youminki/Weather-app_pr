import React from "react";

export const Skeleton = ({
  className = "w-full h-4 bg-slate-200/60 rounded-md",
}: {
  className?: string;
}) => {
  return <div className={"animate-pulse " + className} />;
};

export const SkeletonCard = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="mb-2">
            <Skeleton className="w-32 h-5" />
          </div>
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="ml-4">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
      {children}
    </div>
  );
};
