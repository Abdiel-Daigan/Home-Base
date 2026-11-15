// ============================================================
// ACTIONS — journal mutations (with image resize)
// ============================================================
import { state, saveState } from '../core/storage.js';
import { uid } from '../core/utils.js';

export function addJournal() {
  const title = document.getElementById('j-title').value.trim();
  const date = document.getElementById('j-date').value;
  const tags = document.getElementById('j-tags').value.trim();
  const notes = document.getElementById('j-notes').value.trim();
  const fileInput = document.getElementById('j-image');
  if (!title) return alert('please enter a title');

  const finish = (imageData) => {
    state.journal.push({ id: uid(), title, date, tags, notes, image: imageData || null });
    saveState();
    window.renderJournalList();
    // clear form
    ['j-title', 'j-date', 'j-tags', 'j-notes'].forEach(id => document.getElementById(id).value = '');
    fileInput.value = '';
  };

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 400 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    finish(null);
  }
}

export function deleteJournal(id) {
  state.journal = state.journal.filter(e => e.id !== id);
  saveState();
  window.renderJournalList();
}

window.addJournal = addJournal;
window.deleteJournal = deleteJournal;
