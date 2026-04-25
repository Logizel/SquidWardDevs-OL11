export default function PreviewPanel({ payload }: any) {
  return (
    <div className="w-[400px] sticky top-10 h-fit bg-white p-6 rounded-2xl border">
      <h2 className="text-lg font-semibold mb-4">Live Preview</h2>

      <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}