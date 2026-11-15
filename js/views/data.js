// ============================================================
// VIEW — Data export / import
// ============================================================
import { backButton } from '../core/utils.js';
import { state, saveState, replaceState } from '../core/storage.js';
import { render } from '../core/router.js';

export function renderData(root) {
  root.innerHTML = `
    ${backButton()}
    <h2>💾 data</h2>
    <div class="card">
      <h3>export</h3>
      <p class="small-text">download all your data as a JSON file.</p>
      <button class="primary small" onclick="exportData()">export JSON</button>
    </div>
    <div class="card">
      <h3>import</h3>
      <p class="small-text">load a previously exported JSON file. this replaces all current data.</p>
      <input type="file" id="import-file" accept=".json">
      <button class="small" style="margin-top:0.5rem;" onclick="importData()">import</button>
    </div>
  `;
}

window.exportData = function () {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personal-hub-data.json';
  a.click();
  URL.revokeObjectURL(url);
};

window.importData = function () {
  const fileInput = document.getElementById('import-file');
  if (!fileInput.files.length) return alert('choose a file first');
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (confirm('replace all current data with this file?')) {
        replaceState(data);
        render();
      }
    } catch {
      alert('invalid JSON file');
    }
  };
  reader.readAsText(fileInput.files[0]);
};
