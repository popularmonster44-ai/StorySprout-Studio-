import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Volume2,
  Edit3,
  Check,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Maximize,
  Minimize,
  Wand2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ImageSize, ImageStyle, Story, StoryPage, VoiceName, VoiceTone } from "../types";

interface StoryReaderProps {
  story: Story;
  onUpdateStory: (updated: Story) => void;
  imageSize: ImageSize;
  onChangeImageSize: (size: ImageSize) => void;
  selectedVoice: VoiceName;
  selectedTone: VoiceTone;
  onOpenResolutionModal: (page: StoryPage) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onUpdateStory,
  imageSize,
  onChangeImageSize,
  selectedVoice,
  selectedTone,
  onOpenResolutionModal,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0 = Cover, 1+ = Page 1+
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAutoReading, setIsAutoReading] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("watercolor");
  const [imageNotification, setImageNotification] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const pages = story.pages || [];
  const totalPages = pages.length;
  const isCover = currentPageIndex === 0;
  const currentPage = !isCover ? pages[currentPageIndex - 1] : null;

  // Cleanup audio on page change
  useEffect(() => {
    stopAudio();
    if (currentPage) {
      setEditedText(currentPage.text);
    }
  }, [currentPageIndex, story.id]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playTTS = async (textToSpeak: string, autoAdvance = false) => {
    stopAudio();
    setIsGeneratingTTS(true);

    try {
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: selectedVoice,
          tone: selectedTone,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.audioUrl) {
        throw new Error(data.error || "Failed to generate speech");
      }

      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      setIsPlayingAudio(true);

      audio.onended = () => {
        setIsPlayingAudio(false);
        if (autoAdvance && isAutoReading) {
          if (currentPageIndex < totalPages) {
            setCurrentPageIndex((prev) => prev + 1);
          } else {
            setIsAutoReading(false);
            triggerConfetti();
          }
        }
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
      };

      await audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
      setIsPlayingAudio(false);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      const textToRead = isCover ? `${story.title}. ${story.subtitle || ""}` : currentPage?.text || "";
      playTTS(textToRead, false);
    }
  };

  const handleToggleAutoRead = () => {
    if (isAutoReading) {
      setIsAutoReading(false);
      stopAudio();
    } else {
      setIsAutoReading(true);
      const startIdx = isCover ? 1 : currentPageIndex;
      if (isCover) setCurrentPageIndex(1);
      const targetText = pages[startIdx - 1]?.text || "";
      playTTS(targetText, true);
    }
  };

  const handleGenerateIllustration = async () => {
    if (!currentPage) return;
    setIsGeneratingImg(true);

    try {
      setImageNotification(null);
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPage.illustrationPrompt || currentPage.text,
          imageSize,
          style: selectedStyle,
          characterDescription: story.mainCharacter,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.imageUrl) {
        throw new Error(data.error || "Failed to generate image");
      }

      // Update story page image
      const updatedPages = [...pages];
      updatedPages[currentPageIndex - 1] = {
        ...currentPage,
        imageUrl: data.imageUrl,
      };

      const updatedStory = {
        ...story,
        pages: updatedPages,
        coverImageUrl: currentPageIndex === 1 ? data.imageUrl : story.coverImageUrl,
      };

      onUpdateStory(updatedStory);

      if (data.quotaExceeded || data.isFallback) {
        setImageNotification("Illustrated using Gemini Flash vector art. (Free Tier active)");
      }
    } catch (err: any) {
      console.error("Illustration generation error:", err);
      setImageNotification(err.message || "Could not generate picture right now.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleSaveTextEdit = () => {
    if (!currentPage) return;
    const updatedPages = [...pages];
    updatedPages[currentPageIndex - 1] = {
      ...currentPage,
      text: editedText,
    };
    onUpdateStory({ ...story, pages: updatedPages });
    setIsEditingText(false);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;
    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={readerContainerRef}
      className={`w-full max-w-5xl mx-auto flex flex-col transition-all duration-300 ${
        isFullscreen ? "p-6 bg-amber-950 text-amber-50 h-screen justify-between" : "p-2 sm:p-4"
      }`}
    >
      {/* Top Reader Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/90 border border-amber-200/80 rounded-2xl p-3 mb-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <span className="font-bold text-amber-950 font-serif text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
            {story.title}
          </span>
          <span className="text-xs text-amber-800 font-medium px-2 py-0.5 bg-amber-200 rounded-full">
            {isCover ? "Cover" : `Page ${currentPageIndex} of ${totalPages}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            id="btn-read-aloud"
            onClick={handleTogglePlay}
            disabled={isGeneratingTTS}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isPlayingAudio
                ? "bg-amber-600 text-white shadow-xs animate-pulse"
                : "bg-amber-200/80 hover:bg-amber-300 text-amber-950"
            }`}
          >
            {isGeneratingTTS ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
            ) : isPlayingAudio ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-800" />
            )}
            <span>{isPlayingAudio ? "Pause Voice" : "Read Aloud"}</span>
          </button>

          {/* Auto Read Story Mode */}
          <button
            id="btn-auto-read"
            onClick={handleToggleAutoRead}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isAutoReading
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutoReading ? "Auto-Reading..." : "Auto-Read Story"}</span>
          </button>

          {/* Theater Fullscreen Button */}
          <button
            id="btn-theater-mode"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-amber-800 hover:bg-amber-200/60 transition cursor-pointer"
            title="Theater / Fullscreen View"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Storybook Canvas */}
      <div className="bg-amber-50/90 border-2 border-amber-200 rounded-3xl shadow-xl overflow-hidden min-h-[460px] flex flex-col md:flex-row my-auto">
        {/* Cover Screen */}
        {isCover ? (
          <div className="w-full p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-amber-100/60 via-amber-50 to-orange-100/50">
            {/* Cover Illustration */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <div className="relative group rounded-3xl overflow-hidden border-4 border-amber-200 shadow-2xl max-w-md w-full aspect-4/3 bg-amber-200/50 flex items-center justify-center">
                {story.coverImageUrl ? (
                  <img
                    src={story.coverImageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="p-6 text-center text-amber-800">
                    <Wand2 className="w-12 h-12 mx-auto mb-2 text-amber-500 animate-bounce" />
                    <p className="font-bold text-sm">Cover Illustration Pending</p>
                    <p className="text-xs text-amber-600">Turn to Page 1 to generate high-res art!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Info */}
            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 text-amber-950">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-amber-200 text-amber-900 rounded-full inline-block">
                  {story.genre} • Age {story.targetAge}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight text-amber-950">
                  {story.title}
                </h1>
                {story.subtitle && (
                  <p className="text-sm text-amber-800 italic font-serif">{story.subtitle}</p>
                )}
              </div>

              <p className="text-xs text-amber-800/90">
                <span className="font-bold">Main Hero:</span> {story.mainCharacter}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <button
                  id="btn-begin-reading"
                  onClick={() => setCurrentPageIndex(1)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-300/50 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Open Storybook</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Page View: Split Layout (Illustration on Left, Story Text on Right) */
          <>
            {/* Left Column: Page Illustration & Controls */}
            <div className="w-full md:w-1/2 bg-amber-100/50 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-amber-200/80">
              {imageNotification && (
                <div className="w-full mb-3 p-2 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                  <span>✨ {imageNotification}</span>
                  <button
                    onClick={() => setImageNotification(null)}
                    className="text-amber-700 hover:text-amber-950 font-bold px-1"
                  >
                    ×
                  </button>
                </div>
              )}
              {/* Image Frame */}
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-amber-200/40 flex items-center justify-center group">
                {currentPage?.imageUrl ? (
                  <>
                    <img
                      src={currentPage.imageUrl}
                      alt={`Illustration Page ${currentPageIndex}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Resolution Inspector & Zoom Overlay */}
                    <button
                      onClick={() => currentPage && onOpenResolutionModal(currentPage)}
                      className="absolute top-3 right-3 p-2 bg-amber-950/70 hover:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs opacity-90 group-hover:opacity-100 transition cursor-pointer shadow-md"
                      title="Inspect High Res Illustration"
                    >
                      <Maximize2 className="w-4 h-4 text-amber-300" />
                      <span>Inspect {imageSize}</span>
                    </button>
                  </>
                ) : (
                  <div className="p-6 text-center text-amber-800">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-amber-500 opacity-60" />
                    <p className="font-bold text-sm">No Illustration Yet</p>
                    <p className="text-xs text-amber-600 mb-3">
                      Generate a unique {imageSize} picture using Gemini 3 Pro Image!
                    </p>
                  </div>
                )}

                {isGeneratingImg && (
                  <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-300 mb-2" />
                    <p className="font-bold text-sm">Generating Page {currentPageIndex} Illustration...</p>
                    <p className="text-xs text-amber-200">Gemini 3 Pro Image ({imageSize} size)</p>
                  </div>
                )}
              </div>

              {/* Illustration Generator Toolbar (Prompt requirement: Affordance for 1K, 2K, 4K) */}
              <div className="w-full mt-4 bg-white/80 p-3 rounded-2xl border border-amber-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Generate Art:
                  </span>

                  {/* Image Resolution Selector */}
                  <div className="flex gap-1">
                    {(["1K", "2K", "4K"] as ImageSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onChangeImageSize(sz)}
                        className={`px-2 py-0.5 text-[11px] rounded-md font-bold transition ${
                          imageSize === sz
                            ? "bg-amber-600 text-white"
                            : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector & Action */}
                <div className="flex gap-2">
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-medium focus:outline-hidden"
                  >
                    <option value="watercolor">Soft Watercolor</option>
                    <option value="claymation">3D Claymation</option>
                    <option value="crayon">Whimsical Crayon</option>
                    <option value="digital_art">Vibrant Digital</option>
                    <option value="storybook_sketch">Classic Sketch</option>
                  </select>

                  <button
                    onClick={handleGenerateIllustration}
                    disabled={isGeneratingImg}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isGeneratingImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>{currentPage?.imageUrl ? "Re-Imagine" : "Create Picture"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Story Text & Controls */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-amber-50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-200/80 px-2.5 py-1 rounded-lg">
                    Page {currentPageIndex}
                  </span>

                  {/* Text Edit Toggle */}
                  <button
                    onClick={() => {
                      if (isEditingText) handleSaveTextEdit();
                      else setIsEditingText(true);
                    }}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    {isEditingText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Save Text</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Edit Page Text</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Story Sentence Display */}
                {isEditingText ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={6}
                    className="w-full p-3 text-base sm:text-lg font-serif text-amber-950 bg-white border border-amber-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-lg sm:text-2xl font-serif leading-relaxed text-amber-950 tracking-wide select-text">
                    "{currentPage?.text}"
                  </p>
                )}
              </div>

              {/* Individual Page Read Aloud Trigger */}
              <div className="pt-6 border-t border-amber-200/80 flex items-center justify-between">
                <button
                  onClick={() => playTTS(currentPage?.text || "")}
                  disabled={isGeneratingTTS}
                  className="px-4 py-2 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-800" />
                  <span>Listen to Page {currentPageIndex}</span>
                </button>

                <p className="text-[11px] text-amber-700 italic">
                  Voice: {selectedVoice} ({selectedTone})
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Page Navigation Bar */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          id="btn-prev-page"
          onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentPageIndex === 0}
          className="px-4 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 disabled:opacity-30 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Page Dots Indicator */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-md py-1">
          <button
            onClick={() => setCurrentPageIndex(0)}
            className={`w-3 h-3 rounded-full transition cursor-pointer ${
              currentPageIndex === 0 ? "bg-amber-600 scale-125" : "bg-amber-300 hover:bg-amber-400"
            }`}
            title="Cover"
          />
          {pages.map((_, idx) => {
            const pNum = idx + 1;
            return (
              <button
                key={pNum}
                onClick={() => setCurrentPageIndex(pNum)}
                className={`w-3 h-3 rounded-full transition cursor-pointer ${
                  currentPageIndex === pNum ? "bg-amber-600 scale-125" : "bg-amber-300 hover:bg-amber-400"
                }`}
                title={`Page ${pNum}`}
              />
            );
          })}
        </div>

        <button
          id="btn-next-page"
          onClick={() => {
            if (currentPageIndex < totalPages) {
              setCurrentPageIndex((prev) => prev + 1);
            } else {
              triggerConfetti();
            }
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-orange-300/40"
        >
          <span>{currentPageIndex === totalPages ? "Finish Story 🎉" : "Next Page"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
