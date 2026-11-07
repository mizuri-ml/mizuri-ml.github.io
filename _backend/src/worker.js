/**
 * TECNOSYSLAN secure publication API. Do not commit secrets or user passwords.
 * Required Worker secrets: ADMIN_PASSWORD, GITHUB_TOKEN, SESSION_SECRET.
 * This Worker is deployed separately from GitHub Pages using Wrangler.
 */
const SITE_ORIGIN='https://mizuri-ml.github.io';
const REPO='mizuri-ml/mizuri-ml.github.io';
const BRANCH='main';
const API='https://api.github.com/repos/'+REPO;
const enc=new TextEncoder();
const dec=new TextDecoder();
const noCache={'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const json=(value,status=200,origin=SITE_ORIGIN)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8',...noCache,'Access-Control-Allow-Origin':origin,'Vary':'Origin'}});
const bad=(msg,status=400)=>json({ok:false,error:msg},status);
const to64url=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const from64url=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),x=>x.charCodeAt(0));
function equalBytes(a,b){if(a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a[i]^b[i];return v===0;}
async function sha256(s){return new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)));}
async function hmacKey(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function makeToken(secret){const head=to64url(enc.encode(JSON.stringify({alg:'HS256',typ:'JWT'})));const body=to64url(enc.encode(JSON.stringify({sub:'mizuri',exp:Math.floor(Date.now()/1000)+1200,iat:Math.floor(Date.now()/1000)})));const base=head+'.'+body;const signature=new Uint8Array(await crypto.subtle.sign('HMAC',await hmacKey(secret),enc.encode(base)));return base+'.'+to64url(signature);}
async function authorized(request,secret){const m=/^Bearer (\S+)$/.exec(request.headers.get('Authorization')||'');if(!m||!secret)return false;const parts=m[1].split('.');if(parts.length!==3||parts[0].length>100||parts[1].length>1500||parts[2].length>200)return false;try{const head=JSON.parse(dec.decode(from64url(parts[0])));const payload=JSON.parse(dec.decode(from64url(parts[1])));if(head.alg!=='HS256'||payload.sub!=='mizuri'||!Number.isSafeInteger(payload.exp)||payload.exp<Math.floor(Date.now()/1000)||payload.exp>Math.floor(Date.now()/1000)+1300)return false;return crypto.subtle.verify('HMAC',await hmacKey(secret),from64url(parts[2]),enc.encode(parts[0]+'.'+parts[1]));}catch{return false;}}
async function gh(env,path,method='GET',body=null){const response=await fetch(API+path,{method,headers:{'Accept':'application/vnd.github+json','Content-Type':'application/json','Authorization':'Bearer '+env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2026-03-10','User-Agent':'TECNOSYSLAN-Admin/1.0'},...(body!==null?{body:JSON.stringify(body)}:{})});const result=await response.json().catch(()=>({}));if(!response.ok){const status=response.status;throw Error('GitHub HTTP '+status+': '+(status===401||status===403?'Comprueba permisos del token.':status===409?'Cambios simultáneos en el repositorio. Reintenta.':(result.message||'No se pudo guardar el contenido.')));}return result;}
const slugOk=s=>typeof s==='string'&&s.length>=3&&s.length<=65&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const plain=(s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.trim().length<=max&&!/[\x00-\x08\x0b-\x1f]/.test(s);
const allowedExt=/\.(?:html?|js|css|json|txt|svg|png|jpe?g|webp)$/i;
const escapeYAML=s=>JSON.stringify(s);
const b64text=s=>{const bytes=enc.encode(s);let res='';for(let i=0;i<bytes.length;i+=16000)res+=String.fromCharCode(...bytes.subarray(i,i+16000));return btoa(res);};
function normalizeNews(data){if(!plain(data.title,6,140)||!plain(data.description,10,240)||!slugOk(data.slug)||!plain(data.markdown,20,200000))throw Error('Título, identificador, descripción o cuerpo no válidos.');if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||Number.isNaN(Date.parse(data.date+'T12:00:00Z')))throw Error('La fecha de publicación no es válida.');const u=new URL(data.source_url);if(u.protocol!=='https:')throw Error('La fuente debe ser un enlace HTTPS.');const clean=data.markdown.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/,'');const content=['---','layout: post','title: '+escapeYAML(data.title.trim()),'description: '+escapeYAML(data.description.trim()),'date: '+data.date+' 09:00:00 -0500','permalink: '+escapeYAML('/noticias/'+data.slug+'/'),'categories: [Noticias]','tags: [actualidad, tecnología]','source_url: '+escapeYAML(u.href),'---','',clean.trim(),'','---','','**Fuente original:** '+u.href,''].join('\n');return {file:data.date+'-'+data.slug+'.md',content};}
function normalizeTool(data){if(!plain(data.title,5,100)||!plain(data.description,10,240)||!slugOk(data.slug))throw Error('Completa el título, la descripción y el identificador válido.');const cats=['Redes','Ciberseguridad','Telecomunicaciones','Soporte técnico','Educación'];if(!cats.includes(data.category))throw Error('Categoría no permitida.');if(!Array.isArray(data.files)||!data.files.length||data.files.length>12)throw Error('Carga de 1 a 12 archivos por herramienta.');let bytes=0;let hasIndex=false;const seen=new Set();const files=[];for(const f of data.files){if(typeof f.name!=='string'||f.name.length>180||!allowedExt.test(f.name)||f.name.startsWith('/')||f.name.includes('\\')||f.name.split('/').some(t=>!t||t==='.'||t==='..'||t.startsWith('.')||t.startsWith('_'))||seen.has(f.name))throw Error('Nombre de archivo no permitido: '+f.name);seen.add(f.name);if(f.name==='index.html')hasIndex=true;if(typeof f.data!=='string'||f.data.length>1200000||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.data))throw Error('Archivo codificado incorrectamente.');let content;try{content=atob(f.data);}catch{throw Error('Contenido del archivo no válido.');}bytes+=content.length;if(content.length>800000||bytes>3000000)throw Error('Herramienta demasiado grande.');files.push({path:'herramientas/apps/'+data.slug+'/'+f.name,data:f.data});}if(!hasIndex)throw Error('Es obligatorio el archivo index.html.');const meta=['---','title: '+escapeYAML(data.title.trim()),'description: '+escapeYAML(data.description.trim()),'category: '+escapeYAML(data.category),'tool_url: '+escapeYAML('/herramientas/apps/'+data.slug+'/'),'---',''].join('\n');files.push({path:'_herramientas/'+data.slug+'.md',data:b64text(meta)});return files;}
async function publish(env,changes,message){
  // Single atomic commit: upload blobs, then one tree and one branch update.
  const ref=await gh(env,'/git/ref/heads/'+BRANCH);
  const parent=ref.object.sha;
  const previous=await gh(env,'/git/commits/'+parent);
  const tree=[];
  for(const item of changes){const blob=await gh(env,'/git/blobs','POST',{content:item.data,encoding:'base64'});tree.push({path:item.path,mode:'100644',type:'blob',sha:blob.sha});}
  const nextTree=await gh(env,'/git/trees','POST',{base_tree:previous.tree.sha,tree});
  const commit=await gh(env,'/git/commits','POST',{message,tree:nextTree.sha,parents:[parent]});
  await gh(env,'/git/refs/heads/'+BRANCH,'PATCH',{sha:commit.sha,force:false});
  return commit.sha;
}
export default {async fetch(request,env){
  const origin=request.headers.get('Origin');const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
  if(origin && origin!==SITE_ORIGIN)return bad('Origen no autorizado.',403);
  if(request.method==='OPTIONS'){if(origin!==SITE_ORIGIN)return bad('Origen no autorizado.',403);return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':SITE_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'300','Vary':'Origin',...noCache}});}
  if(path==='/health'&&request.method==='GET')return json({ok:true,service:'TECNOSYSLAN admin API',configured:Boolean(env.ADMIN_PASSWORD&&env.GITHUB_TOKEN&&env.SESSION_SECRET)});
  if(request.method!=='POST'||!['/login','/publish'].includes(path))return bad('Ruta no encontrada.',404);
  if(origin!==SITE_ORIGIN)return bad('Origen no autorizado.',403);
  if(!env.ADMIN_PASSWORD||!env.GITHUB_TOKEN||!env.SESSION_SECRET||env.SESSION_SECRET.length<24)return bad('Falta configurar los secretos del servidor.',503);
  if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return bad('Formato de solicitud no admitido.',415);
  const length=Number(request.headers.get('Content-Length')||0);if(length>4500000)return bad('Solicitud demasiado grande.',413);
  try{
    if(path==='/login'){
      const clientIp=request.headers.get('CF-Connecting-IP')||'unknown';
      const limit=await env.LOGIN_LIMIT.limit({key:'login:'+clientIp});if(!limit.success)return bad('Demasiados intentos. Prueba más tarde.',429);
      const data=await request.json();
      if(typeof data.password!=='string'||data.password.length>256||data.username!=='mizuri')return bad('Usuario o contraseña incorrectos.',401);
      const [a,b]=await Promise.all([sha256(data.password),sha256(env.ADMIN_PASSWORD)]);
      if(!equalBytes(a,b))return bad('Usuario o contraseña incorrectos.',401);
      return json({ok:true,token:await makeToken(env.SESSION_SECRET),expires_in:1200});
    }
    if(!await authorized(request,env.SESSION_SECRET))return bad('Sesión no válida o caducada. Vuelve a iniciar sesión.',401);
    const data=await request.json();let changes,message,url;
    if(data.type==='tool'){
      changes=normalizeTool(data);message='TECNOSYSLAN: publicar herramienta '+data.slug;url=SITE_ORIGIN+'/herramientas/'+data.slug+'/';
    }else if(data.type==='news'){
      const item=normalizeNews(data);changes=[{path:'_posts/'+item.file,data:b64text(item.content)}];message='TECNOSYSLAN: publicar noticia '+data.slug;url=SITE_ORIGIN+'/noticias/'+data.slug+'/';
    }else return bad('Tipo de publicación no admitido.');
    const commit=await publish(env,changes,message);return json({ok:true,url,commit});
  }catch(error){const message=error instanceof Error?error.message:'No se pudo completar la operación.';return bad(message,400);}
}};
