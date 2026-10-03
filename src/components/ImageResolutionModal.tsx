import React from "react";
import { X, Download, Maximize2, Sparkles } from "lucide-react";
import { ImageSize } from "../types";

interface ImageResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  pageNumber: number;
  storyTitle: string;
  prompt: string;
  imageSize: ImageSize;
}

export const ImageResolutionModal: React.FC<ImageResolutionModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  pageNumber,
  storyTitle,
  prompt,
  imageSize,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${storyTitle.replace(/[^a-z0-9]/gi, "_")}_Page_${pageNumber}_${imageSize}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-amber-900 border border-amber-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-amber-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-800 bg-amber-950/60">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-amber-100 font-serif">
                {storyTitle} — Page {pageNumber}
              </h3>
              <p className="text-xs text-amber-300/80 flex items-center gap-1.5">
                <span>Gemini 3 Pro Image</span>
                <span className="px-1.5 py-0.2 bg-amber-500 text-amber-950 rounded-md font-bold text-[10px]">
                  {imageSize} Resolution
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {imageSize}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-amber-300 hover:bg-amber-800/80 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image View */}
        <div className="flex-1 bg-amber-950/90 p-4 flex items-center justify-center overflow-auto min-h-[350px]">
          <img
            src={imageUrl}
            alt={`Page ${pageNumber} High Res`}
            className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-xl border border-amber-700/50"
          />
        </div>

        {/* Prompt Footer */}
        <div className="p-4 border-t border-amber-800 bg-amber-950/80 text-xs text-amber-200/90 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">Prompt Blueprint:</span>
            <p className="italic">{prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
