export default function Page3Signals() {
  const signals = [
    "Response latency patterns",
    "Question reformulation",
    "Clarification requests",
    "Technical depth markers",
    "Communication precision"
  ];

  const chatMessages = [
    { role: "system", text: "[System prompt or initial question]" },
    { role: "candidate", text: "[Candidate response demonstrating behavior]" },
    { role: "system", text: "[Follow-up probe]" },
    { role: "candidate", text: "[Candidate elaboration with signals]" }
  ];

  return (
    <div className="h-[297mm] px-16 py-20 flex flex-col page-break bg-[#1a202c]">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-4xl mb-4 tracking-tight text-white" style={{ fontWeight: 600 }}>
          Signals & Example
        </h2>
        <p className="text-lg text-[#a0aec0]">
          [How the system translates interaction into insight]
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-12 flex-1">
        {/* Left: Signals */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl mb-6 text-white" style={{ fontWeight: 600 }}>
              Captured Signals
            </h3>
            <div className="space-y-3">
              {signals.map((signal, index) => (
                <div key={index} className="border-l-2 border-[#3b82f6] pl-4 py-3 bg-[#2d3748] rounded-r">
                  <p className="text-sm text-[#e2e8f0]" style={{ fontWeight: 500 }}>
                    {signal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-6 space-y-3">
            <p className="text-xs uppercase tracking-wider text-[#3b82f6]" style={{ fontWeight: 600 }}>
              → What the system detects
            </p>
            <ul className="space-y-2 text-sm text-[#a0aec0]">
              <li>• [Detected pattern one]</li>
              <li>• [Detected pattern two]</li>
              <li>• [Detected pattern three]</li>
            </ul>
          </div>

          <div className="border-t-2 border-[#3b82f6] pt-6">
            <p className="text-xs uppercase tracking-wider text-[#3b82f6] mb-3" style={{ fontWeight: 600 }}>
              ← Output
            </p>
            <p className="text-sm text-[#e2e8f0]">
              [Structured recruiter-facing insight summary]
            </p>
          </div>
        </div>

        {/* Right: Chat Example */}
        <div className="space-y-6">
          <h3 className="text-xl text-white" style={{ fontWeight: 600 }}>
            Interaction Example
          </h3>
          <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-6 space-y-4 h-[500px] overflow-y-auto">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-lg ${
                    message.role === 'candidate'
                      ? 'bg-[#2d3748] border border-[#4a5568] text-white'
                      : 'bg-[#3b82f6] text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#718096] font-mono">
            // [Caption: What makes this interaction revealing]
          </p>
        </div>
      </div>
    </div>
  );
}
