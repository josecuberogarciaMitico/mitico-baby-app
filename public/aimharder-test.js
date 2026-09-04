const FUNCTION_URL='https://natxwawulodkoauqkwqz.supabase.co/functions/v1/mitico-aimharder-read';
const STORAGE_KEY='mitico_auth_session_v1';
const qs=new URLSearchParams(location.search);
const $=(tag,props={},children=[])=>{const n=document.createElement(tag);for(const[k,v]of Object.entries(props)){if(k==='text')n.textContent=v;else if(k==='style')Object.assign(n.style,v);else if(k.startsWith('on')&&typeof v==='function')n.addEventListener(k.slice(2).toLowerCase(),v);else n.setAttribute(k,String(v));}for(const c of children)n.append(c);return n;};
const btn={border:'0',borderRadius:'12px',padding:'10px 14px',fontWeight:'800',cursor:'pointer',background:'#6fb52b',color:'#fff'};
const token=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')?.access_token||''}catch{return''}};
const nextMonday=()=>{const d=new Date();d.setHours(12,0,0,0);const day=d.getDay()||7;d.setDate(d.getDate()-(day-1)+7);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const fmtDate=date=>new Date(`${date}T12:00:00`).toLocaleDateString('es-ES',{weekday:'long',day:'2-digit',month:'2-digit'});
function montarPruebaAimHarder(){
  document.getElementById('mitico-aimharder-panel')?.remove();
  const state={boxes:[],boxId:'',classes:[]};
  const call=async body=>{const t=token();if(!t)throw new Error('No encuentro una sesión activa de Mítico en esta app.');const r=await fetch(FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(typeof d?.error==='string'?d.error:`Error ${r.status} consultando AimHarder.`);return d;};
  const panel=$('div',{id:'mitico-aimharder-panel',style:{position:'fixed',inset:'12px',zIndex:'2147483000',overflow:'auto',background:'#f8fafc',border:'1px solid #dbe3ee',borderRadius:'18px',boxShadow:'0 18px 70px rgba(15,23,42,.28)',padding:'18px',fontFamily:"'SF Pro Rounded','Aptos','Inter','Segoe UI',system-ui,sans-serif",color:'#172033'}});
  const status=$('div',{style:{display:'none',padding:'12px',borderRadius:'12px',marginTop:'12px',fontWeight:'750'}});
  const classesWrap=$('div',{style:{display:'grid',gap:'10px',marginTop:'18px'}});
  const attendeesWrap=$('div',{style:{marginTop:'20px'}});
  const show=(text,error=false)=>{status.style.display='block';status.textContent=text;status.style.background=error?'#fee2e2':'#e2f3d3';status.style.color=error?'#991b1b':'#355a14';};
  const close=$('button',{type:'button',text:'Cerrar prueba',style:{...btn,background:'#334155'},onclick:()=>panel.remove()});
  panel.append($('div',{style:{display:'flex',justifyContent:'space-between',gap:'12px',alignItems:'center'}},[$('div',{},[$('div',{text:'PRUEBA AISLADA · SOLO LECTURA',style:{fontSize:'12px',fontWeight:'850',letterSpacing:'.08em',color:'#64748b'}}),$('h2',{text:'AimHarder → Mítico Baby',style:{margin:'4px 0 0'}})]),close]));
  panel.append($('p',{text:'Esta pantalla solo consulta AimHarder. No importa alumnos, no reserva, no cancela y no modifica Mítico.',style:{marginTop:'10px',color:'#475569'}}),status);
  const box=$('select',{style:{padding:'10px 12px',borderRadius:'10px',border:'1px solid #cbd5e1',minWidth:'240px'}});box.append($('option',{value:'',text:'Selecciona centro'}));box.onchange=()=>state.boxId=box.value;
  const week=$('input',{type:'date',value:nextMonday(),style:{padding:'10px 12px',borderRadius:'10px',border:'1px solid #cbd5e1'}});
  const renderAttendees=(item,list)=>{attendeesWrap.innerHTML='';const card=$('div',{style:{padding:'16px',borderRadius:'14px',background:'#fff',border:'1px solid #cbd5e1'}});card.append($('h3',{text:item.className,style:{marginTop:'0'}}),$('div',{text:`Leídos ${list.length} · AimHarder marca ${item.ocupation}`,style:{marginBottom:'10px',fontWeight:'750'}}));if(!list.length)card.append($('div',{text:'Sin asistentes devueltos por AimHarder.',style:{color:'#64748b'}}));else{const ol=$('ol',{style:{margin:'0',paddingLeft:'22px'}});for(const p of list){const name=String(p.name||'').replace(/\s*\[Invitado\]\s*/gi,' ').replace(/\s+/g,' ').trim();const guest=p.guest||/\[Invitado\]/i.test(String(p.name||''));ol.append($('li',{text:`${name}${guest?' · Invitado':''}${p.bookingAt?` · Reserva: ${p.bookingAt}`:''}`,style:{marginBottom:'7px'}}));}card.append(ol);}attendeesWrap.append(card);};
  const loadAttendees=async item=>{show(`Leyendo listado de ${item.className}…`);try{const d=await call({action:'attendees',date:item.date,classId:item.id,boxId:Number(state.boxId)});const list=d.attendees||[];renderAttendees(item,list);const expected=Number(item.ocupation)||0,actual=Number(d.total)||0;show(expected===actual?`Listado completo: ${actual}/${expected}.`:`ATENCIÓN: AimHarder marca ${expected} ocupadas y se han leído ${actual}. No importar.`,expected!==actual);}catch(e){show(e instanceof Error?e.message:'No se pudo leer el listado.',true)}};
  const renderClasses=list=>{classesWrap.innerHTML='';attendeesWrap.innerHTML='';for(const item of list){const c=$('div',{style:{padding:'14px',borderRadius:'14px',background:'#fff',border:'1px solid #e2e8f0',display:'grid',gap:'7px'}});c.append($('div',{text:item.className,style:{fontWeight:'900'}}),$('div',{text:`${fmtDate(item.date)} · ${item.time||'Hora no disponible'} · ${item.modalidad}`,style:{color:'#475569'}}),$('div',{text:`Ocupadas: ${item.ocupation}/${item.limit||'?'}${item.coachName?` · Instructor: ${item.coachName}`:''}`,style:{fontWeight:'750'}}));if(item.fueraPatronSemanal)c.append($('div',{text:'Fuera del patrón semanal habitual: revisar antes de usar.',style:{color:'#9a3412',fontWeight:'750'}}));c.append($('button',{type:'button',text:'Ver listado',style:btn,onclick:()=>loadAttendees(item)}));classesWrap.append(c)}};
  const loadBoxes=async()=>{show('Conectando con AimHarder…');try{const d=await call({action:'boxes'});state.boxes=d.boxes||[];box.innerHTML='';box.append($('option',{value:'',text:'Selecciona centro'}));for(const b of state.boxes)box.append($('option',{value:b.boid,text:`${b.gym} · ${b.role}`}));const mitico=state.boxes.find(b=>/MITICO|MÍTICO/i.test(b.gym));state.boxId=String(mitico?.boid??state.boxes[0]?.boid??'');box.value=state.boxId;show(state.boxes.length?`Conexión correcta. ${state.boxes.length} centro(s) disponible(s).`:'Conexión correcta, pero la cuenta no devolvió centros.');}catch(e){show(e instanceof Error?e.message:'No se pudo conectar con AimHarder.',true)}};
  const loadWeek=async()=>{if(!state.boxId)return show('Selecciona primero el centro de Mítico.',true);show('Leyendo la semana en AimHarder…');try{const d=await call({action:'week',weekStart:week.value,boxId:Number(state.boxId)});state.classes=d.classes||[];renderClasses(state.classes);show(`Semana cargada: ${state.classes.length} clase(s) Mítico detectada(s).`);}catch(e){show(e instanceof Error?e.message:'No se pudo cargar la semana.',true)}};
  panel.append($('div',{style:{display:'flex',gap:'10px',flexWrap:'wrap',marginTop:'14px'}},[$('button',{type:'button',text:'Probar conexión',style:btn,onclick:loadBoxes}),box,week,$('button',{type:'button',text:'Cargar semana',style:btn,onclick:loadWeek})]),classesWrap,attendeesWrap);
  document.body.append(panel);
  loadBoxes();
}
function montarBotonPrueba(){
  if(document.getElementById('mitico-aimharder-launch'))return;
  const launch=$('button',{id:'mitico-aimharder-launch',type:'button',text:'Probar AimHarder',style:{position:'fixed',right:'14px',bottom:'calc(14px + env(safe-area-inset-bottom, 0px))',zIndex:'2147482000',border:'0',borderRadius:'999px',padding:'12px 16px',fontWeight:'850',background:'#6fb52b',color:'#fff',boxShadow:'0 8px 28px rgba(15,23,42,.22)',cursor:'pointer'},onclick:montarPruebaAimHarder});
  document.body.append(launch);
}
function arrancar(){
  if(qs.get('aimharder')==='1') montarPruebaAimHarder();
  const revisar=()=>{if(token())montarBotonPrueba();else document.getElementById('mitico-aimharder-launch')?.remove();};
  revisar();
  setInterval(revisar,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arrancar,{once:true});else arrancar();
