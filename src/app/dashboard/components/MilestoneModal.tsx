import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MilestoneCard from "./MilestoneCard";
import MilestoneElement from "./MilestoneElement";
import { useState } from "react";
import { Milestone } from "../api/testSamples/route";

export default function MilestoneModal({
  milestones,
  updateMilestone,
  addMilestone,
  deleteMilestone,
}: {
  milestones: Milestone[];
  updateMilestone: (milestoneId: string, value: string) => Promise<void>;
  addMilestone: (value: string) => void;
  deleteMilestone: (milestoneId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const handleAddMilestone = () => {
    if (newMilestone.trim() !== "") {
      addMilestone(newMilestone);
      setNewMilestone("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <MilestoneCard milestones={milestones} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Milestones</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {milestones.map((milestone, index) => (
            <MilestoneElement
              key={index}
              milestone={milestone.text}
              updateMilestone={(text: string) => updateMilestone(milestone.id, text)}
              deleteMilestone={() => deleteMilestone(milestone.id)}
            />
          ))}
        </div>
        <div className="flex items-center mt-4">
          <Input
            placeholder="Type another milestone here"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            className="flex-1"
          />

          <Button onClick={handleAddMilestone} className="ml-2">
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
