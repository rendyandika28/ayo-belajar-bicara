"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { SafeInput } from "@/components/ui/SafeInput";
import { ResponsivePanel } from "@/components/ui/ResponsivePanel";

const emojiOptions = ["\ud83d\udc76", "\ud83d\udc67", "\ud83d\udc66", "\ud83d\udc69", "\ud83e\uddd2", "\ud83d\udc68", "\ud83d\udc70", "\ud83e\uddd1"];

export default function ProfileSwitcher() {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const switchProfile = useAppStore((s) => s.switchProfile);
  const addProfile = useAppStore((s) => s.addProfile);
  const renameProfile = useAppStore((s) => s.renameProfile);
  const removeProfile = useAppStore((s) => s.removeProfile);

  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(emojiOptions[0]);
  const panelRef = useRef<HTMLDivElement>(null);

  const active = profiles.find((p) => p.id === activeProfileId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAdd(false);
        setRenameId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addProfile(newName.trim(), selectedEmoji);
    setNewName("");
    setShowAdd(false);
    setOpen(false);
  };

  const handleRename = () => {
    if (!renameName.trim() || !renameId) return;
    renameProfile(renameId, renameName.trim());
    setRenameId(null);
    setRenameName("");
  };

  const handleSwitch = (id: string) => {
    switchProfile(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-2 shadow-md border-2 border-gray-200 text-sm font-heading min-h-[44px]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        aria-label="Ganti profil"
      >
        <span className="text-lg">{active?.emoji || "\ud83d\udc76"}</span>
        <span className="hidden sm:inline max-w-[80px] truncate">{active?.name || "Si Kecil"}</span>
        <span className="text-xs text-foreground/40">{open ? "\u25b2" : "\u25bc"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <ResponsivePanel className="w-64 bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-3">
            {showAdd ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap justify-center">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedEmoji === e ? "bg-purple-100 ring-2 ring-purple-400" : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedEmoji(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <SafeInput
                  className="font-body text-sm border-2 border-gray-200 rounded-xl px-3 py-2 w-full outline-none focus:border-purple-400"
                  placeholder="Nama anak..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-purple-600 text-white font-heading text-sm py-2 rounded-full"
                    onClick={handleAdd}
                  >
                    Tambah
                  </button>
                  <button
                    className="text-sm font-heading text-gray-400 py-2 px-3"
                    onClick={() => setShowAdd(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-2 min-h-[44px]">
                    <button
                      className={`min-w-0 flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-left font-body text-sm ${
                        profile.id === activeProfileId
                          ? "bg-purple-50 text-purple-700 font-semibold"
                          : "hover:bg-gray-50 text-foreground/80"
                      }`}
                      onClick={() => handleSwitch(profile.id)}
                    >
                      <span className="text-xl flex-shrink-0">{profile.emoji}</span>
                      {renameId === profile.id ? (
                        <SafeInput
                          className="min-w-0 flex-1 border-b-2 border-purple-400 outline-none bg-transparent font-body text-sm"
                          value={renameName}
                          onChange={(e) => setRenameName(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") handleRename();
                          }}
                          onBlur={handleRename}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="min-w-0 flex-1 truncate">{profile.name}</span>
                      )}
                      {profile.id === activeProfileId && (
                        <span className="text-purple-400 text-xs flex-shrink-0">Aktif</span>
                      )}
                    </button>
                    <button
                      className="text-gray-300 hover:text-gray-500 text-sm px-1 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameId(profile.id);
                        setRenameName(profile.name);
                      }}
                      aria-label="Ubah nama"
                    >
                      {"\u270f\ufe0f"}
                    </button>
                    {profiles.length > 1 && (
                      <button
                        className="text-gray-300 hover:text-red-400 text-sm px-1 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProfile(profile.id);
                        }}
                        aria-label="Hapus profil"
                      >
                        {"\u274c"}
                      </button>
                    )}
                  </div>
                ))}
                <hr className="my-2 border-gray-100" />
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-left font-body text-sm text-purple-500 hover:bg-purple-50"
                  onClick={() => setShowAdd(true)}
                >
                  <span className="text-lg">+</span>
                  <span>Tambah Anak</span>
                </button>
              </div>
            )}
            </ResponsivePanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
