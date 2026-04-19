import Page1Problem from "./components/Page1Problem";
import Page2Architecture from "./components/Page2Architecture";
import Page3Signals from "./components/Page3Signals";
import Page4Opportunity from "./components/Page4Opportunity";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-[#0f1419]">
      <div className="max-w-[210mm] mx-auto bg-[#1a202c]">
        <Page1Problem />
        <Page2Architecture />
        <Page3Signals />
        <Page4Opportunity />
      </div>
    </div>
  );
}
