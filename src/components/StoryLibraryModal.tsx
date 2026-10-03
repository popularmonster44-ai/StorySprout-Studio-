import React from "react";
import { X, BookOpen, Plus, Trash2, Sparkles, Layers } from "lucide-react";
import { Story } from "../types";

interface StoryLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  activeStoryId: string;
  onSelectStory: (storyId: string) => void;
  onOpenCreator: () => void;
  onDeleteStory: (storyId: string) => void;
}

export const StoryLibraryModal: React.FC<StoryLibraryModalProps> = ({
  isOpen,
  onClose,
  stories,
  activeStoryId,
  onSelectStory,
  onOpenCreator,
  onDeleteStory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-amber-950 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-950 font-serif">Story Library</h2>
              <p className="text-xs text-amber-800">Select an existing storybook or create a brand new one!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreator();
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create AI Story</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-amber-800 hover:bg-amber-200/60 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1">
          {stories.map((s) => {
            const isActive = s.id === activeStoryId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectStory(s.id);
                  onClose();
                }}
                className={`group relative rounded-2xl p-4 border-2 transition cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isActive
                    ? "bg-amber-200/80 border-amber-500 ring-2 ring-amber-400"
                    : "bg-white hover:bg-amber-100/60 border-amber-200"
                }`}
              >
                <div>
                  {/* Thumbnail Cover preview */}
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-amber-200/50 relative border border-amber-300">
                    {s.coverImageUrl ? (
                      <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-700 bg-amber-100/80 p-3 text-center">
                        <Sparkles className="w-8 h-8 text-amber-500 opacity-60" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-950/70 text-amber-200 text-[10px] font-bold rounded-md backdrop-blur-xs">
                      {s.genre}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-amber-950 font-serif leading-snug group-hover:text-amber-800 transition">
                    {s.title}
                  </h3>
                  {s.subtitle && (
                    <p className="text-xs text-amber-800 line-clamp-1 italic">{s.subtitle}</p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800/90">
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    {s.pages?.length || 0} Pages
                  </span>

                  {/* Delete button (for user created stories) */}
                  {s.id.startsWith("user-") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStory(s.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
