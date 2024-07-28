"use client";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, DragEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UploadTraces(): JSX.Element {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const router = useRouter();

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).filter((file) => file.type === "application/json");
      if (newFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setError("");
      } else {
        setError("Please select JSON files only.");
      }
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files);
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
    handleFileSelection(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch("/upload/api/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        setError("Failed to upload files.");
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
        <CardDescription>Select multiple JSON files</CardDescription>
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
                <div className="font-medium text-muted-foreground truncate">
                  {files.length > 0 ? `${files.length} file(s) selected` : "Drag and drop files here"}
                </div>
              </div>
              {files.length === 0 && <p className="text-sm text-muted-foreground">or click to select files</p>}
            </div>
            <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" multiple />
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {files.length > 0 && (
            <ul className="text-sm">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleUpload} disabled={files.length === 0}>
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
