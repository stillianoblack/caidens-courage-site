import React from 'react';

type DashboardWidgetSkeletonProps = {
  kpiCount?: number;
  showGrowth?: boolean;
  showActivity?: boolean;
};

export default function DashboardWidgetSkeleton({
  kpiCount = 4,
  showGrowth = true,
  showActivity = false,
}: DashboardWidgetSkeletonProps) {
  return (
    <div className="pilot-dashboardSkeleton" aria-busy="true" aria-label="Loading dashboard">
      <div className="pilot-kpiRow">
        {Array.from({ length: kpiCount }, (_, index) => (
          <article key={index} className="pilot-kpiCard pilot-skeletonBlock" />
        ))}
      </div>
      {showGrowth ? (
        <section className="pilot-panelBlock">
          <div className="pilot-skeletonLine pilot-skeletonLine--title" />
          <div className="pilot-growthChart">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="pilot-growthRow">
                <div className="pilot-skeletonLine pilot-skeletonLine--meta" />
                <div className="pilot-skeletonBar" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {showActivity ? (
        <section className="pilot-panelBlock">
          <div className="pilot-skeletonLine pilot-skeletonLine--title" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="pilot-skeletonLine pilot-skeletonLine--activity" />
          ))}
        </section>
      ) : null}
    </div>
  );
}
