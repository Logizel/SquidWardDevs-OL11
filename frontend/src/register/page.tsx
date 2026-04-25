import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [corporateId, setCorporateId] = useState("");

  const [hospitalName, setHospitalName] = useState("");
  const [nabhLicense, setNabhLicense] = useState("");

  const [success, setSuccess] = useState(false); // ✅ NEW

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email,
      password,
      role,
      ...(role === "sponsor" && {
        companyName,
        corporateId,
      }),
      ...(role === "hospital" && {
        hospitalName,
        nabhLicense,
      }),
    };

    console.log(payload);

    // 👉 Simulate success (later replace with API call)
    setSuccess(true);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-20 z-10 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="max-w-md w-full">

        <div className="relative group">
          
          {/* SHADOW */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#3E424B] rounded-[2rem] -z-10 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3"></div>

          {/* MAIN CARD */}
          <div className="relative bg-white p-8 rounded-[2rem] border border-gray-300 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">

            {!success ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-500 mb-6">
                  Start your journey with Medora
                </p>

                <form onSubmit={handleRegister} className="space-y-4">

                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-xl ${
                      role === "" ? "text-gray-400" : "text-black"
                    }`}
                  >
                    <option value="">Role</option>
                    <option value="sponsor">Sponsor</option>
                    <option value="hospital">Hospital</option>
                  </select>

                  {role === "sponsor" && (
                    <>
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Corporate ID Number"
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        value={corporateId}
                        onChange={(e) => setCorporateId(e.target.value)}
                      />
                    </>
                  )}

                  {role === "hospital" && (
                    <>
                      <input
                        type="text"
                        placeholder="Hospital Name"
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="NABH License Number"
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        value={nabhLicense}
                        onChange={(e) => setNabhLicense(e.target.value)}
                      />
                    </>
                  )}

                  <button
                    disabled={!email || !password || !role}
                    className="w-full bg-black text-white py-3 rounded-xl font-medium hover:-translate-y-[1px] transition disabled:opacity-50"
                  >
                    Register
                  </button>
                </form>
              </>
            ) : (
              // ✅ SUCCESS MESSAGE UI
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold text-green-600">
                  Registration Successful 🎉
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed">
                  Your compliance credentials (CIN/NABH) are currently under review by the Project Aegis Super Admin.
                  You will receive an email once your account is verified and activated.
                </p>

                <button
                  onClick={() => window.location.href = "/trial-builder"}
                  className="mt-4 w-full bg-black text-white py-3 rounded-xl font-medium"
                >
                  Okay
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}