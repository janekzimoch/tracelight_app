import { Trace } from "../page";
import SpanRow from "./SpanRow";

export default function TestSampleDetails({ trace }: { trace: Trace }) {
  return (
    <div className="relative flex flex-col w-full px-10 py-4">
      {/* Vertical lines */}
      <div className="absolute inset-0 h-full flex py-16 px-10 space-x-6 ml-12">
        <div className="w-1/4"></div>
        <div className="w-1/4"></div>
        <div className="w-1/4 relative">
          <div className="absolute inset-0 transform -translate-x-1/2 border-r border-dashed border-gray-300"></div>
        </div>
        <div className="w-1/4 relative">
          <div className="absolute inset-0 transform -translate-x-1/2 border-r border-dashed border-gray-300"></div>
        </div>
      </div>

      <div className="h-full space-y-4">
        {trace.spans.map((span, index) => (
          <SpanRow span={span} key={index} />
        ))}
      </div>
    </div>
  );
}
