"use client";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, DragEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UploadTraces(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const router = useRouter();

  const handleFileSelection = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please select a JSON file.");
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    handleFileSelection(selectedFile);
  };

  const handleDragEnter = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/upload/api/", {
        method: "POST",
        body: formData, // Send formData instead of JSON
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        setError("Failed to upload file.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred during upload.");
    }
  };

  return (
    <Card className="w-[350px] shadow-lg">
      <CardHeader>
        <CardTitle>Upload traces</CardTitle>
        <CardDescription>Traces must be a JSON file</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <label
            className={`flex flex-col h-40 items-center justify-center rounded-md border-2 border-dashed transition-colors cursor-pointer
              ${isDragging ? "border-primary bg-primary/10" : "border-muted hover:border-primary"}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center max-w-[300px] w-full px-2 pointer-events-none">
              <div className="w-full mx-auto">
                <div className="font-medium text-muted-foreground truncate">{file ? file.name : "Drag and drop a file here"}</div>
              </div>
              {!file && <p className="text-sm text-muted-foreground">or click to select a file</p>}
            </div>
            <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleUpload} disabled={!file}>
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
