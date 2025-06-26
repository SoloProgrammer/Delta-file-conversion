"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadComplete?: (data: any) => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ConversionResult {
  success: boolean;
  data: string[];
  fileName: string;
  folderName: string;
  error?: string;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadStatus("uploading");
      setUploadProgress(0);
      setErrorMessage("");

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        const result: ConversionResult = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to convert file");
        }

        setConversionResult(result);
        setUploadStatus("success");
        onUploadComplete?.(result.data);
      } catch (error) {
        setUploadStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "An error occurred");
        setUploadProgress(0);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploadStatus === "uploading",
  });

  const resetUploader = () => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setConversionResult(null);
    setErrorMessage("");
  };
  const downloadZip = async (zipFileName: string = "", index: number) => {
    try {
      setLoading(index);
      const response = await fetch(`/api/download/${zipFileName}`, { cache: "no-store" });
      if (response) {
        const contentType = response.headers.get("Content-Type") as string;
        const doc = await response.blob();
        if (doc) {
          const _blob = new Blob([doc], { type: contentType });
          const url = URL.createObjectURL(_blob);
          var dlnk = document.createElement("a") as HTMLAnchorElement;
          if (!dlnk) throw new Error("Hyper link element with provided id not found in the DOM!");
          else {
            dlnk.download = zipFileName;
            dlnk.href = url;
            dlnk.click();
            URL.revokeObjectURL(url);
          }
        }
      }
    } catch (error) {
      toast.warning("Something went wrong");
    } finally {
      setLoading(0);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {uploadStatus === "idle" && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200",
                "hover:border-blue-400 hover:bg-blue-50",
                isDragActive && !isDragReject && "border-blue-500 bg-blue-50",
                isDragReject && "border-red-500 bg-red-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    isDragActive && !isDragReject ? "bg-blue-100" : "bg-gray-100",
                    isDragReject && "bg-red-100"
                  )}
                >
                  <Upload
                    className={cn(
                      "w-8 h-8",
                      isDragActive && !isDragReject ? "text-blue-600" : "text-gray-600",
                      isDragReject && "text-red-600"
                    )}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isDragActive && !isDragReject ? "Drop your Excel file here" : isDragReject ? "Invalid file type" : "Upload Excel File"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {isDragReject
                      ? "Please upload .xlsx, .xls, or .csv files only"
                      : "Drag and drop your Excel file here, or click to browse"}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Supports .xlsx, .xls, .csv files up to 10MB</p>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Converting File</h3>
                <p className="text-sm text-gray-500">Processing your Excel file...</p>
              </div>
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-400">{uploadProgress}% complete</p>
              </div>
            </div>
          )}

          {uploadStatus === "success" && conversionResult && (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conversion Complete!</h3>
                <p className="text-sm text-gray-500">Your Excel file has been converted to JSON</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{conversionResult.fileName}</span>
                </div>
                <div className="flex justify-center space-x-4 text-xs text-gray-500">
                  {conversionResult.data.map((file, index) => {
                    return (
                      <span
                        key={file}
                        onClick={() => downloadZip(file, index + 1)}
                        className={`flex gap-2 border border-gray-300 p-2 rounded-sm cursor-pointer hover:bg-gray-100 transition-all text-sm ${
                          loading === index + 1 && "cursor-progress"
                        }`}
                      >
                        {file.replace("data/", "")}
                        {loading === index + 1 ? (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-center space-x-3">
                <Button variant="outline" onClick={resetUploader}>
                  Convert Another File
                </Button>
              </div>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conversion Failed</h3>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
              <Button variant="outline" onClick={resetUploader}>
                Try Again
              </Button>
            </div>
          )}

          <a id="download_zip" className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
}
