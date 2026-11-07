/**
 * TECNOSYSLAN — API de administración (publicar + consultar + editar + eliminar).
 * El código es público, las credenciales NO: ADMIN_PASSWORD, GITHUB_TOKEN, SESSION_SECRET.
 * Las operaciones usan commits Git atómicos y solo afectan contenido gestionado.
 */
const SITE_ORIGIN = 'https://mizuri-ml.github.io';
const REPO = 'mizuri-ml/mizuri-ml.github.io';
const BRANCH = 'main';
const API = 'https://api.github.com/repos/' + REPO;
const enc = new TextEncoder(), dec = new TextDecoder();
const noCache = {'Cache-Control':'no-store, max-age=0', 'X-Content-Type-Options':'nosniff'};
const json = (value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8',...noCache,'Access-Control-Allow-Origin':SITE_ORIGIN,'Vary':'Origin'}});
const bad = (msg,status=400)=>json({ok:false,error:msg},status);
const to64url = bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const from64url = s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
function equalBytes(a,b){if(a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a[i]^b[i];return v===0;}
async function sha256(s){return new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)));}
async function hmacKey(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function makeToken(secret){const head=to64url(enc.encode(JSON.stringify({alg:'HS256',typ:'JWT'})));const now=Math.floor(Date.now()/1000);const body=to64url(enc.encode(JSON.stringify({sub:'mizuri',exp:now+1200,iat:now})));const base=head+'.'+body;const sig=new Uint8Array(await crypto.subtle.sign('HMAC',await hmacKey(secret),enc.encode(base)));return base+'.'+to64url(sig);}
async function authorized(request,secret){const m=/^Bearer (\S+)$/.exec(request.headers.get('Authorization')||'');if(!m||!secret)return false;const p=m[1].split('.');if(p.length!==3||p[0].length>100||p[1].length>1500||p[2].length>200)return false;try{const header=JSON.parse(dec.decode(from64url(p[0]))),payload=JSON.parse(dec.decode(from64url(p[1])));const now=Math.floor(Date.now()/1000);if(header.alg!=='HS256'||payload.sub!=='mizuri'||!Number.isSafeInteger(payload.exp)||payload.exp<now||payload.exp>now+1300)return false;return crypto.subtle.verify('HMAC',await hmacKey(secret),from64url(p[2]),enc.encode(p[0]+'.'+p[1]));}catch{return false;}}
async function gh(env,path,method='GET',body=null){const response=await fetch(API+path,{method,headers:{'Accept':'application/vnd.github+json','Content-Type':'application/json','Authorization':'Bearer '+env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2026-03-10','User-Agent':'TECNOSYSLAN-Admin/2.0'},...(body!==null?{body:JSON.stringify(body)}:{})});const result=await response.json().catch(()=>({}));if(!response.ok){const status=response.status;throw Error('GitHub HTTP '+status+': '+(status===401||status===403?'Comprueba el token y sus permisos.':status===409?'Otro cambio se guardó antes. Actualiza el listado e inténtalo otra vez.':(result.message||'No se pudo procesar la operación.')));}return result;}
const slugOk = s=>typeof s==='string'&&s.length>=3&&s.length<=65&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const newsIdOk = s=>typeof s==='string'&&s.length<=100&&/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(s);
const shaOk = s=>typeof s==='string'&&/^[0-9a-f]{40}$/.test(s);
const plain = (s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.trim().length<=max&&!/[\x00-\x08\x0b-\x1f]/.test(s);
const allowedExt = /\.(?:html?|js|css|json|txt|svg|png|jpe?g|webp)$/i;
const cats = ['Redes','Ciberseguridad','Telecomunicaciones','Soporte técnico','Educación'];
const escYAML = s=>JSON.stringify(s);
function b64text(s){const bytes=enc.encode(s);let out='';for(let i=0;i<bytes.length;i+=16000)out+=String.fromCharCode(...bytes.subarray(i,i+16000));return btoa(out);}
function de64text(s){const binary=atob(s.replace(/\s+/g,''));const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return dec.decode(bytes);}
function validateToolInfo(data){if(!slugOk(data.slug)||!plain(data.title,5,100)||!plain(data.description,10,240)||!cats.includes(data.category))throw Error('Título, identificador, descripción o categoría no válidos.');}
function toolMeta(data){return ['---','title: '+escYAML(data.title.trim()),'description: '+escYAML(data.description.trim()),'category: '+escYAML(data.category),'tool_url: '+escYAML('/herramientas/apps/'+data.slug+'/'),'---',''].join('\n');}
function toolAssets(data){if(!Array.isArray(data.files)||!data.files.length||data.files.length>12)throw Error('Selecciona entre 1 y 12 archivos.');let bytes=0,hasIndex=false;const seen=new Set(),items=[];
  for(const f of data.files){if(typeof f.name!=='string'||f.name.length>180||!allowedExt.test(f.name)||f.name.startsWith('/')||f.name.includes('\\')||f.name.split('/').some(p=>!p||p==='.'||p==='..'||p.startsWith('.')||p.startsWith('_'))||seen.has(f.name))throw Error('Ruta de archivo no permitida: '+f.name);seen.add(f.name);if(f.name==='index.html')hasIndex=true;if(typeof f.data!=='string'||f.data.length>1200000||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.data))throw Error('Archivo codificado incorrectamente.');let content;try{content=atob(f.data);}catch{throw Error('Contenido codificado no válido.');}bytes+=content.length;if(content.length>800000||bytes>3000000)throw Error('El conjunto supera el límite de 3 MB o el límite por archivo.');items.push({path:'herramientas/apps/'+data.slug+'/'+f.name,data:f.data});}
  if(!hasIndex)throw Error('El archivo index.html es obligatorio.');return items;}
function normalizedTool(data){validateToolInfo(data);return [...toolAssets(data),{path:'_herramientas/'+data.slug+'.md',data:b64text(toolMeta(data))}];}
function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;}
function stripFrontMatter(raw){return raw.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/,'');}
function stripGeneratedSource(raw){return raw.replace(/\r?\n---\s*\r?\n\s*\*\*Fuente original:\*\* https:\/\/[^\r\n]+\s*$/i,'').trim();}
function newsDocument(data){if(!plain(data.title,6,140)||!plain(data.description,10,240)||!slugOk(data.slug)||!plain(data.markdown,20,200000))throw Error('Título, identificador, descripción o cuerpo de la noticia no válidos.');if(!validDate(data.date))throw Error('Fecha de noticia no válida.');let u;try{u=new URL(data.source_url);}catch{throw Error('La URL de la fuente no es válida.');}if(u.protocol!=='https:'||!u.hostname||u.username||u.password)throw Error('La fuente debe ser una URL HTTPS válida.');const body=stripGeneratedSource(stripFrontMatter(data.markdown));if(body.length<20)throw Error('El cuerpo de la noticia es demasiado corto.');const content=['---','layout: post','title: '+escYAML(data.title.trim()),'description: '+escYAML(data.description.trim()),'date: '+data.date+' 09:00:00 -0500','permalink: '+escYAML('/noticias/'+data.slug+'/'),'categories: [Noticias]','tags: [actualidad, tecnología]','source_url: '+escYAML(u.href),'---','',body,'','---','','**Fuente original:** '+u.href,''].join('\n');return {file:data.date+'-'+data.slug+'.md',content};}
function parseDoc(content){const match=/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(content);if(!match)return {meta:{},body:content};const meta={};for(const line of match[1].split(/\r?\n/)){const m=/^([a-z_]+):\s*(.*)$/.exec(line);if(!m)continue;let v=m[2].trim();if(v.startsWith('"')){try{v=JSON.parse(v);}catch{/* keep text */}}meta[m[1]]=v;}return {meta,body:content.slice(match[0].length)};}
const isNews = meta=>/(?:^|[\s,\[])noticias(?=[\s,\]]|$)/i.test(String(meta.categories||''));
async function branch(env){const ref=await gh(env,'/git/ref/heads/'+BRANCH);const commit=await gh(env,'/git/commits/'+ref.object.sha);const tree=await gh(env,'/git/trees/'+commit.tree.sha+'?recursive=1');if(tree.truncated)throw Error('El repositorio tiene demasiados archivos para una administración segura.');return {parent:ref.object.sha,base_tree:commit.tree.sha,entries:tree.tree.filter(x=>x.type==='blob')};}
function entryAt(snapshot,path){return snapshot.entries.find(e=>e.path===path);}
async function readBlob(env,sha){const blob=await gh(env,'/git/blobs/'+sha);if(blob.encoding!=='base64'||typeof blob.content!=='string')throw Error('No se pudo interpretar el archivo de GitHub.');return de64text(blob.content);}
function pathFor(type,id){if(type==='tool'&&slugOk(id))return '_herramientas/'+id+'.md';if(type==='news'&&newsIdOk(id))return '_posts/'+id;throw Error('Identificador no válido.');}
async function itemFromEntry(env,type,entry,includeBody=false){const parsed=parseDoc(await readBlob(env,entry.sha));if(type==='news'&&!isNews(parsed.meta))return null;const id=entry.path.split('/').pop();const slug=type==='tool'?id.slice(0,-3):id.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,'');const result={id:type==='tool'?slug:id,slug,sha:entry.sha,title:String(parsed.meta.title||slug),description:String(parsed.meta.description||''),url:SITE_ORIGIN+(type==='tool'?'/herramientas/'+slug+'/':'/noticias/'+slug+'/')};if(type==='tool')result.category=String(parsed.meta.category||'Redes');else {result.date=String(parsed.meta.date||id.slice(0,10)).slice(0,10);result.source_url=String(parsed.meta.source_url||'');}
  if(includeBody&&type==='news')result.markdown=stripGeneratedSource(parsed.body);return result;}
async function listItems(env,type){const snap=await branch(env);const entries=snap.entries.filter(e=>type==='tool'?/^_herramientas\/[a-z0-9-]+\.md$/.test(e.path):/^_posts\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(e.path));const items=[];for(let i=0;i<entries.length;i+=8){const group=await Promise.all(entries.slice(i,i+8).map(e=>itemFromEntry(env,type,e)));for(const item of group)if(item)items.push(item);}items.sort((a,b)=>type==='news'?(b.date.localeCompare(a.date)||a.title.localeCompare(b.title)):a.title.localeCompare(b.title,'es'));return items;}
async function getItem(env,type,id){const snap=await branch(env);const entry=entryAt(snap,pathFor(type,id));if(!entry)throw Error('El contenido solicitado no existe.');const item=await itemFromEntry(env,type,entry,true);if(!item)throw Error('Este artículo no pertenece al módulo Noticias.');if(type==='tool'){item.file_count=snap.entries.filter(e=>e.path.startsWith('herramientas/apps/'+id+'/')).length;}return item;}
async function gitCommit(env,snapshot,changes,message){if(!changes.length)throw Error('No hay cambios que guardar.');const tree=[];for(const item of changes){if(item.delete){tree.push({path:item.path,mode:'100644',type:'blob',sha:null});}else{const blob=await gh(env,'/git/blobs','POST',{content:item.data,encoding:'base64'});tree.push({path:item.path,mode:'100644',type:'blob',sha:blob.sha});}}const next=await gh(env,'/git/trees','POST',{base_tree:snapshot.base_tree,tree});const commit=await gh(env,'/git/commits','POST',{message,tree:next.sha,parents:[snapshot.parent]});await gh(env,'/git/refs/heads/'+BRANCH,'PATCH',{sha:commit.sha,force:false});return commit.sha;}
async function createItem(env,data){if(data.type==='tool'){
    const changes=normalizedTool(data),snap=await branch(env);const prefix='herramientas/apps/'+data.slug+'/';if(entryAt(snap,'_herramientas/'+data.slug+'.md')||snap.entries.some(e=>e.path.startsWith(prefix)))throw Error('La herramienta ya existe. Para modificarla usa Gestionar → Editar.');const commit=await gitCommit(env,snap,changes,'TECNOSYSLAN: crear herramienta '+data.slug);return {ok:true,commit,url:SITE_ORIGIN+'/herramientas/'+data.slug+'/'};
  }if(data.type==='news'){
    const item=newsDocument(data),snap=await branch(env);if(snap.entries.some(e=>e.path.startsWith('_posts/')&&e.path.endsWith('-'+data.slug+'.md')))throw Error('Ya existe una publicación con ese identificador. Usa Gestionar → Editar.');const commit=await gitCommit(env,snap,[{path:'_posts/'+item.file,data:b64text(item.content)}],'TECNOSYSLAN: crear noticia '+data.slug);return {ok:true,commit,url:SITE_ORIGIN+'/noticias/'+data.slug+'/'};
  }throw Error('Tipo de contenido no permitido.');}
async function updateItem(env,data){const type=data.type,id=data.id;if(!shaOk(data.expected_sha))throw Error('Primero carga el contenido desde Gestionar para actualizar su versión.');const path=pathFor(type,id),snap=await branch(env),existing=entryAt(snap,path);if(!existing)throw Error('El contenido ya fue eliminado.');if(existing.sha!==data.expected_sha)throw Error('El contenido cambió en GitHub. Recarga antes de guardar para evitar sobrescribir cambios.');const original=await itemFromEntry(env,type,existing);if(!original)throw Error('No se permite editar este artículo desde Noticias.');let changes=[],url;
  if(type==='tool'){
    if(data.slug!==id)throw Error('El identificador de una herramienta no se puede cambiar durante la edición.');validateToolInfo(data);changes.push({path,data:b64text(toolMeta(data))});if(data.replace_files===true){const nextFiles=toolAssets(data);const old=snap.entries.filter(e=>e.path.startsWith('herramientas/apps/'+id+'/'));const keep=new Set(nextFiles.map(f=>f.path));for(const e of old)if(!keep.has(e.path))changes.push({path:e.path,delete:true});changes.push(...nextFiles);}url=SITE_ORIGIN+'/herramientas/'+id+'/';
  }else{
    const slug=id.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,'');if(data.slug!==slug)throw Error('El identificador de la noticia no se puede cambiar durante la edición.');const doc=newsDocument(data);changes=[{path,data:b64text(doc.content)}];url=SITE_ORIGIN+'/noticias/'+slug+'/';
  }const commit=await gitCommit(env,snap,changes,'TECNOSYSLAN: editar '+(type==='tool'?'herramienta ':'noticia ')+id);return {ok:true,commit,url};}
async function deleteItem(env,data){const type=data.type,id=data.id;if(!shaOk(data.expected_sha))throw Error('Recarga el contenido antes de eliminarlo.');const path=pathFor(type,id),snap=await branch(env),existing=entryAt(snap,path);if(!existing)throw Error('La publicación ya no existe.');if(existing.sha!==data.expected_sha)throw Error('La publicación cambió. Recarga el listado antes de eliminar.');if(!await itemFromEntry(env,type,existing))throw Error('Solo se pueden eliminar noticias creadas en el módulo Noticias.');const changes=[{path,delete:true}];if(type==='tool'){for(const e of snap.entries.filter(e=>e.path.startsWith('herramientas/apps/'+id+'/')))changes.push({path:e.path,delete:true});}const commit=await gitCommit(env,snap,changes,'TECNOSYSLAN: eliminar '+(type==='tool'?'herramienta ':'noticia ')+id);return {ok:true,commit,deleted:changes.length};}
export default {async fetch(request,env){
  const origin=request.headers.get('Origin');const uri=new URL(request.url);const path=uri.pathname.replace(/\/$/,'')||'/';
  if(origin&&origin!==SITE_ORIGIN)return bad('Origen no autorizado.',403);
  if(request.method==='OPTIONS'){if(origin!==SITE_ORIGIN)return bad('Origen no autorizado.',403);return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':SITE_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'300','Vary':'Origin',...noCache}});}
  if(path==='/health'&&request.method==='GET')return json({ok:true,service:'TECNOSYSLAN admin API',configured:Boolean(env.ADMIN_PASSWORD&&env.GITHUB_TOKEN&&env.SESSION_SECRET&&env.SESSION_SECRET.length>=24)});
  if(!['/login','/publish','/items','/item','/update','/delete'].includes(path))return bad('Ruta no encontrada.',404);
  if(origin!==SITE_ORIGIN)return bad('Origen no autorizado.',403);
  if(!env.ADMIN_PASSWORD||!env.GITHUB_TOKEN||!env.SESSION_SECRET||env.SESSION_SECRET.length<24)return bad('Falta configurar los secretos del servidor.',503);
  if(request.method!==((path==='/items'||path==='/item')?'GET':'POST'))return bad('Método no permitido.',405);
  if(request.method==='POST'){
    if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return bad('Formato de solicitud no admitido.',415);
    if(Number(request.headers.get('Content-Length')||0)>4500000)return bad('Solicitud demasiado grande.',413);
  }
  try{
    if(path==='/login'){
      const clientIp=request.headers.get('CF-Connecting-IP')||'unknown';const limit=await env.LOGIN_LIMIT.limit({key:'login:'+clientIp});if(!limit.success)return bad('Demasiados intentos. Prueba más tarde.',429);
      const data=await request.json();if(typeof data.password!=='string'||data.password.length>256||data.username!=='mizuri')return bad('Usuario o contraseña incorrectos.',401);
      const [a,b]=await Promise.all([sha256(data.password),sha256(env.ADMIN_PASSWORD)]);if(!equalBytes(a,b))return bad('Usuario o contraseña incorrectos.',401);
      return json({ok:true,token:await makeToken(env.SESSION_SECRET),expires_in:1200});
    }
    if(!await authorized(request,env.SESSION_SECRET))return bad('Sesión no válida o caducada. Vuelve a iniciar sesión.',401);
    if(path==='/items'||path==='/item'){
      const type=uri.searchParams.get('type');if(!['tool','news'].includes(type))return bad('Tipo de contenido no permitido.');
      if(path==='/items')return json({ok:true,items:await listItems(env,type)});
      return json({ok:true,item:await getItem(env,type,uri.searchParams.get('id')||'')});
    }
    const data=await request.json();if(!['tool','news'].includes(data.type))return bad('Tipo de contenido no permitido.');
    const result=path==='/publish'?await createItem(env,data):path==='/update'?await updateItem(env,data):await deleteItem(env,data);
    return json(result);
  }catch(error){const message=error instanceof Error?error.message:'No se pudo completar la operación.';const status=/no válida o caducada/i.test(message)?401:/cambió|ya existe/i.test(message)?409:400;return bad(message,status);}
}};
