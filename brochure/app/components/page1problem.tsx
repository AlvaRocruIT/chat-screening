export default function Page1Problem() {
  return (
    <div className="h-[297mm] px-16 py-20 flex flex-col justify-between page-break bg-[#1a202c]">
      {/* Header */}
      <div className="space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl leading-tight tracking-tight text-white" style={{ fontWeight: 600 }}>
            [Main Headline:<br />The Core Problem Statement]
          </h1>

          {/* Download PDF Button */}
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#4a5568] hover:border-[#3b82f6] text-white rounded-full text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar en PDF
          </button>

          <p className="text-lg text-[#a0aec0] max-w-2xl leading-relaxed">
            [Supporting paragraph that contextualizes the problem. Two to three sentences maximum. Should establish credibility and relevance.]
          </p>
        </div>

        {/* Problem Bullets */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-2.5 flex-shrink-0" />
            <p className="text-base text-[#e2e8f0]">
              [Problem point one: specific, measurable observation]
            </p>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-2.5 flex-shrink-0" />
            <p className="text-base text-[#e2e8f0]">
              [Problem point two: contrasting limitation or gap]
            </p>
          </div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-2.5 flex-shrink-0" />
            <p className="text-base text-[#e2e8f0]">
              [Problem point three: consequence or missed opportunity]
            </p>
          </div>
        </div>

        {/* Insight Block */}
        <div className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-8 max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-[#3b82f6] mb-3" style={{ fontWeight: 600 }}>
            ⚡ Key Insight
          </p>
          <p className="text-white text-lg leading-relaxed">
            [The critical observation that changes how we should think about this problem. This should be the "aha" moment.]
          </p>
        </div>
      </div>

      {/* Thesis Statement */}
      <div className="bg-gradient-to-r from-[#2d3748] to-transparent border-l-4 border-[#3b82f6] pl-8 py-6 max-w-2xl">
        <p className="text-2xl text-white leading-relaxed" style={{ fontWeight: 500 }}>
          [Thesis statement: What we propose instead. Clear, declarative, distinctive.]
        </p>
      </div>
    </div>
  );
}
