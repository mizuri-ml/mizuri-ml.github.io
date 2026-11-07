'use strict';
(() => {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('site-nav');
  if(toggle && menu){toggle.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}));}
  const search = document.getElementById('article-search');
  if(search){const items=[...document.querySelectorAll('#article-list .searchable-article')];const label=document.getElementById('article-search-status'),empty=document.getElementById('empty-articles');function update(){const q=search.value.toLocaleLowerCase('es').trim();let count=0;items.forEach(x=>{const matches=!q||x.textContent.toLocaleLowerCase('es').includes(q);x.hidden=!matches;if(matches) count++;});if(label) label.textContent=count+' publicación(es) encontrada(s)';if(empty)empty.hidden=count!==0;}search.addEventListener('input',update);update();}
  document.querySelectorAll('[data-copy-url]').forEach(b=>b.addEventListener('click',async()=>{const feedback=b.parentElement.querySelector('.copy-feedback');try{await navigator.clipboard.writeText(location.href);if(feedback)feedback.textContent='Enlace copiado al portapapeles.';}catch{if(feedback)feedback.textContent='Copia la dirección desde el navegador.';}}));
  const bar=document.getElementById('reading-progress');if(bar){const update=()=>{const total=document.documentElement.scrollHeight-innerHeight;bar.style.width=total>0?Math.min(100,Math.max(0,scrollY/total*100))+'%':'0';};document.addEventListener('scroll',update,{passive:true});update();}
})();
