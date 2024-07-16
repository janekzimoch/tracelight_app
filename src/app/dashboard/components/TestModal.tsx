import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyIcon, FileIcon } from "@radix-ui/react-icons";

interface TestModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function TestModal({ isOpen, onOpenChange }: TestModalProps) {
  function handleButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleButtonClick}>
          Open Modal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sample test name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Describe a test you want to create" className="w-full" />
          <Button className="w-full bg-[#1a1a1a] text-white">Generate test</Button>
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
              <code>{`function MyComponent(props: Props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>Good to see you</p>
    </div>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
