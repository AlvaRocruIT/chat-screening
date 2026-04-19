export default function Page4Opportunity() {
  return (
    <div className="h-[297mm] px-16 py-20 flex flex-col justify-between page-break bg-[#1a202c]">
      <div className="space-y-16">
        {/* Header */}
        <div>
          <h2 className="text-4xl mb-4 tracking-tight text-white" style={{ fontWeight: 600 }}>
            Current State & Opportunity
          </h2>
          <p className="text-lg text-[#a0aec0] max-w-2xl">
            [Where we are, what we're validating, and why this matters now]
          </p>
        </div>

        {/* What Exists Today */}
        <div className="space-y-4">
          <h3 className="text-xl mb-4 text-white" style={{ fontWeight: 600 }}>
            What Exists Today
          </h3>
          <div className="space-y-3 max-w-2xl">
            <div className="flex gap-3 items-start bg-[#2d3748] border border-[#4a5568] rounded-lg p-4">
              <svg className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-base text-[#e2e8f0]">[Component one: what's built]</p>
            </div>
            <div className="flex gap-3 items-start bg-[#2d3748] border border-[#4a5568] rounded-lg p-4">
              <svg className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-base text-[#e2e8f0]">[Component two: what's validated]</p>
            </div>
            <div className="flex gap-3 items-start bg-[#2d3748] border border-[#4a5568] rounded-lg p-4">
              <svg className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-base text-[#e2e8f0]">[Component three: current capability]</p>
            </div>
          </div>
        </div>

        {/* What Is Being Validated */}
        <div className="bg-[#2d3748] border-l-4 border-[#3b82f6] rounded-r-lg p-8 max-w-2xl">
          <h3 className="text-xl mb-4 text-white" style={{ fontWeight: 600 }}>
            What Is Being Validated
          </h3>
          <p className="text-base text-[#a0aec0] leading-relaxed">
            [Current hypothesis under test. What we're learning from early experiments or pilots. This should feel provisional and honest.]
          </p>
        </div>

        {/* Why Now */}
        <div className="space-y-6">
          <h3 className="text-xl mb-4 text-white" style={{ fontWeight: 600 }}>
            Why Now
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6] flex items-center justify-center text-[#3b82f6]" style={{ fontWeight: 600 }}>
                1
              </div>
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>[Enabling factor one]</p>
              <p className="text-sm text-[#a0aec0]">Brief explanation</p>
            </div>
            <div className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6] flex items-center justify-center text-[#3b82f6]" style={{ fontWeight: 600 }}>
                2
              </div>
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>[Enabling factor two]</p>
              <p className="text-sm text-[#a0aec0]">Brief explanation</p>
            </div>
            <div className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6] flex items-center justify-center text-[#3b82f6]" style={{ fontWeight: 600 }}>
                3
              </div>
              <p className="text-sm text-white" style={{ fontWeight: 600 }}>[Enabling factor three]</p>
              <p className="text-sm text-[#a0aec0]">Brief explanation</p>
            </div>
          </div>
        </div>

        {/* What We Are Building */}
        <div className="max-w-2xl">
          <h3 className="text-xl mb-4 text-white" style={{ fontWeight: 600 }}>
            What We Are Building
          </h3>
          <p className="text-base text-[#e2e8f0] leading-relaxed">
            [Clear, concise statement of the product vision. One to two sentences. Should feel concrete but ambitious.]
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-lg p-10 max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-blue-100 mb-4" style={{ fontWeight: 600 }}>
          → Next Steps
        </p>
        <h3 className="text-2xl text-white mb-4" style={{ fontWeight: 600 }}>
          [Call to action headline]
        </h3>
        <p className="text-base text-blue-50 mb-6 leading-relaxed">
          [What you want the reader to do. Who to contact. What kind of conversation you're looking for.]
        </p>
        <div className="flex gap-4 text-sm text-white font-mono">
          <span>[contact@email.com]</span>
          <span className="text-blue-200">•</span>
          <span>[Additional contact method]</span>
        </div>
      </div>
    </div>
  );
}
