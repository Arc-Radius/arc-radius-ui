# Arc Radius UI — Technical Documentation

## Overview

Arc Radius is a cross-platform LGBTQ+ legislative tracking application built with React Native, Expo, and TypeScript. It provides an interactive map of US state legislative climates, detailed bill tracking, AI-powered Q&A via a knowledge graph, crisis resources, and advocacy tools.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.81.5 |
| Build | Expo | 54.0.0 |
| Routing | Expo Router | 6.0.23 |
| Styling | NativeWind (Tailwind CSS) | 3.4.0 |
| Icons | lucide-react-native | 0.577.0 |
| Typography | Greycliff CF | Custom OTF |
| Language | TypeScript | 5.9.2 |
| State | React Hooks (local) | — |

---

## Project Structure

```
arc-radius-ui/
├── app/                            # File-based routing (Expo Router)
│   ├── _layout.tsx                 # Root layout: font loading, SafeAreaProvider
│   └── (app)/                      # Main app group
│       ├── _layout.tsx             # AppShell wrapper
│       ├── index.tsx               # Home route (/)
│       ├── ask.tsx                 # Knowledge Graph Q&A (/ask)
│       ├── crisis.tsx              # Crisis resources (/crisis)
│       └── state/
│           ├── [state].tsx         # State bills list (/state/CA)
│           └── [state]/
│               └── [billId].tsx    # Bill detail (/state/CA/bill-1)
│
├── components/                     # Reusable components
│   ├── ui/                         # Primitives (Button, Card, ArcRadiusLogo)
│   ├── navigation/                 # Shell, tabs, route config
│   ├── HomeScreen.tsx              # Landing page
│   ├── Header.tsx                  # Top bar with logo + status
│   ├── BottomNav.tsx               # Bottom tab navigation
│   ├── HeroSection.tsx             # Hero banner with CTA
│   ├── StateSearch.tsx             # Hex map + state detail panel
│   ├── StateDropdown.tsx           # Searchable state selector
│   ├── StateBillsPage.tsx          # Bills list with filters
│   ├── StateDashboard.tsx          # State legislature info card
│   ├── BillDetailPage.tsx          # Full bill detail + actions
│   ├── StateBillCard.tsx           # Individual bill card
│   ├── BillFilterSidebar.tsx       # Filter panel
│   ├── TakeAction.tsx              # Action cards + crisis callout
│   ├── PrivacyBanner.tsx           # Privacy notice
│   └── BillRecordPlaceholder.tsx   # Graph bill metadata display
│
├── static/                         # Shared data and constants
│   ├── states.ts                   # 50 states, status, colors, map layout
│   ├── billConstants.ts            # Stance colors, badge styles, types
│   └── bills.ts                    # Bill data factory
│
├── fonts/Greycliff/                # Greycliff CF (4 weights loaded)
├── assets/                         # Logo, icons, splash
└── global.css                      # Tailwind directives, scrollbar styles
```

---

## Routing

### Route Map

| Path | File | Component | Description |
|------|------|-----------|-------------|
| `/` | `index.tsx` | `HomeScreen` | Landing: hero, hex map, action cards, privacy |
| `/ask` | `ask.tsx` | `AskRoute` | Knowledge Graph Q&A chat interface |
| `/crisis` | `crisis.tsx` | `CrisisRoute` | Hotlines, legal resources, support orgs |
| `/state/[state]` | `[state].tsx` | `StateBillsPage` | Bills for a state with filters and tabs |
| `/state/[state]/[billId]` | `[billId].tsx` | `BillDetailPage` | Bill detail, letter generation, report |

### Route Parameters

- `[state]` — Two-letter abbreviation (e.g., `CA`, `TX`)
- `[billId]` — Unique bill identifier (e.g., `bill-1`)
- `billTab` — Optional query param: `active` or `passed`

### Navigation Flow

```
HomeScreen
  ├── "Find your state" → scrolls to hex map
  ├── Select state → scrolls to map, shows detail panel
  ├── "View bills" → /state/[state]
  ├── Crisis card → /crisis
  └── About button → external landing page

StateBillsPage
  ├── Active/Passed tabs → filters bill list
  ├── Bill card press → /state/[state]/[billId]
  └── State dropdown → /state/[newState]

BillDetailPage
  ├── Summary / Details / Action tabs
  ├── Generate letter → mock AI generation
  ├── Report misclassification → modal flow
  └── X close → back to state bills
```

---

## Platform Architecture

### AppShell (Polymorphic)

The app uses Expo's file-based platform selection:

- `AppShell.native.tsx` — SafeAreaView + Header + Slot + BottomNav
- `AppShell.web.tsx` — max-width container with responsive padding

Both render the same Header and BottomNav components, with the route content in a `Slot`.

### Responsive Breakpoints

```
width < 768    → compact/mobile layout (single column, stacked)
width >= 768   → wide/desktop layout (side-by-side, multi-column)
```

Checked via `useWindowDimensions()` in components that need layout switching.

### Platform-Specific Logic

| Feature | Native | Web |
|---------|--------|-----|
| Safe area insets | `useSafeAreaInsets()` | Fallback to 0 |
| Shadows | `shadowColor/Offset/Opacity` | `shadow-sm` (CSS) |
| Backdrop blur | Not supported | `backdropFilter: blur(16px)` |
| Scrollbar styling | Native default | Custom thin scrollbar via CSS |
| Top padding | `paddingTop: 12` | `paddingTop: 32` |

---

## Component Architecture

### Component Hierarchy

```
AppShell
├── Header
│   ├── ArcRadiusLogo
│   ├── Status text (contextual per route)
│   └── About button (external link)
├── [Route Content]
│   ├── HomeScreen
│   │   ├── HeroSection (animated CTA + stat pills)
│   │   ├── StateSearch
│   │   │   ├── StateDropdown
│   │   │   └── HexMap (SVG tile grid)
│   │   ├── TakeAction
│   │   │   ├── TimelineCard / HorizontalCard (x3)
│   │   │   └── CrisisCallout (animated chevron)
│   │   └── PrivacyBanner
│   ├── StateBillsPage
│   │   ├── StateDashboard
│   │   ├── Active/Passed toggle (animated pill)
│   │   ├── BillFilterSidebar
│   │   └── StateBillCard (list)
│   ├── BillDetailPage
│   │   ├── Bill header (title, stance pill, sponsors)
│   │   ├── Tabs: Summary / Details / Action
│   │   ├── SegmentedToggle (Format, Tone)
│   │   ├── Letter generation (mock)
│   │   ├── Report modal (mock Google Form flow)
│   │   └── RelatedBillsSection
│   ├── AskRoute
│   │   ├── Knowledge Graph card + suggested questions
│   │   ├── ChatBubble (user/assistant)
│   │   ├── SourcePill (bill/entity/relationship)
│   │   ├── TypingIndicator
│   │   └── Input bar + Send button
│   └── CrisisRoute
│       ├── Emergency banner (911)
│       ├── ResourceCard (hotlines)
│       ├── CompactCrisisCard (general crisis)
│       └── LegalOrgCard (legal resources)
└── BottomNav
    └── 4 tabs: Home, Bills, Ask, Get Help
```

### Key Component Patterns

**SegmentedToggle** — Reusable two-option toggle with stance-colored active state. Used for Format (Email/Phone) and Tone (Formal/Conversational) in BillDetailPage.

**Glass Effect** — Translucent backgrounds with subtle borders used across the app:
```typescript
{ backgroundColor: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.1)' }  // Blue glass
{ backgroundColor: 'rgba(249,115,22,0.04)', borderColor: 'rgba(249,115,22,0.08)' }  // Amber glass
{ backgroundColor: 'rgba(24,24,27,0.98)', borderColor: 'rgba(255,255,255,0.08)' }   // Dark glass
```

**Stance-Driven Styling** — Colors, labels, and badges derive from the bill's legislative stance:
```
supportive → blue (#3b82f6 family)
mixed      → zinc (#71717a family)
harmful    → orange (#f97316 family)
```

---

## State Management

The app uses **local React state** exclusively — no external state management library.

### Patterns

| Pattern | Usage |
|---------|-------|
| `useState` | UI state (selected tab, filters, modal visibility) |
| `useMemo` | Derived data (filtered bills, parsed bill records) |
| `useCallback` | Stable handlers (navigation, selection) |
| `useRef` | Scroll positions, animation values |
| `useLocalSearchParams` | URL params from Expo Router |
| `useRouter` | Programmatic navigation |

### Data Flow

```
static/states.ts ──→ STATES record ──→ StateSearch, StateDashboard, Header
static/bills.ts  ──→ getBillsForState() ──→ StateBillsPage ──→ BillDetailPage
static/billConstants.ts ──→ color/label constants ──→ all bill-related components
```

Bills are generated on-the-fly by `getBillsForState()` using the state abbreviation and status. In production, this would be replaced with API calls.

---

## Design System

### Typography

| Class | Font | Weight | Usage |
|-------|------|--------|-------|
| `font-sans` | Greycliff CF Regular | 400 | Body text, labels |
| `font-sans-medium` | Greycliff CF Medium | 500 | Emphasized text, values |
| `font-sans-semibold` | Greycliff CF DemiBold | 600 | Section headers, active states |
| `font-sans-bold` | Greycliff CF Bold | 700 | Page titles, headings |

React Native does not inherit font family from parent elements. Every `Text` component must explicitly include a `font-sans*` class.

### Color Palette

**Stance Colors (Colorblind-Safe — Okabe-Ito):**

| Stance | Dot | Badge Text | Badge BG | Check BG |
|--------|-----|-----------|----------|----------|
| Supportive | `#93c5fd` | `#1d4ed8` | `rgba(147,197,253,0.15)` | `#3b82f6` |
| Mixed | `#a1a1aa` | `#52525b` | `rgba(161,161,170,0.15)` | `#71717a` |
| Harmful | `#fdba74` | `#c2410c` | `rgba(253,186,116,0.15)` | `#f97316` |

**UI Colors:**

| Token | Value | Usage |
|-------|-------|-------|
| `bg-app-bg` | `#f0f2f6` | App background |
| `text-zinc-900` | `#18181b` | Primary text |
| `text-zinc-600` | `#52525b` | Secondary text |
| `text-zinc-500` | `#71717a` | Tertiary/label text |
| `border-zinc-200` | `#e4e4e7` | Card borders |

### Spacing

The app follows Tailwind's default 4px scale. Common patterns:
- Card padding: `p-4` (16px)
- Section gaps: `gap-3` (12px) to `gap-5` (20px)
- Page horizontal padding: `px-4` mobile, `sm:px-6`, `md:px-8` desktop
- Max content width: `max-w-[880px]` or `max-w-screen-lg`

---

## Animations

| Animation | Component | Technique | Duration |
|-----------|-----------|-----------|----------|
| Arrow bounce | HeroSection | `Animated.loop` + `translateY` | 600ms |
| Chevron nudge | CrisisCallout | `Animated.loop` + `translateX` | 600ms |
| Tab pill slide | StateBillsPage | `Animated.timing` + `left` | 200ms |
| Bill card expand | StateBillCard | `LayoutAnimation` | System default |
| Filter collapse | BillFilterSidebar | `LayoutAnimation` | System default |

All animations use `useNativeDriver: true` where possible for performance.

---

## Accessibility

- **Colorblind-safe palette**: Okabe-Ito colors for stance indicators
- **Status symbols**: `●` (supportive), `▲` (mixed), `■` (harmful) supplement color
- **Screen reader**: `accessibilityRole`, `accessibilityLabel`, `accessibilityState` on interactive elements
- **Announcements**: `AccessibilityInfo.announceForAccessibility()` on state selection
- **Touch targets**: Minimum 44px tap targets on mobile

---

## Key Features

### Hex Map (StateSearch)
SVG-based tile grid approximating US geography. Each tile is color-coded by legislative status. Tapping a state shows a detail panel with status, legislature info, and a "View bills" CTA. Layout defined in `MAP_ROWS` from `static/states.ts`.

### Bill Detail + Letter Generation (BillDetailPage)
Three-tab layout (Summary/Details/Action). The Action tab includes:
- Stance/Confidence/To metadata
- Format (Email/Phone) and Tone (Formal/Conversational) toggles
- Personal context input with PII warning
- Mock letter generation with copy/mail actions
- Report misclassification modal (mock Google Form flow)

### Knowledge Graph Q&A (AskRoute)
Chat interface with:
- Suggested questions as tappable cards
- Mock RAG responses with source citations
- Source pills color-coded by type: bill (blue), entity (purple), relationship (orange)
- "How it works" explainer card

### Crisis Resources (CrisisRoute)
Comprehensive directory of hotlines, text lines, and legal resources with:
- Direct call/text/web actions via `Linking.openURL`
- Responsive card layouts (2-column desktop, 1-column mobile)
- LGBTQ+-specific and general crisis support sections

---

## Build & Development

```bash
# Development
npm start              # Start Expo dev server
npm run web            # Start web dev server
npm run ios            # Start iOS simulator
npm run android        # Start Android emulator

# Quality
npm run lint           # ESLint + Prettier check
npm run format         # Auto-fix lint + format

# Production
npx expo export --platform web    # Web build → dist/
npx expo prebuild                 # Generate native projects
```

### Build Output
- Web: ~3 MB JS bundle (2479 modules), gzips to ~800 KB
- Assets: 23 files (fonts, images, icons)
- CSS: ~41 KB

---

## Next Step: API Integration

The UI currently uses mock data from `static/bills.ts`. The next milestone is wiring each page to the `arc-radius-api` (FastAPI + Neo4j + Bedrock). Neo4j is the single source of truth for all bill data, state metadata, topics, sponsors, and relationships.

### API Architecture

```
arc-radius-ui                          arc-radius-api (FastAPI on Lambda)
─────────────                          ─────────────────────────────────
                                       ┌─────────────────────────────┐
  HomeScreen ──── GET /states ────────→│  Neo4j: State nodes +       │
                                       │  aggregate bill counts      │
                                       └─────────────────────────────┘
                                       ┌─────────────────────────────┐
  StateBillsPage ── GET /bills ───────→│  Neo4j: Bill nodes filtered │
                                       │  by state, stance, status   │
                                       └─────────────────────────────┘
                                       ┌─────────────────────────────┐
  BillDetailPage ── GET /bills/:id ──→│  Neo4j: Bill + Documents +  │
                 ── POST /generate ──→│  Chunks → Bedrock Claude    │
                                       └─────────────────────────────┘
                                       ┌─────────────────────────────┐
  AskRoute ──── GET /bills/rag ───────→│  Neo4j: vector search →     │
                                       │  chunk expansion → Claude   │
                                       └─────────────────────────────┘
```

### Neo4j Graph Schema

```
(State)─[:HAS_BILL]→(Bill)─[:HAS_DOCUMENT]→(Document)─[:HAS_CHUNK]→(Chunk)
                       │
                       ├──[:HAS_TOPIC]→(Topic)
                       ├──[:HAS_SPONSOR]→(Person)
                       ├──[:REFERRED_TO]→(Committee)
                       ├──[:HAS_ROLLCALL]→(RollCall)
                       └──[:HAS_ACTION]→(Action)

Key Properties:
  Bill:   bill_pk, title, description, state, bill_number, year, status_desc,
          label, passed, failed, vetoed, url, sponsorship_ratio, bipartisan_ratio
  Chunk:  chunk_id, text, chunk_index, section_path, embedding (1024-dim vector)
  State:  code, name
  Topic:  name
```

### API Endpoints

| Endpoint | Method | Status | Used By | Expected Latency |
|----------|--------|--------|---------|-----------------|
| `/states` | GET | **New** | HomeScreen, StateSearch, StateDashboard | < 1s |
| `/bills` | GET | **New** | StateBillsPage, BillFilterSidebar | < 2s |
| `/bills/:billPk` | GET | **New** | BillDetailPage (all 3 tabs) | < 2s |
| `/bills/rag` | GET | Exists | AskRoute | 3-8s |
| `/generate/bill` | POST | Exists | BillDetailPage (summary, why it matters) | 3-8s |
| `/generate/letter` | POST | **New** | BillDetailPage (action tab) | 5-15s |
| `/ask/suggest` | GET | **Optional** | AskRoute (suggested questions) | < 1s |

Each GET endpoint returns everything its page needs in a single call — no chained requests.

- **`/states`** — All 50 states with status, legislature info, bill counts. Hex map, detail panel, and dashboard all derive from this one response.
- **`/bills`** — All bills for a state. Filters (stance, category, year) are applied client-side from the same cached data. Query params: `state`, `tab`, `sort`, `page`, `limit`.
- **`/bills/:billPk`** — Full bill with graph metadata (confidence, passRate, bipartisanRatio), sponsors, history, related bills, sponsor contact. All 3 tabs read from one cached object.
- **`/generate/letter`** — RAG retrieval + Claude generation. Body: `{ bill_pk, stance, format, tone, personalContext? }`.
- **Crisis page** — No API. Static client-side data for reliability and offline access.

#### `/ask/suggest` — Optional (nice-to-have)

Queries Neo4j for the most active topics and templates them into suggested questions:

```cypher
MATCH (t:Topic)<-[:HAS_TOPIC]-(b:Bill)-[:IN_STATE]->(s:State)
WITH t.name AS topic, count(b) AS billCount
ORDER BY billCount DESC LIMIT 5
RETURN topic, billCount
```

Server-side templates the results:
- `"healthcare"` (47 bills) → "What healthcare bills are affecting LGBTQ+ youth right now?"
- `"education"` (31 bills) → "Which states have new education-related bills this session?"
- `"identity documents"` (22 bills) → "How are identity document laws changing across states?"

No LLM involved — just a Cypher aggregate + string template. If skipped, the hardcoded `SUGGESTED_QUESTIONS` array in `ask.tsx` works for demo.

---

### Lambda 29s Timeout Considerations

Most endpoints are fast Neo4j queries (< 2s). The risk is in LLM generation calls that hit Bedrock Claude:

| Concern | Endpoint | Mitigation |
|---------|----------|------------|
| Cold start | All | Provisioned concurrency (saves ~3-5s) |
| Large RAG context | `/generate/letter` | Limit to top 5 chunks instead of expanding to 50 related bills |
| Long output | `/generate/letter` | Cap `max_tokens` at 512 (letters don't need 1024) |
| Streaming | `/bills/rag`, `/generate/*` | Lambda response streaming via function URLs — UI shows text as it generates |
| Timeout | `/generate/letter` | If still slow: split into async — POST returns `{ jobId }`, client polls `GET /jobs/:jobId` |

The existing `/bills/rag` and `/generate/bill` endpoints already run within Lambda limits, so letter generation should too with a tighter context window.

---

### Integration Tasks

#### Task 1: Setup TanStack Query

Install and configure the data fetching layer.

- [ ] `npm install @tanstack/react-query`
- [ ] Add `QueryClientProvider` in `app/_layout.tsx`
- [ ] Create `lib/api.ts` with base URL from `EXPO_PUBLIC_API_URL` and typed fetcher
- [ ] Create `lib/queries.ts` with `useStates()`, `useBills(state)`, `useBill(billPk)` hooks
- [ ] Create `lib/mutations.ts` with `useGenerateBill()`, `useGenerateLetter()` hooks

#### Task 2: Wire Home Page

Replace static state data with live API.

- [ ] Replace `STATES` import with `useStates()` query (calls `GET /states`)
- [ ] Derive `stateMap`, `statusCounts` via `useMemo` from query data
- [ ] Update `StateSearch`, `StateDashboard`, `HeroSection` stat pills to use live data
- [ ] Add loading skeleton / spinner while `/states` loads

#### Task 3: Wire State Bills Page

Replace mock bills with live API.

- [ ] Replace `getBillsForState()` with `useBills(stateAbbr)` query (calls `GET /bills`)
- [ ] Derive filter options (stances, categories, years) client-side via `useMemo`
- [ ] Apply filters client-side from the cached response — no re-fetch on filter change
- [ ] Add loading state and empty state handling

#### Task 4: Wire Bill Detail Page

Replace mock bill detail with live API.

- [ ] Replace static bill prop with `useBill(billPk)` query (calls `GET /bills/:billPk`)
- [ ] All 3 tabs (Summary/Details/Action) read from the same cached query
- [ ] Wire "Generate letter" button to `useGenerateLetter()` mutation (calls `POST /generate/letter`)
- [ ] Wire summary/why it matters to `useGenerateBill()` mutation (calls `POST /generate/bill`)
- [ ] Add loading indicator during letter generation (may take 5-15s)

#### Task 5: Wire Ask Page

Replace mock chat with live RAG.

- [ ] Replace `MOCK_RESPONSES` with `GET /bills/rag` call on message send
- [ ] Map response `sources` to `SourcePill` components (bill/entity/relationship)
- [ ] Show typing indicator during RAG query (3-8s expected)
- [ ] (Optional) Replace `SUGGESTED_QUESTIONS` with `GET /ask/suggest`

#### Task 6: New API Endpoints (arc-radius-api)

Build the endpoints that don't exist yet.

- [ ] `GET /states` — Cypher aggregate: bills grouped by state, count by status
- [ ] `GET /bills` — Filtered bill query with pagination, traverse to topics/sponsors
- [ ] `GET /bills/:billPk` — Full bill traversal: documents, topics, sponsors, actions, related bills
- [ ] `POST /generate/letter` — RAG context (top 5 chunks) + Claude prompt with format/tone/stance
- [ ] (Optional) `GET /ask/suggest` — Topic aggregate + string templates
