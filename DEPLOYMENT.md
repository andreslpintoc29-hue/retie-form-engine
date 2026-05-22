# RETIE Inspection Platform - Deployment Guide

## Overview

This document describes the deployment strategy for the RETIE Inspection Platform, including environment setup, CI/CD pipeline, and production configuration.

---

## 1. Environment Configuration

### Environment Variables

Create environment-specific `.env.local` files:

```bash
# .env.local (Development)
NEXT_PUBLIC_ENVIRONMENT=local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.staging (Staging)
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_APP_URL=https://staging.retie-platform.com

# .env.production (Production)
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://retie-platform.com
```

### Firebase Projects

| Environment | Project ID | Purpose |
|-------------|------------|---------|
| local | retie-demo-local | Development testing |
| staging | retie-demo-staging | QA/Testing |
| production | retie-inspection-prod | Production |

---

## 2. Deployment Options

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Environment variables in Vercel dashboard
# Add:
# - FIREBASE_API_KEY
# - FIREBASE_AUTH_DOMAIN
# - FIREBASE_PROJECT_ID
# - etc.
```

**vercel.json** configuration:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs"
}
```

### Option B: Firebase Hosting

```bash
# Build for Firebase
npm run build

# Initialize Firebase (if not done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**firebase.json**:
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "/**",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" }
        ]
      }
    ]
  }
}
```

---

## 3. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install --legacy-peer-deps
      - run: npm run lint
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel-args: '--prod'

  deploy-production:
    needs: deploy-staging
    if: github.event.inputs.environment == 'production'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
```

---

## 4. Firebase Setup

### Firestore Collections

```
/tenants/{tenantId}
  - name: string
  - settings: object
  - createdAt: timestamp

/users/{userId}
  - email: string
  - displayName: string
  - role: 'inspector' | 'supervisor' | 'admin'
  - tenantId: string
  - permissions: string[]
  - createdAt: timestamp

/inspections/{inspectionId}
  - inspectionCode: string
  - tenantId: string
  - status: string
  - siteName: string
  - siteAddress: string
  - inspectorId: string
  - answers: map
  - compliance: map
  - createdAt: timestamp
  - updatedAt: timestamp

/attachments/{attachmentId}
  - inspectionId: string
  - fieldId: string
  - type: 'photo' | 'video' | 'document'
  - storagePath: string
  - downloadURL: string
  - uploadedBy: string
  - uploadedAt: timestamp

/audit/{auditId}
  - inspectionId: string
  - fieldId: string
  - action: string
  - userId: string
  - timestamp: timestamp

/schemas/{schemaId}
  - name: string
  - version: string
  - tenantId: string
  - status: 'draft' | 'active' | 'deprecated'
  - schema: object
  - createdBy: string
  - createdAt: timestamp
```

### Storage Structure

```
/{tenantId}/inspections/{inspectionId}/photos/{filename}
/{tenantId}/inspections/{inspectionId}/signatures/{filename}
/{tenantId}/inspections/{inspectionId}/pdfs/{filename}
```

### Security Rules

Deploy with:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## 5. Production Checklist

### Before First Deploy

- [ ] Create Firebase projects (staging, production)
- [ ] Configure Firestore security rules
- [ ] Set up Storage rules
- [ ] Configure authentication (email/password, Google)
- [ ] Add environment variables to Vercel/Firebase
- [ ] Test API endpoints locally
- [ ] Run all unit tests

### Pre-Production

- [ ] Run E2E tests
- [ ] Verify offline functionality
- [ ] Test PDF generation
- [ ] Verify sync mechanism
- [ ] Check error handling

### Production

- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure logging
- [ ] Verify backup strategy
- [ ] Document support contacts

---

## 6. Rollback Strategy

If issues are detected in production:

1. **Vercel**: Use dashboard to revert to previous deployment
2. **Firebase**: Redeploy previous version
3. **Database**: Maintain last backup for data recovery

---

## 7. Monitoring

### Recommended Tools

| Tool | Purpose | Setup |
|------|---------|-------|
| Sentry | Error tracking | `npm install @sentry/nextjs` |
| Vercel Analytics | Performance | Built-in |
| Firebase Crashlytics | Mobile crashes | Firebase Console |
| LogRocket | Session replay | logrocket.com |

---

## 8. Support

- **Documentation**: `/docs`
- **API Reference**: `/api/docs`
- **Status Page**: Status page URL

---

*Last Updated: May 2024*