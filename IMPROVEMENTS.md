# Improvement Suggestions

## High Impact

### 1. Progressive Web App (PWA) with Offline Support
- Add a service worker for full offline capability — critical for parents who use this on-the-go or in areas with poor connectivity
- Cache word data, sounds, and game logic locally
- "Install to homescreen" prompt

### 2. Voice Recording & Playback
- Record the child's pronunciation attempts and let them hear themselves vs. the correct pronunciation
- Track improvement over time (save recordings in IndexedDB)
- This is a core speech therapy technique ("auditory feedback loop")

### 3. Adaptive Difficulty
- Auto-adjust word difficulty based on performance (mastered words appear less, struggled words appear more)
- Currently difficulty is static (1/2/3) — add spaced repetition logic
- Track per-word success rate in the store

### 4. Multi-user Profiles
- Allow multiple children to use the app on one device (common in families)
- Simple avatar/name selection without authentication
- Separate progress tracking per profile

---

## Medium Impact

### 5. Sentence Building Game
- `simpleSentences` data exists but isn't used in any game
- Create a drag-and-drop game: arrange word cards to form simple sentences ("mama makan nasi")
- Builds on existing word data

### 6. Richer Feedback in "Ayo Ngomong"
- Show which syllables were pronounced correctly vs. incorrectly (highlight green/red)
- Current fuzzy matching returns match/close/no — extend to syllable-level granularity
- Visual mouth position hints for difficult sounds

### 7. Achievement/Badge System
- Beyond stars: unlockable badges ("First 10 Words", "7-Day Streak", "All Hijaiyah Mastered")
- Creates stronger retention loops
- Simple to implement with current store structure

### 8. Pronunciation Difficulty Map
- Indonesian speech therapy commonly targets: /r/, /s/, /l/, /ng/ clusters
- Tag words by their phonetic challenge, not just general difficulty
- Let parents select target sounds ("anak saya kesulitan huruf R")

---

## Quick Wins

### 9. Sound Toggle
- No global mute button exists — important when parents need silence
- Add to the header/settings

### 10. Expand Word Data
- Currently 60 words — target 150+ for real engagement depth
- Missing categories: warna (colors), angka (numbers), tubuh (body parts), alam (nature)
- These are standard speech therapy vocabulary groups

### 11. Session Summary Screen
- After focus mode ends, show a recap: words practiced, accuracy %, stars earned, time spent
- Currently just shows "break time" overlay with no data

### 12. Confetti/Celebration Throttling
- Add a "calm mode" toggle for children who are overstimulated by celebrations
- Reduce animations and sounds to minimal feedback

---

## Technical Improvements

### 13. Migrate to Database + Auth
- localStorage is fragile (cleared on browser data wipe)
- Supabase would be lightweight: auth + PostgreSQL + realtime, free tier sufficient
- Enables cross-device sync, the #1 parent frustration with localStorage apps

### 14. Analytics Events
- Track which games are played most, which words are hardest, average session length
- Even just logging to localStorage would help parents see patterns
- Currently `weeklyMinutes` exists but no per-game or per-word analytics

### 15. Error Recovery in Speech Recognition
- `onerror` handler exists in the type but no retry logic in the game pages
- Common errors: "network", "not-allowed", "no-speech" — each needs different UX
