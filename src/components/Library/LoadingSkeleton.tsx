import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="group relative bg-[var(--theme-surface)] rounded-xl overflow-hidden backdrop-blur-xl border border-[var(--theme-border)]"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="aspect-square w-full bg-[var(--theme-border)] animate-pulse" />
          <div className="p-3 space-y-3">
            <div 
              className="h-5 w-3/4 bg-[var(--theme-border)] rounded-full animate-pulse"
              style={{ animationDelay: `${i * 100 + 100}ms` }} 
            />

            <div 
              className="h-4 w-1/2 bg-[var(--theme-border)] rounded-full animate-pulse"
              style={{ animationDelay: `${i * 100 + 200}ms` }} 
            />

            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-12 bg-[var(--theme-border)] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100 + 300}ms` }} 
              />
              <div 
                className="h-3 w-12 bg-[var(--theme-border)] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100 + 400}ms` }} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
