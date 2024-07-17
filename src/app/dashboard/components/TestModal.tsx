import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyIcon, FileIcon, TrashIcon } from "@radix-ui/react-icons";
import { Test } from "./SpanRow";

interface TestModalProps {
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  testId: string;
}

export default function TestModal({ setTests, testId }: TestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  async function handleDelete() {
    try {
      const response = await fetch(`/dashboard/api/tests/test/${testId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTests((prevTests) => prevTests.filter((test) => test.id !== testId));
        setIsOpen(false);
      } else {
        console.error("Failed to delete test");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  }

  async function handleSave() {
    try {
      const response = await fetch(`/dashboard/api/tests/test/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: inputValue,
          executable_code: generatedCode,
        }),
      });
      if (response.ok) {
        setIsOpen(false);
      } else {
        console.error("Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
    }
  }

  async function handleGenerateTest() {
    try {
      const response = await fetch(`/dashboard/api/tests/test/generate_code/${testId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: inputValue }),
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
      } else {
        console.error("Failed to generate test");
      }
    } catch (error) {
      console.error("Error generating test:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="bg-blue-50 col-span-2 overflow-hidden border border-solid transition-transform duration-300 ease-in-out rounded-lg shadow-sm hover:shadow-md group cursor-pointer w-full">
          <div className="py-1 px-4 w-full">
            <p className="text-sm text-muted-foreground truncate">Test bla bla bal bal abl </p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sample test name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Describe a test you want to create"
            className="w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button className="w-full bg-[#1a1a1a] text-white" onClick={handleGenerateTest}>
            Generate test
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id="full-code" />
              <Label htmlFor="full-code">full code</Label>
            </div>
          </div>
          <div className="relative w-full h-[200px] bg-[#1e1e1e] text-white rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileIcon className="w-4 h-4" />
                <span>Table.tsx</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>TypeScript</span>
                <CopyIcon className="w-4 h-4" />
              </div>
            </div>
            <pre className="text-sm">
              <code>{generatedCode || `Generated code will apear here`}</code>
            </pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Delete test
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
