export default function SkeltonLoader() {
  return (
    <div>
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
