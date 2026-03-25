export function PlatformCard({ name, icon, color, stats, goal }) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-gray-800">{name}</h3>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <span className="font-medium text-gray-800">{value.toLocaleString?.() ?? value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          🎯 Goal: <span className="font-medium">{goal}</span>
        </p>
      </div>
    </div>
  );
}
