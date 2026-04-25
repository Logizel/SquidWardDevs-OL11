export default function RuleBlock({ rule, onChange, onDelete }: any) {
  return (
    <div className="border p-4 rounded-xl space-y-3 relative">

      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-red-500"
      >
        🗑
      </button>

      {rule.type === "demographics" && (
        <>
          <h3 className="font-semibold">Demographics</h3>

          <input
            placeholder="Min Age"
            className="w-full p-2 border rounded"
            value={rule.min_age}
            onChange={(e) => onChange({ ...rule, min_age: e.target.value })}
          />

          <input
            placeholder="Max Age"
            className="w-full p-2 border rounded"
            value={rule.max_age}
            onChange={(e) => onChange({ ...rule, max_age: e.target.value })}
          />

          <select
            className="w-full p-2 border rounded"
            value={rule.gender}
            onChange={(e) => onChange({ ...rule, gender: e.target.value })}
          >
            <option>Any</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </>
      )}

      {rule.type === "inclusion" && (
        <>
          <h3 className="font-semibold text-green-600">Inclusion</h3>
          <input
            placeholder="Condition (ICD-10)"
            className="w-full p-2 border rounded"
            value={rule.condition}
            onChange={(e) => onChange({ ...rule, condition: e.target.value })}
          />
        </>
      )}

      {rule.type === "exclusion" && (
        <>
          <h3 className="font-semibold text-red-600">Exclusion</h3>
          <input
            placeholder="Condition (ICD-10)"
            className="w-full p-2 border rounded"
            value={rule.condition}
            onChange={(e) => onChange({ ...rule, condition: e.target.value })}
          />
        </>
      )}
    </div>
  );
}