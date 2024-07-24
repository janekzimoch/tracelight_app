import React, { useRef, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

export interface MilestoneProps {
  milestone: string;
  updateMilestone: (text: string) => Promise<void>;
  deleteMilestone: () => void;
}

export default function MilestoneElement({ milestone, updateMilestone, deleteMilestone }: MilestoneProps) {
  const [localText, setLocalText] = useState(milestone);
  const [isTextChanged, setIsTextChanged] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [localText]);

  useEffect(() => {
    setLocalText(milestone);
    setIsTextChanged(false);
  }, [milestone]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 4 * 20);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
    setIsTextChanged(newText !== milestone);
    adjustTextareaHeight();
  };

  const handleUpdate = async () => {
    if (isTextChanged) {
      await updateMilestone(localText);
      setIsTextChanged(false);
    }
  };

  return (
    <div className="flex relative items-stretch overflow-hidden border shadow-sm p-2 rounded-md">
      <div className="flex-grow mr-16">
        <Textarea
          ref={textareaRef}
          value={localText}
          onChange={handleChange}
          className="w-full border-none focus:ring-0 resize-none overflow-y-auto text-sm py-0.5"
          style={{
            minHeight: "22px",
            maxHeight: "80px",
            lineHeight: "22px",
          }}
        />
      </div>
      {isTextChanged && (
        <div className="absolute bottom-1 right-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpdate}
            className="text-blue-500 text-xs h-6 py-0 px-1 hover:text-blue-700 border-blue-500 transition-opacity duration-200"
          >
            Update
          </Button>
        </div>
      )}
      <div className="absolute right-1 top-1">
        <Button variant="ghost" size="icon" className="text-red-500 p-0 h-8 w-8 min-w-0" onClick={deleteMilestone}>
          <TrashIcon width="14" height="14" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
