# Agent YOUTUBE — Live Test

## Manual Usage Test: Start → Running → Stop

### Prerequisites
```bash
# Terminal 1: Start backend
pnpm dev:server

# Terminal 2: Start frontend  
pnpm dev:web

# Terminal 3: Run this test
```

### Test Steps

#### 1. Load Dashboard
```
http://localhost:5173 (should auto-login with test user)
```

#### 2. Navigate to MARKETING
```
Click "MARKETING" tab in navbar
→ Should show 6 agent cards (YOUTUBE, REPURPOSE, TWITTER, LINKEDIN, VISUALS, GRAM-BETA)
→ YOUTUBE card shows "IDLE" badge
```

#### 3. Check Initial State (IDLE)
```
YOUTUBE card:
- Badge: "IDLE" (gray background)
- Progress bar: ~62% (static)
- Border: normal (slate-800)
- Buttons: "▶ START" visible

Header counters:
- Agents: 9
- Active: 0 (or current count)
```

#### 4. START the Agent
```
Click "▶ START" button on YOUTUBE card
↓
Watch state transition:
  - Button disabled
  - Badge changes: IDLE → STARTING (blue, pulsing) 
  - Card border glows slightly
  - Progress bar height increases
↓
After ~1-2 seconds:
  - Badge changes: STARTING → ACTIVE (green, pulsing)
  - Header "Active" counter increments (+1)
  - Card styling: border becomes red-ish glow
```

#### 5. Verify ACTIVE State
```
YOUTUBE card now shows:
- Badge: "ACTIVE" with pulsing green dot
- Button: "⏹ STOP" (red)
- Progress bar: animated/full height
- Top bar: "green-500" color
```

#### 6. Open Detail Drawer
```
Click anywhere on YOUTUBE card
→ Right-side drawer slides in
→ Shows:
  - Title: "YOUTUBE"
  - State badge: "ACTIVE"
  - ID: agent-youtube
  - Mission: mission-marketing
  - Started: <timestamp>
  - Buttons: "⏹ STOP" (prominent red)
```

#### 7. STOP the Agent (from drawer)
```
Click "⏹ STOP" button in drawer
↓
Watch state transition:
  - Badge: ACTIVE → STOPPING (orange, pulsing)
  - Button disabled
↓
After ~1-2 seconds:
  - Badge: STOPPING → STOPPED (gray)
  - Button: "▶ START" reappears
  - Header "Active" counter decrements (-1)
```

#### 8. Close Drawer & Verify
```
Click "✕" to close drawer
→ Card still shows STOPPED state in main view
→ All other agents unaffected

Final state:
- YOUTUBE: STOPPED (gray badge)
- Header Active count back to previous
```

---

## What This Tests

✅ **State Machine** — Transitions work (idle → starting → running → stopping → stopped)
✅ **Database Updates** — Agent state persists in SQLite
✅ **tRPC Mutations** — start/stop calls reach backend
✅ **WebSocket Subscriptions** — State changes push to UI in real-time
✅ **EventEmitter** — Backend broadcasts state changes to all connected clients
✅ **Activity Service** — Business logic transitions states correctly
✅ **UI Reactivity** — Vue computed properties update header counters
✅ **Animations** — Badge pulsing, card glow, progress bar changes

---

## How to Verify it Actually Works

### Terminal 3 (separate): Watch DB
```bash
sqlite3 data/swarm.db "SELECT name, state FROM activities WHERE name='YOUTUBE';"
```

Run this before/after START/STOP:
- Before START: state='idle'
- After START: state='running'
- After STOP: state='stopped'

### Terminal 4: Watch WebSocket traffic (Chrome DevTools)
```
F12 → Console → watch for messages from ws://localhost:3000/trpc
→ You'll see subscription events with state changes
```

### Manual API Call (curl)
```bash
# Check current state
curl -X POST http://localhost:3000/trpc/activity.getById \
  -H "Content-Type: application/json" \
  -d '{"id":"agent-youtube"}'

# Response: { state: "running" } or { state: "stopped" }
```

---

## Expected Output After FULL CYCLE

```
1. ✓ agent-youtube starts (badge ACTIVE, button STOP)
2. ✓ Header Active count increments
3. ✓ DB shows state='running'
4. ✓ WebSocket confirms state change (subscription event)
5. ✓ agent-youtube stops (badge STOPPED, button START)
6. ✓ Header Active count decrements
7. ✓ DB shows state='stopped'
8. ✓ All UI elements sync across tabs (if opened in 2 windows)
```

---

## Test Passed ✅ if:
- [x] Card state changes reflect DB state
- [x] Buttons are disabled during transitions
- [x] Badges animate correctly
- [x] Header counters are accurate
- [x] WebSocket updates are instant
- [x] Detail drawer shows correct info
- [x] State persists after page reload
