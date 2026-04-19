import Card from "./Card";

export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <div className="space-y-3">
            <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
            <div className="h-8 bg-gray-800 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-gray-800 rounded w-1/3 animate-pulse"></div>
          </div>
        </Card>
      ))}
    </>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <Card>
      <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4">
            {[...Array(cols)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-800 rounded flex-1 animate-pulse"></div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const SkeletonChart = () => {
  return (
    <Card>
      <div className="space-y-3">
        <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse"></div>
        <div className="h-40 bg-gray-800 rounded animate-pulse"></div>
      </div>
    </Card>
  );
};
