# RETIE Inspection Platform - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd retie-form-engine

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local
```

### 2. Configure Firebase (Optional for local dev)

Edit `.env.local`:
```env
# Use demo/mock mode for local development
NEXT_PUBLIC_FIREBASE_API_KEY=demo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo.local
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo
NEXT_PUBLIC_ENVIRONMENT=local
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

### 3. Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000/demo

---

## Project Structure

```
retie-form-engine/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   └── demo/         # Demo page
│   ├── core/             # Core platform
│   │   ├── integration/  # Event bus, orchestrator
│   │   ├── formLifecycle.ts
│   │   ├── useFormEngine.ts
│   │   ├── errorManager.ts
│   │   └── devtools.tsx
│   ├── engines/          # 16 engines
│   │   ├── state/         # Form state (Zustand)
│   │   ├── formulas/      # Formula engine
│   │   ├── rules/         # Rule engine
│   │   ├── validation/    # Validation engine
│   │   ├── offline/       # IndexedDB
│   │   ├── firebase/      # Firebase services
│   │   ├── pdf/           # PDF generation
│   │   └── ...
│   ├── data/             # Firestore schemas, rules
│   ├── schemas/          # JSON schemas
│   │   └── retie/         # Real RETIE schemas
│   └── test/             # Test setup
├── public/
├── .env.example          # Environment template
├── DEPLOYMENT.md         # Deployment guide
├── ARCHITECTURE.md       # Architecture docs
└── package.json
```

---

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

---

## Running Tests

### Unit Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Specific Engine Tests
```bash
# Test Rule Engine
npm test -- ruleEngine

# Test Formula Engine
npm test -- formulaEngine

# Test Validation Engine
npm test -- validationEngine
```

---

## Firebase Emulator (Optional)

For local Firebase development without credentials:

1. Install Firebase CLI
2. Run emulator:
```bash
firebase init emulators
firebase emulators:start
```

---

## Demo Features

The demo page (`/demo`) includes:

- ✅ Full form with 3 RETIE sheets
- ✅ Real-time event tracking
- ✅ Compliance calculation
- ✅ Auto-save to IndexedDB
- ✅ Offline status monitoring
- ✅ PDF generation (simulated)
- ✅ DevTools panel

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `local` |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3000` |
| `NEXT_PUBLIC_ENABLE_OFFLINE_MODE` | Enable offline | `true` |
| `NEXT_PUBLIC_ENABLE_DEVTOOLS` | Enable devtools | `true` |

### Firebase Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## Common Issues

### Build Issues
```bash
# If npm install fails with peer deps
npm install --legacy-peer-deps

# If SWC binary issue (Windows)
npm rebuild
```

### TypeScript Errors
```bash
# Regenerate types
rm -rf node_modules/.cache
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

---

## Adding a New RETIE Schema

1. Create schema in `src/schemas/retie/`
2. Add to master schema or load dynamically
3. Test with demo page

Example:
```typescript
import { useFormEngine } from '@/core/useFormEngine';
import { MY_SCHEMA } from '@/schemas/retie/my-schema';

const formEngine = useFormEngine({
  inspectionId: 'new-inspection',
  schema: MY_SCHEMA
});
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inspections` | GET, POST | List/Create inspections |
| `/api/inspections/[id]` | GET, PUT, DELETE | Inspection CRUD |
| `/api/attachments/upload` | POST | Upload file |
| `/api/sync` | GET, POST | Sync operations |
| `/api/schemas` | GET, POST | Schema registry |
| `/api/pdf` | POST | Generate PDF |

---

## Troubleshooting

### "Database not initialized"
- IndexedDB needs time to initialize
- Refresh page after first load

### "Firebase not configured"
- This is expected in local dev mode
- Add Firebase credentials to enable

### Offline mode not working
- Check browser supports IndexedDB
- Clear browser data and refresh

---

## Next Steps After Setup

1. ✅ Run demo at `/demo`
2. Test validation rules
3. Test formulas
4. Configure Firebase (optional)
5. Deploy to staging/production

---

*Last Updated: May 2024*
*Version: 1.0.0*