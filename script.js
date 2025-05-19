const imageInput = document.getElementById('imageInput');
const image = document.getElementById('uploadedImage');
const colorPalette = document.getElementById('colorPalette');
const clearButton = document.getElementById('clearButton');
const toggleTheme = document.getElementById('toggleTheme');

const exportJSON = document.getElementById('exportJSON');
const exportTXT = document.getElementById('exportTXT');
const exportImage = document.getElementById('exportImage');

const colorThief = new ColorThief();
let currentPalette = [];

function getTextColor(rgb) {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance > 186 ? '#000000' : '#ffffff';
}

function rgbToHex(rgb) {
  return "#" + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

function createColorBox(color, label) {
  const hex = rgbToHex(color);
  const rgbStr = `rgb(${color.join(',')})`;
  const textColor = getTextColor(color);

  const div = document.createElement('div');
  div.className = 'colorBox';
  div.style.backgroundColor = rgbStr;
  div.style.color = textColor;

  div.innerHTML = `
    <div class="colorLabel">${label}</div>
    <div class="colorCode">${hex}</div>
    <div class="colorCode">${rgbStr}</div>
    <button class="copyBtn">Copiar</button>
  `;

  const copyBtn = div.querySelector('.copyBtn');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(hex).then(() => {
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => (copyBtn.textContent = 'Copiar'), 1500);
    });
  });

  colorPalette.appendChild(div);
}

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    image.src = e.target.result;
    image.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

image.addEventListener('load', () => {
  if (!image.complete || image.naturalWidth === 0) return;

  setTimeout(() => {
    try {
      currentPalette = colorThief.getPalette(image, 5);
      const labels = ['Primária', 'Secundária', 'Terciária', 'Quaternária', 'Quinária'];
      colorPalette.innerHTML = '';
      currentPalette.forEach((color, i) => createColorBox(color, labels[i]));
    } catch (error) {
      console.error('Erro ao extrair cores:', error);
    }
  }, 100);
});

clearButton.addEventListener('click', () => {
  imageInput.value = '';
  image.src = '';
  image.style.display = 'none';
  colorPalette.innerHTML = '';
  currentPalette = [];
});

toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});


exportTXT.addEventListener('click', () => {
  if (currentPalette.length === 0) return;
  const txt = currentPalette.map(rgb => `${rgbToHex(rgb)} - rgb(${rgb.join(',')})`).join('\n');
  downloadFile('paleta.txt', txt, 'text/plain');
});

exportImage.addEventListener('click', () => {
  if (currentPalette.length === 0) return;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  currentPalette.forEach((color, i) => {
    ctx.fillStyle = rgbToHex(color);
    ctx.fillRect(i * 100, 0, 100, 100);
  });

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paleta.png';
    a.click();
  });
});

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
}
