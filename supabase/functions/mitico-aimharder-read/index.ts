import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

type Modalidad='BABY'|'OCIO'|'INTENSIVOS';
type Role={boid:number;centreUrl:string;gym:string;role:string};
type Attendee={
  name:string;
  guest:boolean;
  bookingAt:string|null;
  phone:string|null;
  birthDate:string|null;
  clientId:string|null;
};
type Booking={id:number;date:string;time:string;timeid:string;className:string;coachName:string|null;ocupation:number;reportedOccupation:number;limit:number;waitlist:number;modalidad:Modalidad;fueraPatronSemanal:boolean};

const LOGIN='https://login.aimharder.com/api/login';
const SU=Deno.env.get('SUPABASE_URL')??'';
const AN=Deno.env.get('SUPABASE_ANON_KEY')??'';
const SR=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';
const USER=(Deno.env.get('AIMHARDER_USERNAME')??Deno.env.get('AIMHARDER_EMAIL')??'').trim();
const PASS=Deno.env.get('AIMHARDER_PASSWORD')??'';
const FP=(Deno.env.get('AIMHARDER_FINGERPRINT')??'').trim();
const BOX=Number(Deno.env.get('AIMHARDER_BOX_ID')??'');

const N=(v:unknown)=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
function classify(v:unknown):Modalidad|null{const n=N(v);if(!n)return null;if(['PREALEVIN','ALEVIN','INFANTIL','U12','U14','U16','U18','COMPETICION','EQUIPO','TEAM'].some(t=>n.includes(t)))return null;if(n.includes('INTENSIV'))return'INTENSIVOS';if(n.includes('BABY'))return'BABY';if(n.includes('OCIO'))return'OCIO';return null}
function outside(date:string,m:Modalidad){if(m==='INTENSIVOS')return false;const d=new Date(`${date}T12:00:00Z`).getUTCDay();if(m==='BABY')return![3,5,6,0].includes(d);if(m==='OCIO')return![4,6,0].includes(d);return false}
function apiDate(d:string){return d.replaceAll('-','')}
function validDate(d:string){return /^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(new Date(`${d}T12:00:00Z`).getTime())}
function addDays(d:string,x:number){const p=new Date(`${d}T12:00:00Z`);p.setUTCDate(p.getUTCDate()+x);return p.toISOString().slice(0,10)}
function monday(d:string){const p=new Date(`${d}T12:00:00Z`);const w=p.getUTCDay()||7;p.setUTCDate(p.getUTCDate()-(w-1));return p.toISOString().slice(0,10)}
function host(v:unknown){const raw=String(v??'').trim();const u=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);const h=u.hostname.toLowerCase();if(h!=='aimharder.com'&&!h.endsWith('.aimharder.com'))throw new Error('AIMHARDER_BAD_HOST');return h}
const cors=(r:Request)=>({'Access-Control-Allow-Origin':r.headers.get('origin')||'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'});
const J=(r:Request,b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors(r),'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});

function cookieHeader(h:Headers){const g=(h as any).getSetCookie;const arr:string[]=typeof g==='function'?g.call(h):(h.get('set-cookie')?[h.get('set-cookie')!]:[]);return arr.map(v=>v.split(';')[0]?.trim()).filter(Boolean).join('; ')}
async function fingerprint(){if(FP)return FP;const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`mitico:${USER.toLowerCase()}`));return Array.from(new Uint8Array(d)).map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,50)}
async function auth(req:Request){const t=(req.headers.get('authorization')??'').match(/^Bearer\s+(.+)$/i)?.[1]??'';if(!t)throw new Error('UNAUTHORIZED');const u=await fetch(`${SU}/auth/v1/user`,{headers:{apikey:AN,Authorization:`Bearer ${t}`}});if(!u.ok)throw new Error('UNAUTHORIZED');const id=String((await u.json())?.id??'');const p=await fetch(`${SU}/rest/v1/usuarios_app?select=rol,activo&auth_user_id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:SR,Authorization:`Bearer ${SR}`}});const q=(await p.json())?.[0];if(!q?.activo||!['coordinador_jefe','sub_coordinador','coordinador'].includes(String(q?.rol??'')))throw new Error('FORBIDDEN')}

type Session={cookies:string;roles:Role[]};
async function login():Promise<Session>{if(!USER||!PASS)throw new Error('AIMHARDER_NOT_CONFIGURED');const r=await fetch(LOGIN,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({username:USER,password:PASS,fingerprint:await fingerprint(),iniframe:0})});const c=cookieHeader(r.headers),txt=await r.text();let p:any;try{p=JSON.parse(txt)}catch{throw new Error('AIMHARDER_LOGIN_INVALID_RESPONSE')}if(!p?.data?.auth?.authOK)throw new Error('AIMHARDER_LOGIN_FAILED');if(!c)throw new Error('AIMHARDER_LOGIN_NO_COOKIE');const roles=(p?.data?.userData?.roles??[]).map((x:any)=>({boid:Number(x?.boid),centreUrl:host(x?.centre_url),gym:String(x?.gym??'').trim(),role:String(x?.role??'').trim()})).filter((x:Role)=>Number.isFinite(x.boid));if(!roles.length)throw new Error('AIMHARDER_NO_BOXES');return{cookies:c,roles}}
function role(rs:Role[],id?:number){const wanted=Number.isFinite(Number(id))?Number(id):BOX;if(Number.isFinite(wanted)){const x=rs.find(r=>r.boid===wanted);if(!x)throw new Error('AIMHARDER_BOX_NOT_ALLOWED');return x}const m=rs.find(r=>/MITICO|MÍTICO/i.test(r.gym));if(m)return m;if(rs.length===1)return rs[0];throw new Error('AIMHARDER_BOX_REQUIRED')}
async function get(s:Session,r:Role,path:string,params:Record<string,string>){const q=new URLSearchParams({...params,_:String(Date.now())});const x=await fetch(`https://${r.centreUrl}${path}?${q}`,{headers:{Cookie:s.cookies,'X-Requested-With':'XMLHttpRequest',Accept:'application/json, text/plain, */*'}});const t=await x.text();if(!t.trim())return null;let j:any;try{j=JSON.parse(t)}catch{throw new Error(`AIMHARDER_NON_JSON:${path}`)}if(j?.logout===1||j?.logout===true||j?.logout==='1')throw new Error('AIMHARDER_SESSION_EXPIRED');return j}

function personName(v:any){if(typeof v==='string'){const s=v.trim();return s||null}for(const k of['name','userName','athleteName','nombre','fullName','fullname','clientName'])if(typeof v?.[k]==='string'&&v[k].trim())return v[k].trim();const f=v?.firstName??v?.firstname;const l=v?.lastName??v?.lastname;const c=`${f??''} ${l??''}`.replace(/\s+/g,' ').trim();return c||null}
function bookingAt(v:any){for(const k of['bookingAt','bookedAt','createdAt','created_at','bookingDate','reservationDate','dateBooked','date'])if(v?.[k]!=null&&String(v[k]).trim())return String(v[k]).trim();return null}
function isGuest(v:any,name:string){const d=v?.guest??v?.isGuest??v?.invited??v?.isInvited;if(d===true||d===1||d==='1')return true;return N(name).includes('INVITADO')}
function looksPerson(v:any){if(v==null)return false;if(typeof v==='string')return v.trim().split(/\s+/).length>=2;if(typeof v!=='object')return false;const n=personName(v);if(!n)return false;const cls=classify(v?.className??v?.class??'');return !cls}

const PHONE_KEYS=new Set(['mobile','mobilephone','phone','phonenumber','telefono','telefonomovil','telephone','cellphone','cell']);
const BIRTH_KEYS=new Set(['birthdate','dateofbirth','birthday','fechanacimiento','fecha_nacimiento','dob']);
const CLIENT_KEYS=new Set(['clientid','client_id','cid','memberid','member_id','userid','user_id','athleteid','athlete_id','id']);
function keyNorm(v:string){return v.toLowerCase().replace(/[^a-z0-9_]/g,'')}
function findDeep(obj:any,keys:Set<string>,depth=0):unknown{if(obj==null||depth>3||typeof obj!=='object')return null;for(const [k,v] of Object.entries(obj)){if(keys.has(keyNorm(k))&&(typeof v==='string'||typeof v==='number'))return v}for(const v of Object.values(obj)){if(v&&typeof v==='object'&&!Array.isArray(v)){const found=findDeep(v,keys,depth+1);if(found!=null&&String(found).trim())return found}}return null}
function normalizePhone(v:unknown){const raw=String(v??'').trim();if(!raw)return null;const clean=raw.replace(/[^\d+]/g,'');const digits=clean.replace(/\D/g,'');return digits.length>=6?clean:null}
function normalizeBirthDate(v:unknown){const raw=String(v??'').trim();if(!raw)return null;const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);if(iso)return `${iso[1]}-${iso[2]}-${iso[3]}`;const es=raw.match(/^(\d{1,2})[\/. -](\d{1,2})[\/. -](\d{4})$/);if(es)return `${es[3]}-${es[2].padStart(2,'0')}-${es[1].padStart(2,'0')}`;const ms=Number(raw);if(Number.isFinite(ms)&&ms>0){const d=new Date(ms);if(!Number.isNaN(d.getTime()))return d.toISOString().slice(0,10)}return null}
function normalizeClientId(v:unknown){const raw=String(v??'').trim();return raw&&/^[A-Za-z0-9_-]{1,80}$/.test(raw)?raw:null}
function collectClientIdCandidates(obj:any,depth=0,out:string[]=[]){if(obj==null||depth>4)return out;if(typeof obj==='string'){const m=obj.match(/[?&]cid=([A-Za-z0-9_-]{1,80})/i);if(m?.[1])out.push(m[1]);return out}if(typeof obj==='number'){if(Number.isFinite(obj))out.push(String(obj));return out}if(typeof obj!=='object')return out;for(const [k,v] of Object.entries(obj)){const nk=keyNorm(k);if(CLIENT_KEYS.has(nk)){const c=normalizeClientId(v);if(c)out.push(c)}if(typeof v==='string'){const m=v.match(/[?&]cid=([A-Za-z0-9_-]{1,80})/i);if(m?.[1])out.push(m[1])}}for(const v of Object.values(obj)){if(v&&typeof v==='object')collectClientIdCandidates(v,depth+1,out)}return Array.from(new Set(out))}
function decodeHtml(v:string){return v.replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))}
function inputValue(tag:string){const m=tag.match(/\bvalue\s*=\s*(["'])(.*?)\1/i);return m?decodeHtml(m[2]).trim():''}
function nextInputValueAfterLabel(html:string,label:RegExp){const m=label.exec(html);if(!m)return '';const chunk=html.slice(m.index,Math.min(html.length,m.index+1800));const tag=chunk.match(/<input\b[^>]*>/i)?.[0]||'';return inputValue(tag)}
function inputValueByNameOrId(html:string,patterns:RegExp[]){const tags=html.match(/<input\b[^>]*>/gi)||[];for(const tag of tags){const name=tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2]||'';const id=tag.match(/\bid\s*=\s*(["'])(.*?)\1/i)?.[2]||'';if(patterns.some(p=>p.test(name)||p.test(id))){const v=inputValue(tag);if(v)return v}}return ''}
function normalizeNameLoose(v:string){return N(v).replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function profileNameMatches(expected:string,parts:string[]){const e=normalizeNameLoose(expected);const p=normalizeNameLoose(parts.filter(Boolean).join(' '));if(!e||!p)return false;if(e===p)return true;const ew=e.split(' ').filter(Boolean),pw=p.split(' ').filter(Boolean);if(!ew.length||!pw.length)return false;return pw.every(x=>ew.includes(x))&&pw.length>=Math.min(2,ew.length)}
async function fetchClientProfile(s:Session,r:Role,cid:string,expectedName:string,allowDirectId=false){const apiUrl=`https://${r.centreUrl}/api/client/${encodeURIComponent(cid)}?${new URLSearchParams({box:String(r.boid),_:String(Date.now())})}`;try{const apiRes=await fetch(apiUrl,{headers:{Cookie:s.cookies,'X-Requested-With':'XMLHttpRequest',Accept:'application/json, text/plain, */*','User-Agent':'Mozilla/5.0'},redirect:'follow'});if(apiRes.ok){const txt=await apiRes.text();if(txt.trim()){let data:any=null;try{data=JSON.parse(txt)}catch{data=null}if(data&&typeof data==='object'){const first=String(data?.clnom??'').trim();const last1=String(data?.clape1??'').trim();const last2=String(data?.clape2??'').trim();const nameMatches=profileNameMatches(expectedName,[first,last1,last2]);if(nameMatches||allowDirectId){const birthDate=normalizeBirthDate(data?.clfecnac);const phone=normalizePhone(data?.clmovil);const birthValid=(()=>{if(!birthDate)return null;const d=new Date(`${birthDate}T00:00:00Z`);const now=new Date();if(Number.isNaN(d.getTime())||d.getTime()>now.getTime())return null;const min=new Date();min.setUTCFullYear(min.getUTCFullYear()-120);return d.getTime()<min.getTime()?null:birthDate})();return{clientId:cid,phone,birthDate:birthValid}}}}}}catch{}const url=`https://${r.centreUrl}/clients?cid=${encodeURIComponent(cid)}`;const res=await fetch(url,{headers:{Cookie:s.cookies,Accept:'text/html,application/xhtml+xml','User-Agent':'Mozilla/5.0'},redirect:'follow'});if(!res.ok)return null;const html=await res.text();if(!html||html.length<500)return null;const first=nextInputValueAfterLabel(html,/>\s*Nombre\s*</i)||inputValueByNameOrId(html,[/nombre/i,/first.?name/i,/firstname/i]);const last1=nextInputValueAfterLabel(html,/Primer\s+apellido/i)||inputValueByNameOrId(html,[/primer.?apellido/i,/last.?name/i,/lastname/i]);const last2=nextInputValueAfterLabel(html,/Segundo\s+apellido/i)||inputValueByNameOrId(html,[/segundo.?apellido/i,/second.?last/i,/lastname2/i]);const phoneRaw=nextInputValueAfterLabel(html,/Tel[eé]fono\s+m[oó]vil/i)||inputValueByNameOrId(html,[/movil/i,/mobile/i,/phone/i,/telefono/i]);const nameMatches=profileNameMatches(expectedName,[first,last1,last2]);if(!nameMatches&&!allowDirectId)return null;return{clientId:cid,phone:normalizePhone(phoneRaw),birthDate:null}}
function personObjectsMatchingName(root:any,name:string){const wanted=N(name);if(!wanted)return[];return walk(root).filter((x:any)=>N(personName(x)||'')===wanted)}
async function enrichAttendeesWithProfiles(s:Session,r:Role,target:any,at:Attendee[]){const out:Attendee[]=[];for(const attendee of at){if(attendee.phone&&attendee.birthDate){out.push(attendee);continue}const matching=personObjectsMatchingName(target,attendee.name);const ids=new Set<string>();if(attendee.clientId){ids.add(attendee.clientId)}else{for(const obj of matching){for(const candidate of collectClientIdCandidates(obj)){ids.add(candidate)}}}if(!attendee.clientId&&ids.size>1){out.push(attendee);continue}let enriched={...attendee};for(const cid of Array.from(ids).slice(0,1)){const directId=Boolean(attendee.clientId&&String(attendee.clientId)===String(cid));const profile=await fetchClientProfile(s,r,cid,attendee.name,directId).catch(()=>null);if(!profile)continue;enriched={...enriched,clientId:profile.clientId||enriched.clientId,phone:profile.phone||enriched.phone,birthDate:profile.birthDate||enriched.birthDate}}out.push(enriched)}return out}
function attendeeDetails(v:any){return{phone:normalizePhone(findDeep(v,PHONE_KEYS)),birthDate:normalizeBirthDate(findDeep(v,BIRTH_KEYS)),clientId:normalizeClientId(findDeep(v,CLIENT_KEYS))}}
function attendeesFromNode(node:any):Attendee[]{const keys=['athletes','users','attendees','members','clients','reservations','bookings','people','participants'];let source:any[]=[];for(const k of keys){if(Array.isArray(node?.[k])){const arr=node[k].filter(looksPerson);if(arr.length){source=arr;break}}}if(!source.length&&Array.isArray(node)&&node.every(looksPerson))source=node;const out:Attendee[]=[];for(const v of source){const n=personName(v);if(!n)continue;const clean=n.replace(/\s*\[Invitado\]\s*/gi,' ').replace(/\s+/g,' ').trim();if(!N(clean))continue;const details=attendeeDetails(v);out.push({name:clean,guest:isGuest(v,n),bookingAt:bookingAt(v),phone:details.phone,birthDate:details.birthDate,clientId:details.clientId})}return out}
function walk(root:any,depth=0,out:any[]=[]){if(depth>7||root==null)return out;if(Array.isArray(root)){for(const x of root)walk(x,depth+1,out);return out}if(typeof root==='object'){out.push(root);for(const v of Object.values(root))if(v&&typeof v==='object')walk(v,depth+1,out)}return out}
function nodeTime(x:any){return String(x?.time??x?.hour??x?.schedule??'').trim()}
function nodeClassName(x:any){return String(x?.className??x?.class_name??x?.class??x?.activityName??x?.activity??x?.name??'').trim()}
function matchNode(nodes:any[],b:Booking){
  const bn=N(b.className);
  const bt=b.time.replace(/\s/g,'').split('-')[0];
  const ti=String(b.timeid||'');

  const modalidadNodo=(x:any)=>classify(nodeClassName(x));
  const nombreNodo=(x:any)=>N(nodeClassName(x));
  const inicioNodo=(x:any)=>nodeTime(x).replace(/\s/g,'').split('-')[0];

  const coincide=(x:any)=>{
    const cn=nombreNodo(x);
    const tt=inicioNodo(x);
    const nodeTimeId=String(x?.timeid??x?.timeId??'');
    return modalidadNodo(x)===b.modalidad&&(!bn||!cn||cn===bn)&&(!bt||!tt||bt===tt)&&(!ti||!nodeTimeId||nodeTimeId===ti);
  };

  const porId=nodes.filter(x=>Number(x?.id??x?.classId??x?.bookingId)===b.id&&coincide(x));
  if(porId.length===1)return porId[0];

  if(ti){const porTimeId=nodes.filter(x=>String(x?.timeid??x?.timeId??'')===ti&&coincide(x));if(porTimeId.length===1)return porTimeId[0]}

  const exactas=nodes.filter(x=>coincide(x)&&nombreNodo(x)===bn&&inicioNodo(x)===bt);
  if(exactas.length===1)return exactas[0];

  return null;
}
function num(x:any,keys:string[]){for(const k of keys){const n=Number(x?.[k]);if(Number.isFinite(n))return n}return null}
function publicBookings(date:string,raw:any):Booking[]{const list=Array.isArray(raw?.bookings)?raw.bookings:[];const out:Booking[]=[];for(const x of list){const m=classify(x?.className);const id=Number(x?.id);if(!m||!Number.isFinite(id))continue;const reportedOccupation=Number(x?.ocupation)||0;out.push({id,date,time:String(x?.time??'').trim(),timeid:String(x?.timeid??'').trim(),className:String(x?.className??'').trim(),coachName:x?.coachName?String(x.coachName).trim():null,ocupation:reportedOccupation,reportedOccupation,limit:Number(x?.limit)||0,waitlist:Number.isFinite(Number(x?.waitlist))?Number(x.waitlist):-1,modalidad:m,fueraPatronSemanal:outside(date,m)})}return out}
function coachOnlyBookings(date:string,coach:any,existing:Booking[]){const nodes=walk(coach);const seen=new Set(existing.map(x=>`${x.id}|${N(x.className)}|${x.timeid}`));const out:Booking[]=[];for(const x of nodes){const cn=nodeClassName(x);const m=classify(cn);if(!m)continue;const time=nodeTime(x);const id=Number(x?.id??x?.classId??x?.bookingId);if(!Number.isFinite(id))continue;const timeid=String(x?.timeid??x?.timeId??'').trim();const key=`${id}|${N(cn)}|${timeid}`;if(seen.has(key)||existing.some(e=>e.id===id))continue;seen.add(key);const at=attendeesFromNode(x);const reportedOccupation=num(x,['ocupation','occupation','occupied','booked','count'])??at.length;out.push({id,date,time,timeid,className:cn,coachName:x?.coachName?String(x.coachName).trim():null,ocupation:reportedOccupation,reportedOccupation,limit:num(x,['limit','capacity','max'])||0,waitlist:num(x,['waitlist','waiting'])??-1,modalidad:m,fueraPatronSemanal:outside(date,m)})}return out}
async function day(s:Session,r:Role,date:string){const params={day:apiDate(date),box:String(r.boid),familyId:''};const [pub,coach]=await Promise.all([get(s,r,'/api/bookings',params),get(s,r,'/api/coachBookings',params)]);const base=publicBookings(date,pub);const nodes=walk(coach);for(const b of base){const target=matchNode(nodes,b);if(!target)continue;const lim=num(target,['limit','capacity','max']);if(lim!=null)b.limit=lim}return{classes:[...base,...coachOnlyBookings(date,coach,base)],coach}}

Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});if(req.method!=='POST')return J(req,{error:'Método no permitido.'},405);try{await auth(req);const body=await req.json().catch(()=>({}));const action=String(body?.action??'week');if(!['boxes','week','attendees'].includes(action))return J(req,{error:'Acción no reconocida.'},400);const s=await login();if(action==='boxes')return J(req,{boxes:s.roles.map(({boid,gym,role})=>({boid,gym,role}))});const r=role(s.roles,body?.boxId);if(action==='week'){const requested=String(body?.weekStart??new Date().toISOString().slice(0,10)).slice(0,10);if(!validDate(requested))return J(req,{error:'Fecha de semana no válida.'},400);const ws=monday(requested);const ds=await Promise.all(Array.from({length:7},(_,i)=>day(s,r,addDays(ws,i))));const classes=ds.flatMap(x=>x.classes).sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));return J(req,{box:{boid:r.boid,gym:r.gym},weekStart:ws,classes})}if(action==='attendees'){
  const date=String(body?.date??'').slice(0,10);
  const id=Number(body?.classId);
  const expectedName=N(body?.className??'');
  const expectedTime=String(body?.time??'').replace(/\s/g,'');
  const expectedTimeId=String(body?.timeId??body?.timeid??'').trim();
  const modalidadPedida=String(body?.modalidad??'').trim();
  const expectedModalidad=modalidadPedida?classify(modalidadPedida):null;
  if(!validDate(date)||!Number.isFinite(id))return J(req,{error:'La fecha o el identificador de clase no son válidos.'},400);
  if(modalidadPedida&&!expectedModalidad)return J(req,{error:'Modalidad no válida.'},400);
  const d=await day(s,r,date);
  const coincideIdentidad=(x:Booking)=>{const mismaModalidad=!expectedModalidad||x.modalidad===expectedModalidad;const mismoNombre=!expectedName||N(x.className)===expectedName;const mismoHorario=!expectedTime||String(x.time||'').replace(/\s/g,'')===expectedTime;const mismoTimeId=!expectedTimeId||String(x.timeid||'')===expectedTimeId;return mismaModalidad&&mismoNombre&&mismoHorario&&mismoTimeId};
  const candidatas=d.classes.filter(x=>x.id===id&&coincideIdentidad(x));
  let b:Booking|undefined;
  if(candidatas.length===1)b=candidatas[0];
  if(!b&&(expectedName||expectedTime||expectedTimeId||expectedModalidad)){const porIdentidad=d.classes.filter(coincideIdentidad);if(porIdentidad.length===1)b=porIdentidad[0]}
  if(!b)return J(req,{error:'No puedo identificar de forma inequívoca la clase exacta de AimHarder.',code:'AIMHARDER_CLASS_AMBIGUOUS'},409);
  if(expectedModalidad&&b.modalidad!==expectedModalidad)return J(req,{error:`La clase resuelta es ${b.modalidad}, pero se solicitó ${expectedModalidad}. No se devuelve ningún listado.`,code:'AIMHARDER_MODALIDAD_MISMATCH'},409);
  const target=matchNode(walk(d.coach),b);const baseAt=target?attendeesFromNode(target):[];const at=target?await enrichAttendeesWithProfiles(s,r,target,baseAt):baseAt;return J(req,{booking:b,attendees:at,total:at.length,text:at.map(x=>x.name).join('\n'),contactosCompletos:at.filter(x=>x.phone&&x.birthDate).length})}return J(req,{error:'Acción no reconocida.'},400)}catch(e){const code=e instanceof Error?e.message:'UNKNOWN';const map:Record<string,[number,string]>={UNAUTHORIZED:[401,'Sesión de Mítico no válida.'],FORBIDDEN:[403,'Solo coordinación puede consultar AimHarder.'],AIMHARDER_NOT_CONFIGURED:[503,'Faltan las credenciales de AimHarder en el backend.'],AIMHARDER_LOGIN_FAILED:[502,'AimHarder ha rechazado las credenciales.'],AIMHARDER_LOGIN_NO_COOKIE:[502,'AimHarder no ha creado una sesión válida.'],AIMHARDER_NO_BOXES:[502,'La cuenta no tiene ningún centro asociado.'],AIMHARDER_BOX_REQUIRED:[409,'Selecciona el centro de Mítico.'],AIMHARDER_BOX_NOT_ALLOWED:[403,'Ese centro no pertenece a la cuenta.'],AIMHARDER_SESSION_EXPIRED:[502,'La sesión de AimHarder ha caducado. Reintenta.']};const k=map[code];if(k)return J(req,{error:k[1],code},k[0]);console.error('mitico-aimharder-read',e);return J(req,{error:'No se pudo consultar AimHarder.',code:'AIMHARDER_INTERNAL'},500)}});
