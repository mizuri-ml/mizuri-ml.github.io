(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const status = (message, bad=false) => { const x=$('admin-status');x.textContent=message;x.style.borderColor=bad?'#ecb5c9':'#dcd6ff';x.scrollIntoView({behavior:'smooth',block:'nearest'}); };
  const urlKey='tecnosyslan_worker_url_v1',sessionKey='tecnosyslan_session_v1';
  let session=sessionStorage.getItem(sessionKey)||'';
  const getApi=()=>($('api-base').value||'').trim().replace(/\/+$/,'');
  const checkedApi=()=>{const u=new URL(getApi());if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw new Error('Introduce solamente la dirección HTTPS principal del Worker.');return u.origin;};
  function applyLogin(){const on=!!session;$('workspace').classList.toggle('hide',!on);$('login-panel').classList.toggle('hide',on);}
  $('api-base').value=localStorage.getItem(urlKey)||'';
  $('save-api').onclick=()=>{try{const u=checkedApi();localStorage.setItem(urlKey,u);session='';sessionStorage.removeItem(sessionKey);applyLogin();$('connection-badge').textContent='Dirección guardada';status('URL de administración guardada. Comprueba la conexión antes de iniciar sesión.');}catch(e){status(e.message,true);}};
  $('test-api').onclick=async()=>{try{const res=await fetch(checkedApi()+'/health',{cache:'no-store'});if(!res.ok)throw Error('Servidor no disponible ('+res.status+').');const data=await res.json();if(!data.ok)throw Error('Respuesta del servidor no válida.');$('connection-badge').textContent='Servidor disponible';status('Conexión HTTPS verificada. Ya puedes iniciar sesión.');}catch(e){status('Error de conexión: '+e.message,true);}};
  async function request(path,payload,token=''){
    const api=checkedApi();const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),40000);
    try{const res=await fetch(api+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})},body:JSON.stringify(payload),cache:'no-store',signal:controller.signal});const data=await res.json().catch(()=>({error:'Respuesta no válida del servidor.'}));if(!res.ok)throw Error(data.error||('HTTP '+res.status));return data;}finally{clearTimeout(timeout);}
  }
  $('login-form').onsubmit=async e=>{e.preventDefault();const password=$('admin-password').value;try{status('Comprobando credenciales...');const data=await request('/login',{username:$('admin-user').value,password});session=data.token;sessionStorage.setItem(sessionKey,session);$('admin-password').value='';applyLogin();status('Sesión iniciada. Puedes preparar herramientas y noticias para publicar.');}catch(err){status('Acceso denegado: '+err.message,true);}finally{$('admin-password').value='';}};
  $('logout').onclick=()=>{session='';sessionStorage.removeItem(sessionKey);applyLogin();status('Sesión cerrada.');};
  $('clear-status').onclick=()=>status('Panel listo.');
  $('news-date').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const slugify=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65);
  [['tool-title','tool-slug'],['news-title','news-slug']].forEach(([t,s])=>{$(t).addEventListener('input',()=>{if(!$(s).dataset.manual)$(s).value=slugify($(t).value);});$(s).addEventListener('input',()=>{$(s).dataset.manual='1';});});
  const toBase64=buffer=>{const data=new Uint8Array(buffer);let out='';for(let i=0;i<data.length;i+=16384)out+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(out);};
  function safeName(name){return name.replace(/\\/g,'/').replace(/^\/+/, '').split('/').filter(Boolean).join('/');}
  const OK_EXT=/\.(?:html?|css|js|json|txt|svg|png|jpe?g|webp)$/i;
  async function readZip(file){
    const bytes=await file.arrayBuffer(),data=new DataView(bytes);let eocd=-1;
    for(let i=bytes.byteLength-22;i>=Math.max(0,bytes.byteLength-65557);i--){if(data.getUint32(i,true)===0x06054b50){eocd=i;break;}}
    if(eocd<0)throw Error('ZIP no válido o incompleto.');const n=data.getUint16(eocd+10,true);if(n>100)throw Error('El ZIP tiene demasiados archivos.');
    let at=data.getUint32(eocd+16,true);const decoder=new TextDecoder();const files=[];
    for(let j=0;j<n;j++){
      if(data.getUint32(at,true)!==0x02014b50)throw Error('Directorio ZIP no válido.');
      const flags=data.getUint16(at+8,true),method=data.getUint16(at+10,true),compressed=data.getUint32(at+20,true),size=data.getUint32(at+24,true);
      const nameLen=data.getUint16(at+28,true),extraLen=data.getUint16(at+30,true),commentLen=data.getUint16(at+32,true),start=data.getUint32(at+42,true);
      const name=decoder.decode(new Uint8Array(bytes,at+46,nameLen));at+=46+nameLen+extraLen+commentLen;
      if(name.endsWith('/'))continue;
      if(flags&1)throw Error('ZIP cifrado no soportado.');if(size>800000)throw Error('Archivo ZIP demasiado grande: '+name);
      if(![0,8].includes(method))throw Error('Compresión ZIP no soportada (usa ZIP normal).');
      if(data.getUint32(start,true)!==0x04034b50)throw Error('Cabecera ZIP dañada.');
      const localStart=start+30+data.getUint16(start+26,true)+data.getUint16(start+28,true);
      const raw=new Uint8Array(bytes,localStart,compressed);let content;
      if(method===0)content=new Uint8Array(raw);
      else {if(typeof DecompressionStream==='undefined')throw Error('Tu navegador no puede abrir ZIP. Descomprímelo y selecciona sus archivos.');try{const stream=new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));content=new Uint8Array(await new Response(stream).arrayBuffer());}catch{throw Error('ZIP no compatible en este navegador. Descomprímelo y selecciona los archivos.');}}
      if(content.byteLength!==size)throw Error('Error de integridad al abrir el ZIP.');files.push({name,content});
    }return files;
  }
  async function collectFiles(list){const selected=[...list];let results=[];
    for(const f of selected){if(/\.zip$/i.test(f.name)){const entries=await readZip(f);results.push(...entries);}else{results.push({name:f.webkitRelativePath||f.name,content:new Uint8Array(await f.arrayBuffer())});}}
    if(!results.length||results.length>12)throw Error('Selecciona entre 1 y 12 archivos.');
    const names=results.map(x=>safeName(x.name));
    // Remove one common root folder in exported ZIPs.
    const root=names[0].split('/')[0];if(names.every(x=>x.startsWith(root+'/')))results=results.map(x=>({...x,name:safeName(x.name).slice(root.length+1)}));
    else results=results.map(x=>({...x,name:safeName(x.name)}));
    if(results.length===1 && /\.html?$/i.test(results[0].name))results[0].name='index.html';
    if(!results.some(x=>x.name==='index.html'))throw Error('La herramienta necesita index.html en su carpeta principal.');
    let sum=0;const namesSet=new Set();
    for(const x of results){const parts=x.name.split('/');if(x.name.length>180||!parts.length||parts.some(v=>!v||v==='..'||v==='.'||v.startsWith('.')||v.startsWith('_'))||!OK_EXT.test(x.name))throw Error('Ruta o extensión no permitida: '+x.name);if(namesSet.has(x.name))throw Error('Nombre repetido: '+x.name);namesSet.add(x.name);sum+=x.content.byteLength;if(x.content.byteLength>800000||sum>3000000)throw Error('La herramienta excede el límite de 3 MB o 800 KB por archivo.');}
    return results.map(x=>{
      if(x.name==='index.html'){
        let s=new TextDecoder().decode(x.content);
        s=s.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/,'').replaceAll("{{ '/herramientas/' | relative_url }}",'/herramientas/');
        if(!/<!doctype html|<html(?:\s|>)/i.test(s))s='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Herramienta TECNOSYSLAN</title></head><body>'+s+'</body></html>';
        x.content=new TextEncoder().encode(s);
      }
      return {name:x.name,data:toBase64(x.content)};
    });
  }
  const showPublished=(data)=>{status('Publicación confirmada en el repositorio. GitHub Pages procesará el despliegue.\nURL prevista: '+data.url+'\nCommit: '+(data.commit||'-'));};
  $('tool-form').onsubmit=async e=>{e.preventDefault();if(!session)return status('Inicia sesión primero.',true);try{status('Preparando los archivos...');const files=await collectFiles($('tool-files').files);status('Enviando '+files.length+' archivo(s) al servidor.');const response=await request('/publish',{type:'tool',title:$('tool-title').value.trim(),slug:$('tool-slug').value.trim(),description:$('tool-description').value.trim(),category:$('tool-category').value,files},session);showPublished(response);$('tool-confirm').checked=false;}catch(err){status('No se pudo publicar: '+err.message,true);}};
  $('news-form').onsubmit=async e=>{e.preventDefault();if(!session)return status('Inicia sesión primero.',true);try{const file=$('news-file').files[0];if(!file)throw Error('Selecciona un archivo Markdown.');if(file.size>200000)throw Error('La noticia debe ocupar menos de 200 KB.');const markdown=await file.text();status('Publicando noticia...');const response=await request('/publish',{type:'news',title:$('news-title').value.trim(),slug:$('news-slug').value.trim(),date:$('news-date').value,description:$('news-description').value.trim(),source_url:$('news-source').value.trim(),markdown},session);showPublished(response);$('news-confirm').checked=false;}catch(err){status('No se pudo publicar: '+err.message,true);}};
  applyLogin();
})();
