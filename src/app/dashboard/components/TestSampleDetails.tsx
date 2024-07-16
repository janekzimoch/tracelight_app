import { TestSample } from "../page";
import SpanRow from "./SpanRow";

export const items = [
  { title: "Placeholder Title 1", description: "Description for placeholder 1", tests: [] },
  { title: "Placeholder Title 2", description: "Description for placeholder 2", tests: ["1", "2", "3"] },
  { title: "Placeholder Title 3", description: "Description for placeholder 3", tests: [] },
  { title: "Placeholder Title 4", description: "Description for placeholder 4", tests: [] },
];

export default function TestSampleDetails({ sample }: { sample: TestSample }) {
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
        {items.map((item, index) => (
          <SpanRow item={item} key={index} index={index} />
        ))}
      </div>
    </div>
  );
}
