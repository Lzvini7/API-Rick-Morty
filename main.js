let charPage = 1;
let charTotalPages = 1;
let epPage = 1;
let epTotalPages = 1;

const els = {
  form: document.getElementById('search-form'),
  input: document.getElementById('search-input'),
  btn: document.getElementById('search-btn'),
  error: document.getElementById('error-message'),
  result: document.getElementById('result-container'),
  tabChars: document.getElementById('tab-characters'),
  tabEps: document.getElementById('tab-episodes'),
  secChars: document.getElementById('section-characters'),
  secEps: document.getElementById('section-episodes'),
  listChars: document.getElementById('characters-list'),
  listEps: document.getElementById('episodes-list'),
  prevChar: document.getElementById('prev-char'),
  nextChar: document.getElementById('next-char'),
  pageChar: document.getElementById('page-char'),
  prevEp: document.getElementById('prev-ep'),
  nextEp: document.getElementById('next-ep'),
  pageEp: document.getElementById('page-ep'),
};

// Tabs
els.tabChars.addEventListener('click', () => {
  els.tabChars.classList.add('active');
  els.tabEps.classList.remove('active');
  els.secChars.classList.remove('hidden');
  els.secEps.classList.add('hidden');
});

els.tabEps.addEventListener('click', () => {
  els.tabEps.classList.add('active');
  els.tabChars.classList.remove('active');
  els.secEps.classList.remove('hidden');
  els.secChars.classList.add('hidden');
  if (els.listEps.children.length === 0) loadEpisodes();
});

// Pagination
els.prevChar.addEventListener('click', () => { if (charPage > 1) { charPage--; loadCharacters(); } });
els.nextChar.addEventListener('click', () => { if (charPage < charTotalPages) { charPage++; loadCharacters(); } });
els.prevEp.addEventListener('click', () => { if (epPage > 1) { epPage--; loadEpisodes(); } });
els.nextEp.addEventListener('click', () => { if (epPage < epTotalPages) { epPage++; loadEpisodes(); } });

// Search
els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = els.input.value.trim();
  if (!name) return;
  searchCharacter(name);
});

async function searchCharacter(name) {
  els.btn.disabled = true;
  els.btn.textContent = 'Buscando...';
  els.error.classList.add('hidden');
  els.result.classList.add('hidden');

  try {
    const res = await fetch(`/api/character`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personagem: name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar');
    
    renderResult(data);
    els.result.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    els.error.textContent = err.message;
    els.error.classList.remove('hidden');
  } finally {
    els.btn.disabled = false;
    els.btn.textContent = 'Buscar'; 
  }
}

async function loadCharacters() {
  els.listChars.innerHTML = '<div class="loader">Carregando...</div>';
  try {
    const res = await fetch(`/api/characters?page=${charPage}`);
    const data = await res.json();
    charTotalPages = data.info.pages;
    els.pageChar.textContent = `Página ${charPage} de ${charTotalPages}`;
    
    els.listChars.innerHTML = '';
    data.results.forEach(char => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${char.image}" alt="${char.name}">
        <div class="card-info">
          <h3>${char.name}</h3>
          <p><span class="status ${char.status.toLowerCase()}"></span> ${char.status} - ${char.species}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        els.input.value = char.name;
        renderResult(char);
        els.result.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      els.listChars.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadEpisodes() {
  els.listEps.innerHTML = '<div class="loader">Carregando...</div>';
  try {
    const res = await fetch(`/api/episodes?page=${epPage}`);
    const data = await res.json();
    epTotalPages = data.info.pages;
    els.pageEp.textContent = `Página ${epPage} de ${epTotalPages}`;
    
    els.listEps.innerHTML = '';
    data.results.forEach(ep => {
      const card = document.createElement('div');
      card.className = 'card-ep';
      card.innerHTML = `
        <div class="ep-header">
          <h3>${ep.name}</h3>
          <span class="ep-code">${ep.episode}</span>
        </div>
        <p>Lançamento: ${ep.air_date}</p>
        <div class="ep-footer">
          <span>${ep.characters.length} personagens</span>
        </div>
      `;
      els.listEps.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

function renderResult(char) {
  const epTags = char.episode.map(url => {
    const id = url.split('/').pop();
    return `<span class="ep-tag">Ep ${id}</span>`;
  }).join('');

  els.result.innerHTML = `
    <div class="result-card">
      <img src="${char.image}" alt="${char.name}">
      <div class="result-info">
        <h2>${char.name}</h2>
        <div class="tags">
          <span class="status-tag"><span class="status ${char.status.toLowerCase()}"></span> ${char.status}</span>
          <span class="dot">•</span>
          <span>${char.species}</span>
          ${char.type ? `<span class="dot">•</span><span class="type">${char.type}</span>` : ''}
        </div>
        <div class="grid-info">
          <div class="info-box">
            <label>Gender</label>
            <p>${char.gender}</p>
          </div>
          <div class="info-box">
            <label>Origin</label>
            <p>${char.origin.name}</p>
          </div>
          <div class="info-box full">
            <label>Last Known Location</label>
            <p>${char.location.name}</p>
          </div>
          <div class="info-box full flex-between">
            <div>
              <label>Episodes</label>
              <p>Appears in ${char.episode.length} episode${char.episode.length > 1 ? 's' : ''}</p>
            </div>
            <div class="ep-count">${char.episode.length}</div>
          </div>
          <div class="info-box full">
            <div class="ep-tags-container">${epTags}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Init
loadCharacters();
