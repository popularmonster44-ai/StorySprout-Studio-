import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { StoryReader } from "./components/StoryReader";
import { StoryCreatorModal } from "./components/StoryCreatorModal";
import { ImageResolutionModal } from "./components/ImageResolutionModal";
import { StoryLibraryModal } from "./components/StoryLibraryModal";
import { ChatCompanion } from "./components/ChatCompanion";
import { SAMPLE_STORIES } from "./data/sampleStories";
import { ImageSize, Story, StoryPage, VoiceName, VoiceTone } from "./types";

export default function App() {
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem("storysprout_stories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not parse saved stories:", e);
    }
    return SAMPLE_STORIES;
  });

  const [activeStoryId, setActiveStoryId] = useState<string>(() => {
    return stories[0]?.id || SAMPLE_STORIES[0].id;
  });

  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>("Kore");
  const [selectedTone, setSelectedTone] = useState<VoiceTone>("cheerful");

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inspectPage, setInspectPage] = useState<StoryPage | null>(null);

  // Sync stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("storysprout_stories", JSON.stringify(stories));
    } catch (e) {
      console.warn("Failed to persist stories to localStorage:", e);
    }
  }, [stories]);

  const activeStory = stories.find((s) => s.id === activeStoryId) || stories[0] || SAMPLE_STORIES[0];

  const handleStoryCreated = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    setActiveStoryId(newStory.id);
  };

  const handleUpdateStory = (updatedStory: Story) => {
    setStories((prev) =>
      prev.map((s) => (s.id === updatedStory.id ? updatedStory : s))
    );
  };

  const handleDeleteStory = (storyId: string) => {
    const updated = stories.filter((s) => s.id !== storyId);
    setStories(updated);
    if (activeStoryId === storyId && updated.length > 0) {
      setActiveStoryId(updated[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/60 text-amber-950 font-sans flex flex-col selection:bg-amber-300">
      {/* Top Navigation */}
      <Navbar
        currentStoryTitle={activeStory.title}
        onOpenCreator={() => setIsCreatorOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        imageSize={imageSize}
        onChangeImageSize={setImageSize}
        selectedVoice={selectedVoice}
        onChangeVoice={setSelectedVoice}
        selectedTone={selectedTone}
        onChangeTone={setSelectedTone}
        storiesCount={stories.length}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      {/* Main Storybook Canvas Workspace */}
      <main className="flex-1 px-3 py-6 sm:px-6 flex items-center justify-center">
        <StoryReader
          story={activeStory}
          onUpdateStory={handleUpdateStory}
          imageSize={imageSize}
          onChangeImageSize={setImageSize}
          selectedVoice={selectedVoice}
          selectedTone={selectedTone}
          onOpenResolutionModal={(page) => setInspectPage(page)}
        />
      </main>

      {/* Footer Branding */}
      <footer className="py-4 border-t border-amber-200/80 text-center text-xs text-amber-800/80">
        <p>StorySprout • Powered by Gemini 3.6 Flash, Gemini 3 Pro Image & Gemini TTS</p>
      </footer>

      {/* Modals & Chatbot Drawer */}
      <StoryCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onStoryCreated={handleStoryCreated}
        defaultImageSize={imageSize}
      />

      <StoryLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        stories={stories}
        activeStoryId={activeStoryId}
        onSelectStory={setActiveStoryId}
        onOpenCreator={() => setIsCreatorOpen(true)}
        onDeleteStory={handleDeleteStory}
      />

      {inspectPage && (
        <ImageResolutionModal
          isOpen={!!inspectPage}
          onClose={() => setInspectPage(null)}
          imageUrl={inspectPage.imageUrl || ""}
          pageNumber={inspectPage.pageNumber}
          storyTitle={activeStory.title}
          prompt={inspectPage.illustrationPrompt}
          imageSize={imageSize}
        />
      )}

      <ChatCompanion
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentStoryTitle={activeStory.title}
        mainCharacter={activeStory.mainCharacter}
        storySummary={activeStory.subtitle}
        selectedVoice={selectedVoice}
        selectedTone={selectedTone}
      />
    </div>
  );
}
