import React from "react";
import { BookOpen, Sparkles, PlusCircle, MessageSquareHeart, Image as ImageIcon, Volume2 } from "lucide-react";
import { ImageSize, VoiceName, VoiceTone } from "../types";

interface NavbarProps {
  currentStoryTitle?: string;
  onOpenCreator: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  imageSize: ImageSize;
  onChangeImageSize: (size: ImageSize) => void;
  selectedVoice: VoiceName;
  onChangeVoice: (voice: VoiceName) => void;
  selectedTone: VoiceTone;
  onChangeTone: (tone: VoiceTone) => void;
  storiesCount: number;
  onOpenLibrary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreator,
  onToggleChat,
  isChatOpen,
  imageSize,
  onChangeImageSize,
  selectedVoice,
  onChangeVoice,
  selectedTone,
  onChangeTone,
  onOpenLibrary,
}) => {
  return (
    <header id="app-navbar" className="sticky top-0 z-30 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <button
            id="btn-brand-logo"
            onClick={onOpenLibrary}
            className="flex items-center gap-2 group text-left cursor-pointer transition transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-300/40 group-hover:rotate-6 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl text-amber-950 tracking-tight font-serif">
                  StorySprout
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 tracking-wider">
                  Kids AI
                </span>
              </div>
              <p className="text-xs text-amber-700/80 font-medium">Read, Listen & Illustrate</p>
            </div>
          </button>
        </div>

        {/* Global Controls: Image Resolution, TTS Voice, Story Library, Create Story & Chat */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Image Size Selector (1K, 2K, 4K affordance requirement) */}
          <div className="hidden sm:flex items-center gap-1 bg-amber-100/80 p-1 rounded-xl border border-amber-200/80 text-xs">
            <span className="text-amber-800 font-semibold px-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              Size:
            </span>
            {(["1K", "2K", "4K"] as ImageSize[]).map((sz) => (
              <button
                key={sz}
                id={`btn-size-${sz}`}
                onClick={() => onChangeImageSize(sz)}
                className={`px-2 py-1 rounded-lg font-bold transition ${
                  imageSize === sz
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-800 hover:bg-amber-200/60"
                }`}
                title={`Generate illustrations in ${sz} resolution`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Voice Selector for Gemini TTS */}
          <div className="hidden md:flex items-center gap-1 bg-amber-100/80 px-2 py-1 rounded-xl border border-amber-200/80 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <select
              id="select-voice"
              value={selectedVoice}
              onChange={(e) => onChangeVoice(e.target.value as VoiceName)}
              className="bg-transparent text-amber-900 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="Kore">Voice: Kore (Warm)</option>
              <option value="Puck">Voice: Puck (Playful)</option>
              <option value="Charon">Voice: Charon (Deep)</option>
              <option value="Zephyr">Voice: Zephyr (Lively)</option>
              <option value="Fenrir">Voice: Fenrir (Gentle)</option>
            </select>

            <select
              id="select-tone"
              value={selectedTone}
              onChange={(e) => onChangeTone(e.target.value as VoiceTone)}
              className="bg-transparent text-amber-900 font-medium focus:outline-hidden border-l border-amber-300 pl-1 cursor-pointer"
            >
              <option value="cheerful">Tone: Cheerful</option>
              <option value="calm_bedtime">Tone: Bedtime</option>
              <option value="dramatic_adventure">Tone: Dramatic</option>
              <option value="silly_playful">Tone: Playful</option>
            </select>
          </div>

          {/* Library Button */}
          <button
            id="btn-open-library"
            onClick={onOpenLibrary}
            className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition border border-amber-200"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Library</span>
          </button>

          {/* Create Story Wizard Button */}
          <button
            id="btn-create-story"
            onClick={onOpenCreator}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-300/50 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Story AI</span>
          </button>

          {/* Gemini Chatbot Mascot Button */}
          <button
            id="btn-toggle-chat"
            onClick={onToggleChat}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition transform active:scale-95 border ${
              isChatOpen
                ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-300/40"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200/80"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isChatOpen ? "text-amber-300 animate-spin" : "text-indigo-600"}`} />
            <span>Story Buddy</span>
            <MessageSquareHeart className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
};
