const FUNCTION_URL='https://natxwawulodkoauqkwqz.supabase.co/functions/v1/mitico-aimharder-read';
const STORAGE_KEY='mitico_auth_session_v1';

const token=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')?.access_token||''}catch{return''}};
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
const hhmm=v=>String(v||'').trim().slice(0,5);
const cleanName=v=>String(v||'').replace(/\s*\[Invitado\]\s*/gi,' ').replace(/\s+/g,' ').trim();

async function callAim(body){
  const t=token();
  if(!t) throw new Error('No encuentro una sesión activa de Mítico.');
  const r=await fetch(FUNCTION_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
    body:JSON.stringify(body),
  });
  const text=await r.text();
  let d={};
  try{d=text?JSON.parse(text):{}}catch{throw new Error(`AimHarder devolvió una respuesta no válida (HTTP ${r.status}).`)}
  if(!r.ok) throw new Error(typeof d?.error==='string'?d.error:`Error ${r.status} consultando AimHarder.`);
  return d;
}

function fechaIsoDesdeFormulario(form){
  const texto=form.textContent||'';
  const m=texto.match(/D[ií]a seleccionado:\s*(\d{2})\/(\d{2})\/(\d{4})/i) || texto.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if(!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function modalidadDesdeFormulario(form){
  const selects=[...form.querySelectorAll('select')];
  const modalidad=selects.find(s=>['BABY','OCIO','INTENSIVOS'].includes(norm(s.value)));
  return modalidad?.value||'';
}

function horasDesdeFormulario(form){
  const times=[...form.querySelectorAll('input[type="time"]')];
  return {inicio:hhmm(times[0]?.value),fin:hhmm(times[1]?.value)};
}

function rangoClase(item){
  const partes=String(item?.time||'').split('-');
  return {inicio:hhmm(partes[0]),fin:hhmm(partes[1])};
}

function setReactTextarea(textarea,value){
  const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;
  if(setter) setter.call(textarea,value); else textarea.value=value;
  textarea.dispatchEvent(new Event('input',{bubbles:true}));
  textarea.dispatchEvent(new Event('change',{bubbles:true}));
}

function emitirDatosAimHarder({fecha,inicio,fin,modalidad,asistentes}){
  window.dispatchEvent(new CustomEvent('mitico:aimharder-attendees',{
    detail:{
      fecha,
      inicio,
      fin,
      modalidad,
      asistentes:(Array.isArray(asistentes)?asistentes:[]).map(p=>({
        name:cleanName(p?.name),
        phone:String(p?.phone||'').trim(),
        birthDate:String(p?.birthDate||'').trim(),
        clientId:String(p?.clientId||'').trim(),
        guest:Boolean(p?.guest),
      })),
    },
  }));
}

function pintarEstado(el,text,error=false){
    if(el) el.style.display='';
  el.textContent=text;
  el.style.display='block';
  el.style.marginTop='8px';
  el.style.padding='10px 12px';
  el.style.borderRadius='10px';
  el.style.fontWeight='750';
  el.style.background=error?'#fee2e2':'#ecfdf5';
  el.style.color=error?'#991b1b':'#166534';
  el.style.border=error?'1px solid #fecaca':'1px solid #bbf7d0';
}

async function traerListado(form,button,status){
  const modalidad=norm(modalidadDesdeFormulario(form));
  if(modalidad!=='BABY'){
    pintarEstado(status,'La carga automática desde AimHarder se usa solo en Baby. Ocio e Intensivos mantienen sus flujos actuales.',true);
    return;
  }

  const fecha=fechaIsoDesdeFormulario(form);
  const {inicio,fin}=horasDesdeFormulario(form);
  const textarea=form.querySelector('#agenda-textarea-listado');
  if(!fecha||!inicio||!fin||!textarea){
    pintarEstado(status,'No puedo identificar con seguridad la fecha, el turno o el listado. No se ha modificado nada.',true);
    return;
  }

  button.disabled=true;
  const original=button.textContent;
  button.textContent='Consultando AimHarder…';
  pintarEstado(status,`Buscando Baby ${fecha} · ${inicio}–${fin}…`);

  try{
    const boxes=await callAim({action:'boxes'});
    const listaBoxes=Array.isArray(boxes?.boxes)?boxes.boxes:[];
    const box=listaBoxes.find(b=>/MITICO|MÍTICO/i.test(String(b?.gym||''))) || (listaBoxes.length===1?listaBoxes[0]:null);
    if(!box) throw new Error('No puedo identificar de forma inequívoca el centro Mítico en AimHarder.');

    const semana=await callAim({action:'week',weekStart:fecha,boxId:Number(box.boid)});
    const clases=(Array.isArray(semana?.classes)?semana.classes:[]).filter(item=>{
      if(norm(item?.modalidad)!=='BABY' || String(item?.date)!==fecha) return false;
      const r=rangoClase(item);
      return r.inicio===inicio && r.fin===fin;
    });

    if(clases.length===0) throw new Error(`No encuentro en AimHarder un Baby exacto para ${fecha} · ${inicio}–${fin}. No he rellenado nada.`);
    if(clases.length>1) throw new Error(`AimHarder devuelve ${clases.length} clases Baby para ese mismo día y horario. No voy a adivinar cuál es.`);

    const clase=clases[0];
    const data=await callAim({
      action:'attendees',
      date:fecha,
      classId:Number(clase.id),
      boxId:Number(box.boid),
      className:String(clase?.className||''),
      time:String(clase?.time||''),
      timeId:String(clase?.timeid||''),
      modalidad:'BABY',
    });
    const asistentes=Array.isArray(data?.attendees)?data.attendees:[];
    const nombres=asistentes.map(p=>cleanName(p?.name)).filter(Boolean);
    const ocupadas=Number(data?.booking?.reportedOccupation ?? clase?.reportedOccupation ?? clase?.ocupation);

    if(!Number.isFinite(ocupadas) || nombres.length!==ocupadas){
      throw new Error(`No cuadra el listado: AimHarder marca ${ocupadas} ocupadas y se han leído ${nombres.length}. No he volcado nada.`);
    }

    emitirDatosAimHarder({
      fecha,
      inicio,
      fin,
      modalidad:'BABY',
      asistentes,
    });

    if(ocupadas===0){
      setReactTextarea(textarea,'');
      pintarEstado(status,'Turno encontrado en AimHarder: 0 apuntados. No hay listado que volcar.');
      return;
    }

    setReactTextarea(textarea,nombres.join('\n'));

    const conContactoCompleto=asistentes.filter(p=>String(p?.phone||'').trim() && String(p?.birthDate||'').trim()).length;
    const detalleContacto=conContactoCompleto>0
      ? ` ${conContactoCompleto} asistente(s) incluyen teléfono y fecha de nacimiento para facilitar Altas/Test.`
      : ' AimHarder no ha entregado todavía teléfono/fecha de nacimiento en esta consulta; los nombres sí se han cargado.';

    // La carga se realiza en segundo plano; los datos de contacto quedan
    // disponibles para Alta / Test, pero no se muestran en la pantalla de sesión.
    if(status){
      status.textContent='';
      status.style.display='none';
    }
    textarea.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(e){
    pintarEstado(status,e instanceof Error?e.message:'No se pudo cargar el listado desde AimHarder.',true);
  }finally{
    button.disabled=false;
    button.textContent=original;
  }
}

function integrarFormulario(form){
  if(!form || form.dataset.aimharderIntegrado==='1') return;
  const textarea=form.querySelector('#agenda-textarea-listado');
  if(!textarea) return;
  form.dataset.aimharderIntegrado='1';

  textarea.setAttribute('placeholder','Puedes pegar el listado manualmente o traerlo directamente desde AimHarder...');

  const wrap=document.createElement('div');
  wrap.dataset.aimharderIntegracion='1';
  wrap.style.margin='10px 0 12px';

  const button=document.createElement('button');
  button.type='button';
  button.textContent='Traer listado de AimHarder';
  Object.assign(button.style,{
    border:'0',borderRadius:'12px',padding:'11px 14px',fontWeight:'850',cursor:'pointer',
    background:'#6fb52b',color:'#fff',fontSize:'15px',width:'100%'
  });

  const status=document.createElement('div');
  status.style.display='none';
  wrap.append(button,status);

  const label=textarea.closest('label');
  if(label?.parentNode) label.parentNode.insertBefore(wrap,label.nextSibling); else textarea.parentNode?.append(wrap);

  const refrescar=()=>{
    const esBaby=norm(modalidadDesdeFormulario(form))==='BABY';
    wrap.style.display=esBaby?'block':'none';
  };
  form.querySelectorAll('select').forEach(s=>s.addEventListener('change',refrescar));
  button.addEventListener('click',()=>traerListado(form,button,status));
  refrescar();
}

function revisar(){
  document.querySelectorAll('#agenda-formulario-listado').forEach(integrarFormulario);
}

const observer=new MutationObserver(revisar);
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{
    revisar();
    observer.observe(document.body,{childList:true,subtree:true});
  },{once:true});
}else{
  revisar();
  observer.observe(document.body,{childList:true,subtree:true});
}
