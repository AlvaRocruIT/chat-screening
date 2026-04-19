export default function Page2Architecture() {
  const components = [
    {
      title: "Conversational Interface",
      description: "Natural language interaction layer",
      icon: "💬"
    },
    {
      title: "Interaction Capture",
      description: "Real-time behavioral tracking",
      icon: "📊"
    },
    {
      title: "Feature Extraction",
      description: "Pattern recognition engine",
      icon: "🔍"
    },
    {
      title: "Scoring Layer",
      description: "Multi-dimensional evaluation",
      icon: "⚡"
    },
    {
      title: "Recruiter Output",
      description: "Structured insights delivery",
      icon: "📋"
    }
  ];

  return (
    <div className="h-[297mm] px-16 py-20 flex flex-col page-break bg-[#1a202c]">
      {/* Header */}
      <div className="mb-16">
        <h2 className="text-4xl mb-4 tracking-tight text-white" style={{ fontWeight: 600 }}>
          System Architecture
        </h2>
        <p className="text-lg text-[#a0aec0] max-w-xl">
          [Brief explanation of how the system works as an integrated whole]
        </p>
      </div>

      {/* System Diagram */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          {components.map((component, index) => (
            <div key={index} className="relative">
              {/* Component Block */}
              <div className="border border-[#4a5568] bg-[#2d3748] rounded-lg p-6 flex items-start gap-6 hover:border-[#3b82f6] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6] text-2xl flex items-center justify-center">
                  {component.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-[#3b82f6] font-mono" style={{ fontWeight: 600 }}>
                      [{index + 1}]
                    </span>
                    <h3 className="text-xl text-white" style={{ fontWeight: 600 }}>
                      {component.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[#a0aec0]">
                    {component.description}
                  </p>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < components.length - 1 && (
                <div className="flex justify-center my-2">
                  <svg width="2" height="20" className="text-[#3b82f6]">
                    <line x1="1" y1="0" x2="1" y2="16" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <polygon points="1,20 0,14 2,14" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 pt-6 border-t border-[#2d3748]">
        <p className="text-sm text-[#718096] font-mono">
          // [Optional: Technical note about architecture decisions or data flow]
        </p>
      </div>
    </div>
  );
}
