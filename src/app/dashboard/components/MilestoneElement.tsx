import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrashIcon } from "@radix-ui/react-icons";
import React, { useRef, useEffect } from "react";

export interface MilestoneProps {
  milestone: string;
  setMilestone: (value: string) => void;
}

export default function MilestoneElement({ milestone, setMilestone }: MilestoneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [milestone]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 4 * 20);
      textarea.style.height = `${newHeight}px`;
    }
  };

  return (
    <div className="flex items-center overflow-hidden justify-between border shadow-sm p-2 rounded-md">
      <Textarea
        ref={textareaRef}
        value={milestone}
        onChange={(e) => {
          setMilestone(e.target.value);
          adjustTextareaHeight();
        }}
        className="border-none focus:ring-0 resize-none overflow-y-auto text-sm py-0.5"
        style={{
          minHeight: "22px", // One line height
          maxHeight: "80px", // Four lines height
          lineHeight: "22px",
        }}
      />
      <Button variant="ghost" size="icon" className="text-red-500 ml-4">
        <TrashIcon width="16" height="16" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
