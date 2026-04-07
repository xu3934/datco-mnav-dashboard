# DAT.co mNAV Dashboard

Strategy (MSTR) Modified Net Asset Value monitoring platform for the FinTech course assignment.

## Quick Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
cd datco-app
git init
git add .
git commit -m "DAT.co mNAV Dashboard"
```

Go to https://github.com/new and create a new repository (e.g. `datco-mnav-dashboard`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/datco-mnav-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com (sign up with GitHub account — free)
2. Click **"Add New Project"**
3. Select your `datco-mnav-dashboard` repository
4. In **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from https://console.anthropic.com/
5. Click **Deploy**

Vercel will give you a URL like: `https://datco-mnav-dashboard.vercel.app`

### Step 3: Done!

Copy the URL and paste it into your report.

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API key
npm run dev
```

Open http://localhost:3000

## Tech Stack

- Next.js 14 (React)
- Recharts (data visualization)
- Anthropic Claude API (AI insights)
