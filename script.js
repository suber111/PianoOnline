const notes = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.26,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
  'A#5': 932.33, 'B5': 987.77
};

const keyMap = {
  'z': 'C4', 's': 'C#4', 'x': 'D4', 'd': 'D#4', 'c': 'E4',
  'v': 'F4', 'g': 'F#4', 'b': 'G4', 'h': 'G#4', 'n': 'A4',
  'j': 'A#4', 'm': 'B4',
  'q': 'C5', '2': 'C#5', 'w': 'D5', '3': 'D#5', 'e': 'E5',
  'r': 'F5', '5': 'F#5', 't': 'G5', '6': 'G#5', 'y': 'A5',
  '7': 'A#5', 'u': 'B5'
};

const pressedKeys = {};
const noteX = {
  'C4': 0, 'C#4': 42, 'D4': 56, 'D#4': 98, 'E4': 112,
  'F4': 168, 'F#4': 210, 'G4': 224, 'G#4': 266, 'A4': 280,
  'A#4': 322, 'B4': 336,
  'C5': 392, 'C#5': 434, 'D5': 448, 'D#5': 490, 'E5': 504,
  'F5': 560, 'F#5': 602, 'G5': 616, 'G#5': 658, 'A5': 672,
  'A#5': 714, 'B5': 728
};

const noteWidths = {
  'C4': 56, 'D4': 56, 'E4': 56, 'F4': 56, 'G4': 56, 'A4': 56, 'B4': 56,
  'C5': 56, 'D5': 56, 'E5': 56, 'F5': 56, 'G5': 56, 'A5': 56, 'B5': 56,
  'C#4': 36, 'D#4': 36, 'F#4': 36, 'G#4': 36, 'A#4': 36,
  'C#5': 36, 'D#5': 36, 'F#5': 36, 'G#5': 36, 'A#5': 36
};

const noteOffsets = {
  'C#4': 7, 'D#4': 7, 'F#4': 7, 'G#4': 7, 'A#4': 7,
  'C#5': 7, 'D#5': 7, 'F#5': 7, 'G#5': 7, 'A#5': 7
};

const noteHeight = 40;
const risingSpeed = 230; // px/s
const risingNotes = [];

document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('mousedown', () => {
    key.classList.add('active');
    const note = key.dataset.note;
    playNote(note);
    spawnRisingNote(note);
  });
  key.addEventListener('mouseup', () => key.classList.remove('active'));
  key.addEventListener('mouseleave', () => key.classList.remove('active'));
});

document.addEventListener('mouseup', () => {
  document.querySelectorAll('.key.active').forEach(key => key.classList.remove('active'));
});

document.addEventListener('keydown', (e) => {
  const note = keyMap[e.key.toLowerCase()];
  if (note && !pressedKeys[e.key]) {
    pressedKeys[e.key] = true;
    const keyDiv = [...document.querySelectorAll('.key')].find(k => k.dataset.note === note);
    if (keyDiv) keyDiv.classList.add('active');
    playNote(note);
    spawnRisingNote(note);
  }
});

document.addEventListener('keyup', (e) => {
  const note = keyMap[e.key.toLowerCase()];
  if (note) {
    pressedKeys[e.key] = false;
    const keyDiv = [...document.querySelectorAll('.key')].find(k => k.dataset.note === note);
    if (keyDiv) keyDiv.classList.remove('active');
  }
});

function playNote(note) {
  if (!notes[note]) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.value = notes[note];
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.03);
  g.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.13);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.5);
  o.onended = () => ctx.close();
}

function spawnRisingNote(note) {
  if (!noteX[note]) return;
  risingNotes.push({
    note: note,
    x: noteX[note] + (noteOffsets[note] || 0),
    width: noteWidths[note] || 56,
    y: 0, // Start na górze pianina
    startTime: performance.now()
  });
}

function animateRisingNotes() {
  const container = document.getElementById('falling-notes');
  if (!container) return;
  container.innerHTML = '';
  const now = performance.now();
  for (let i = 0; i < risingNotes.length; i++) {
    const n = risingNotes[i];
    n.y = 0 - ((now - n.startTime) / 1000) * risingSpeed;
    if (n.y + noteHeight > -container.offsetHeight) {
      const div = document.createElement('div');
      div.className = 'note-rect';
      div.style.left = n.x + 'px';
      div.style.top = n.y + 'px';
      div.style.width = n.width + 'px';
      div.style.height = noteHeight + 'px';
      container.appendChild(div);
    }
  }
  while (risingNotes.length && risingNotes[0].y + noteHeight < -container.offsetHeight) {
    risingNotes.shift();
  }
  requestAnimationFrame(animateRisingNotes);
}
animateRisingNotes();
