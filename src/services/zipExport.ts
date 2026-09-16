import JSZip from 'jszip';
import { REPOSITORY_FILES } from '../data/repositoryFiles';

export async function generateRepositoryZip(): Promise<Blob> {
  const zip = new JSZip();

  for (const file of REPOSITORY_FILES) {
    zip.file(file.path, file.content);
  }

  // Also include a TrebEdit quickstart instructions text
  const quickstartGuide = `# Quickstart Guide for TrebEdit on Samsung Galaxy S26 Ultra

1. Download and open this ZIP file in Samsung My Files.
2. Extract to /Internal Storage/Documents/TennisPredictiveEngine or your TrebEdit workspace folder.
3. Open TrebEdit -> Menu -> Open Project -> Select the extracted folder.
4. If you have Termux installed on your Galaxy S26 Ultra:
   $ cd TennisPredictiveEngine
   $ python -m venv venv && source venv/bin/activate
   $ pip install -r requirements.txt
   $ python scripts/monte_carlo.py
5. Push to GitHub:
   $ git init && git add . && git commit -m "Initial commit"
   $ git remote add origin https://github.com/<your-username>/tennis-engine.git
   $ git push -u origin main
6. GitHub Actions will now automatically poll every 3 hours 24/7!
`;
  zip.file('TREBEDIT_S26_ULTRA_GUIDE.txt', quickstartGuide);

  const content = await zip.generateAsync({ type: 'blob' });
  return content;
}

export function downloadBlob(blob: Blob, filename: string = 'tennis-predictive-engine-trebedit.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
