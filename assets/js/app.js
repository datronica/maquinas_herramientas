async function include(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(path);
    el.innerHTML = await res.text();
  } catch (e) {
    console.error('Include failed', path, e);
  }
}

// Compute base prefix depending on current path (root or nested)
const BASE = (location.pathname.includes('/semanas/') ||
          location.pathname.includes('/temas/')   ||
          location.pathname.includes('/proyecto/')) ? '..' : '.';

// Load components
include('header', `${BASE}/header.html`).then(()=>{
  const tgl = document.getElementById('navToggle');
  const sidebar = document.getElementById('sidebar');
  if (tgl && sidebar) tgl.addEventListener('click', ()=> sidebar.classList.toggle('open'));
  // After header loads, fix absolute links
  fixAbsoluteLinks();
});
include('sidebar', `${BASE}/sidebar.html`).then(()=>{
  document.querySelectorAll('[data-acc]').forEach(h => {
    h.addEventListener('click', ()=>{
      const ul = document.getElementById('acc-'+h.dataset.acc);
      if (ul) ul.classList.toggle('open');
    });
  });
  // After sidebar loads, fix absolute links
  fixAbsoluteLinks();
});
include('footer', `${BASE}/footer.html`);

// Rewrites anchors like href="/temas/seguridad.html" to relative with BASE prefix
function fixAbsoluteLinks(){
  document.querySelectorAll('a[href^="/"]').forEach(a=>{
    const clean = a.getAttribute('href').replace(/^\//,'');
    a.setAttribute('href', `${BASE}/${clean}`);
  });
}


async function include(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  try{ const res = await fetch(path); el.innerHTML = await res.text(); }
  catch(e){ console.error('Include failed', path, e); }
}
// Load components and wire UX
include('header', '/componentes/header.html').then(()=>{
  const tgl = document.getElementById('navToggle');
  const sidebar = document.getElementById('sidebar');
  if (tgl && sidebar) tgl.addEventListener('click', ()=> sidebar.classList.toggle('open'));
});
include('sidebar', '/componentes/sidebar.html').then(()=>{
  document.querySelectorAll('[data-acc]').forEach(h => {
    h.addEventListener('click', ()=>{
      const ul = document.getElementById('acc-'+h.dataset.acc);
      if (ul) ul.classList.toggle('open');
    });
  });
});
// TOC
(function buildTOC(){
  const toc = document.getElementById('toc');
  if (!toc) return;
  const hs = Array.from(document.querySelectorAll('h2, h3'));
  if (!hs.length) return;
  const ul = document.createElement('ul');
  ul.style.margin = '0'; ul.style.paddingLeft = '1rem';
  hs.forEach(h => {
    if (!h.id) h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.style.marginLeft = '.8rem';
    const a = document.createElement('a');
    a.href = '#' + h.id; a.textContent = h.textContent;
    li.appendChild(a); ul.appendChild(li);
  });
  toc.appendChild(ul);
})();
// Search
let idx = [];
(async function loadIndex(){
  try{ const res = await fetch(`${BASE}/data/search-index.json`); idx = await res.json(); }catch(e){}
})();
function doSearch(q){
  q = (q||'').trim().toLowerCase(); if (!q) return [];
  return idx.map(item=>{
    const hay = (item.title+' '+item.keywords+' '+item.summary).toLowerCase();
    const score = (hay.includes(q)?3:0) + q.split(/\s+/).reduce((s,w)=>s+(hay.includes(w)?1:0),0);
    return {...item, score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12);
}
function renderResults(list){
  let panel = document.getElementById('searchResults');
  if (!panel){
    panel = document.createElement('div');
    panel.id='searchResults';
    panel.style.position='fixed'; panel.style.top='64px'; panel.style.right='16px';
    panel.style.maxWidth='460px'; panel.style.background='var(--panel)'; panel.style.border='1px solid var(--line)';
    panel.style.borderRadius='.6rem'; panel.style.padding='.6rem';
  document.body.appendChild(panel);
  }
  panel.innerHTML = list.length? list.map(x=>`<a href="${x.url}"><strong>${x.title}</strong><br><small>${x.summary}</small></a>`).join('') : '<small>Sin resultados</small>';
}
document.addEventListener('click', e=>{
  if (e.target && e.target.id==='searchBtn'){
    const q = document.getElementById('searchInput').value || '';
    renderResults(doSearch(q));
  }
});
document.addEventListener('keydown', e=>{
  if (e.key==='Enter' && document.activeElement && document.activeElement.id==='searchInput'){
    const q = document.getElementById('searchInput').value || '';
    renderResults(doSearch(q));
  }
});
