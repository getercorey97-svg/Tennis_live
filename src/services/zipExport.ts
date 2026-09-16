import JSZip from 'jszip';
import { REPOSITORY_FILES } from '../data/repositoryFiles';

export async function generateRepositoryZip(): Promise<Blob> {
  const zip = new JSZip();

  for (const file of REPOSITORY_FILES) {
    zip.file(file.path, file.content);
  }

  // Also include a Render quickstart instructions text
  const quickstartGuide = `# Quickstart Guide for Render Deployment & GitHub Actions

## 1. Deploy on Render (1-Click Blueprint or Static Site)

### Option A: 1-Click Render Blueprint (Recommended)
1. Push this repository to GitHub.
2. In your Render Dashboard, click **New +** -> **Blueprint**.
3. Select your repository. Render will automatically detect \`render.yaml\` and provision:
   - \`tennis-predictive-engine\`: Vite React Static Site (Free Global CDN, instant builds).
   - \`tennis-engine-api\`: Python FastAPI live engine web service with uvicorn.

### Option B: Manual Static Site Setup on Render
1. In Render, click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure:
   - **Build Command:** \`npm install && npm run build\`
   - **Publish Directory:** \`dist\`
4. Add Rewrite Rule under **Redirects/Rewrites**:
   - **Source:** \`/*\`
   - **Destination:** \`/index.html\`
   - **Action:** \`Rewrite\`
5. Click **Create Static Site**!

---

## 2. GitHub Actions 24/7 Automation

The included \`.github/workflows/\` directory contains automated workflows:
- \`dual_live_engine_master.yml\`: Master pipeline orchestrating both Two-Track engine and FanDuel live radar.
- \`tennis_predictive_engine.yml\`: 24/7 50,000-iteration Monte Carlo predictions.
- \`fanduel_live_watchdog.yml\`: Real-time line monitor and +EV arbitrage tracker.

All changes and markdown reports (\`PREDICTIONS_TODAY.md\` and \`FANDUEL_LIVE_RADAR.md\`) are automatically committed back to \`main\`.
`;
  zip.file('RENDER_DEPLOYMENT_GUIDE.md', quickstartGuide);

  const content = await zip.generateAsync({ type: 'blob' });
  return content;
}

export function downloadBlob(blob: Blob, filename: string = 'tennis-predictive-engine.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
