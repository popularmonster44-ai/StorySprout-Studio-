import React, { useState } from "react";
import { Sparkles, X, Wand2, BookOpen, User, Palette, Layers, Loader2 } from "lucide-react";
import { ImageSize, ImageStyle, Story } from "../types";

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (newStory: Story) => void;
  defaultImageSize: ImageSize;
}

const PRESET_IDEAS = [
  { topic: "The Little Cloud Who Couldn't Rain", genre: "Bedtime", icon: "🌧️" },
  { topic: "Detective Hamster and the Lost Peanut", genre: "Mystery", icon: "🐹" },
  { topic: "The Rocket Ship Made of Cardboard", genre: "Space", icon: "🚀" },
  { topic: "The Princess Who Preferred Building Robots", genre: "Adventure", icon: "🤖" },
  { topic: "The Tree That Grew Glittery Leaves", genre: "Fantasy", icon: "🌳" },
];

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
  defaultImageSize,
}) => {
  const [topic, setTopic] = useState("");
  const [targetAge, setTargetAge] = useState("6-8");
  const [genre, setGenre] = useState("Fantasy");
  const [mainCharacter, setMainCharacter] = useState("");
  const [pageCount, setPageCount] = useState(5);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("watercolor");
  const [imageSize, setImageSize] = useState<ImageSize>(defaultImageSize);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusStep, setStatusStep] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMsg("");
    setStatusStep("Writing magical story with Gemini 3.6 Flash...");

    try {
      // 1. Generate story structure
      const storyRes = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAge,
          genre,
          mainCharacter: mainCharacter.trim() || "a brave young hero",
          pageCount,
          imageStyle,
        }),
      });

      const storyData = await storyRes.json();
      if (!storyData.success || !storyData.story) {
        throw new Error(storyData.error || "Failed to generate story structure.");
      }

      const generatedStory = storyData.story;
      const pages = generatedStory.pages || [];

      setStatusStep("Generating initial illustration for cover & page 1 with Gemini 3 Pro Image...");

      // 2. Generate image for cover and page 1 in parallel or first page
      if (pages.length > 0) {
        try {
          const imgRes = await fetch("/api/image/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: pages[0].illustrationPrompt,
              imageSize,
              style: imageStyle,
              characterDescription: mainCharacter,
            }),
          });
          const imgData = await imgRes.json();
          if (imgData.success && imgData.imageUrl) {
            pages[0].imageUrl = imgData.imageUrl;
            generatedStory.coverImageUrl = imgData.imageUrl;
          }
        } catch (imgErr) {
          console.warn("Cover image generation deferred:", imgErr);
        }
      }

      const fullStory: Story = {
        id: "user-story-" + Date.now(),
        title: generatedStory.title || "My Magical Adventure",
        subtitle: generatedStory.subtitle || "A custom AI story created with StorySprout",
        targetAge: generatedStory.targetAge || targetAge,
        genre: generatedStory.genre || genre,
        mainCharacter: generatedStory.mainCharacter || mainCharacter,
        coverImageUrl: generatedStory.coverImageUrl,
        createdAt: Date.now(),
        pages: pages.map((p: any, idx: number) => ({
          pageNumber: idx + 1,
          text: p.text,
          illustrationPrompt: p.illustrationPrompt,
          imageUrl: p.imageUrl,
        })),
      };

      onStoryCreated(fullStory);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create story. Please try again.");
    } finally {
      setIsGenerating(false);
      setStatusStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-4 right-4 p-2 text-amber-800 hover:bg-amber-200/60 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-300">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-950 font-serif">Create a New AI Story</h2>
            <p className="text-xs text-amber-800">
              Gemini will craft a unique story and generate vibrant illustrations!
            </p>
          </div>
        </div>

        {/* Quick Inspiration Presets */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
            ✨ Quick Story Ideas
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_IDEAS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(preset.topic);
                  setGenre(preset.genre);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-200 font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{preset.icon}</span>
                <span>{preset.topic}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Story Topic */}
          <div>
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              What is the story about?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. A brave little squirrel who wants to build a giant slide down the tallest oak tree..."
              required
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-amber-300 text-amber-950 placeholder-amber-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Main Character */}
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-600" />
                Main Character
              </label>
              <input
                type="text"
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                placeholder="e.g. Barnaby the Purple Dragon"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Genre / Theme */}
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                Genre & Vibe
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Fantasy">✨ Fantasy & Magic</option>
                <option value="Bedtime">🌙 Soft Bedtime Story</option>
                <option value="Space">🚀 Sci-Fi & Space</option>
                <option value="Animals">🐾 Animal Friends</option>
                <option value="Adventure">🧭 Epic Adventure</option>
                <option value="Humor">😂 Funny & Silly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target Age */}
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                Target Age
              </label>
              <select
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="3-5">Toddlers (3-5 yrs)</option>
                <option value="6-8">Early Readers (6-8 yrs)</option>
                <option value="9-12">Kids (9-12 yrs)</option>
              </select>
            </div>

            {/* Page Count */}
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                Pages
              </label>
              <select
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value={3}>Short (3 pages)</option>
                <option value={5}>Standard (5 pages)</option>
                <option value={8}>Extended (8 pages)</option>
              </select>
            </div>

            {/* Art Style */}
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                Art Style
              </label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="watercolor">🎨 Soft Watercolor</option>
                <option value="claymation">🧸 3D Claymation</option>
                <option value="crayon">🖍️ Whimsical Crayon</option>
                <option value="digital_art">✨ Vibrant Digital</option>
                <option value="storybook_sketch">✏️ Classic Sketch</option>
              </select>
            </div>
          </div>

          {/* Image Size Option (1K, 2K, 4K affordance) */}
          <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-amber-900 block">Illustration Quality Resolution:</span>
              <span className="text-amber-700">Powered by Gemini 3 Pro Image</span>
            </div>
            <div className="flex gap-1.5">
              {(["1K", "2K", "4K"] as ImageSize[]).map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => setImageSize(sz)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                    imageSize === sz
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white text-amber-900 border border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-800 hover:bg-amber-200/50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold shadow-md shadow-orange-300/50 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusStep || "Creating..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate Story & Art</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
