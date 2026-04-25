import { useState } from "react";
import RuleBlock from "./RuleBlock";
import PreviewPanel from "./PreviewPanel";

export default function TrialBuilder() {
  const [trialName, setTrialName] = useState("");
  const [targetDisease, setTargetDisease] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState("");

  const [rules, setRules] = useState<any[]>([]);

  const addRule = (type: string) => {
    if (type === "demographics") {
      setRules([...rules, { type, min_age: "", max_age: "", gender: "Any" }]);
    }
    if (type === "inclusion") {
      setRules([...rules, { type, condition: "" }]);
    }
    if (type === "exclusion") {
      setRules([...rules, { type, condition: "" }]);
    }
  };

  const updateRule = (index: number, updated: any) => {
    const newRules = [...rules];
    newRules[index] = updated;
    setRules(newRules);
  };

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const buildPayload = () => {
    return {
      trial_name: trialName,
      target_disease: targetDisease,
      description,
      phase,
      criteria: rules.map((r) => {
        if (r.type === "demographics") {
          return {
            min_age: Number(r.min_age),
            max_age: Number(r.max_age),
            gender: r.gender,
          };
        }
        if (r.type === "inclusion") {
          return {
            required_conditions: [r.condition],
          };
        }
        if (r.type === "exclusion") {
          return {
            forbidden_conditions: [r.condition],
          };
        }
      }),
    };
  };

  // ✅ API CALL
  const handleBroadcast = async () => {
    const payload = buildPayload();

    try {
      const res = await fetch("http://127.0.0.1:8000/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("🚀 Trial broadcasted successfully!");
        console.log("SUCCESS:", data);
      } else {
        alert("❌ Failed to broadcast");
        console.error(data);
      }
    } catch (error) {
      console.error("ERROR:", error);
      alert("⚠️ Backend not reachable");
    }
  };

  return (
    <div className="flex w-full min-h-screen gap-8 px-10 py-12 bg-[#f1f3f5]">

      {/* LEFT SIDE */}
      <div className="flex-1 space-y-6">

        {/* ================= METADATA ================= */}
        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Trial Metadata
          </h2>

          <input
            placeholder="Trial Name"
            className="w-full p-3 border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
            value={trialName}
            onChange={(e) => setTrialName(e.target.value)}
          />

          <input
            placeholder="Target Disease"
            className="w-full p-3 border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
            value={targetDisease}
            onChange={(e) => setTargetDisease(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full p-3 border border-gray-400 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full p-3 border border-gray-400 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
          >
            <option value="">Select Phase</option>
            <option>Phase I</option>
            <option>Phase II</option>
            <option>Phase III</option>
            <option>Phase IV</option>
          </select>
        </div>

        {/* ================= RULES ================= */}
        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Criteria Rules
          </h2>

          {rules.map((rule, index) => (
            <RuleBlock
              key={index}
              rule={rule}
              onChange={(updated) => updateRule(index, updated)}
              onDelete={() => deleteRule(index)}
            />
          ))}

          {/* BUTTONS */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => addRule("demographics")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
            >
              + Demographics
            </button>

            <button
              onClick={() => addRule("inclusion")}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-xl hover:bg-green-200"
            >
              + Inclusion
            </button>

            <button
              onClick={() => addRule("exclusion")}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200"
            >
              + Exclusion
            </button>
          </div>

          {/* BROADCAST BUTTON */}
          <button
            onClick={handleBroadcast}
            className="w-full bg-black text-white py-3 rounded-xl mt-4 hover:opacity-90 transition"
          >
            Broadcast to Edge Network
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-[350px] bg-white border border-gray-300 rounded-2xl p-6 shadow-sm h-fit sticky top-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Live Preview
        </h2>

        <pre className="bg-gray-100 text-sm text-gray-800 p-4 rounded-xl overflow-auto">
          {JSON.stringify(buildPayload(), null, 2)}
        </pre>
      </div>

    </div>
  );
}