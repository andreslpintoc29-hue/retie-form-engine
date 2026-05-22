const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function safeRm(dir) {
  try {
    const target = path.resolve(process.cwd(), dir);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
      console.log('Removed', target);
    } else {
      console.log('No folder to remove:', target);
    }
  } catch (e) {
    console.error('Failed to remove', dir, e && e.message);
  }
}

function killPort(port) {
  try {
    // use npx kill-port (installed as devDependency) for cross-platform
    execSync(`npx kill-port ${port}`, { stdio: 'inherit' });
  } catch (e) {
    console.error('kill-port failed (maybe not installed):', e && e.message);
  }
}

(async () => {
  console.log('Cleaning .next and freeing port 3000...');
  safeRm('.next');
  killPort(3000);
  console.log('Cleanup complete. Run `npm run dev` to start dev server.');
})();
