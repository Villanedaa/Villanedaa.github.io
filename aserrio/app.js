const K='madera_v1',$=s=>document.querySelector(s),n=v=>parseFloat(v)||0;
const fmt=v=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v||0);
let db=[];try{db=JSON.parse(localStorage.getItem(K))||[]}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){alert('No se pudo guardar en el navegador')}};
const P=[['A','4. Aserrador','Aserrador','trabajada'],['B','5. Bolillero','Bolillero','trabajada'],['R','6. Arriero','Arriero','transportada']];
const S=[
{t:'1. Información de la madera',f:[['fecha','Fecha de compra','date'],['proc','Procedencia'],['tipo','Tipo de madera'],['cant','Cantidad de madera','number'],['uni','Unidad de medida','sel','tonelada,pulgada'],['pton','Precio por tonelada','number'],['ppul','Precio por pulgada','number'],['vm','Valor total de la madera','calc']]},
{t:'2. Información del camión',f:[['camion','Número / identificación'],['placa','Placa'],['cond','Propietario o conductor'],['cotero','Cotero (quien carga)'],['viajes','Cantidad de viajes','number'],['pviaje','Precio de cargue por viaje','number'],['cargue','Valor total del cargue','calc']]},
{t:'3. Pago al dueño de la madera',f:[['dueno','Nombre del dueño'],['cantD','Cantidad comprada (vacía = la del paso 1)','number'],['precD','Precio pactado (vacío = precio del paso 1)','number'],['vd','Valor total de la madera','calc'],['tpago','Tipo de pago','sel','anticipo,pago parcial,cancelación'],['antD','Valor del anticipo','number'],['fantD','Fecha del anticipo','date'],['parD','Pago parcial','number'],['canD','Valor de la cancelación','number'],['fcanD','Fecha de cancelación','date'],['pendD','Saldo pendiente','calc'],['stD','Estado del pago','calc']]},
...P.map(([x,t,r,v])=>({t,f:[['n'+x,'Nombre del '+r.toLowerCase()],['c'+x,'Cantidad de madera '+v,'number'],['p'+x,'Precio pagado al '+r.toLowerCase(),'number'],['t'+x,'Valor total a pagar','calc'],['a'+x,'Anticipo','number'],['f'+x,'Pago final / cancelación','number'],['s'+x,'Saldo pendiente','calc'],['e'+x,'Estado del pago','calc']]}))];
const stt=(tot,pag)=>tot<=0&&pag<=0?'pendiente':pag<=0?'pendiente':pag>=tot?'cancelado':'parcial';
function calc(o){
 const up=o.uni=='pulgada'?n(o.ppul):n(o.pton),c={};
 c.vm=n(o.cant)*up;
 const cd=n(o.cantD)||n(o.cant),pd=n(o.precD)||up;c.vd=cd*pd;
 c.pagD=n(o.antD)+n(o.parD)+n(o.canD);c.pendD=c.vd-c.pagD;c.stD=stt(c.vd,c.pagD);
 c.cargue=n(o.viajes)*n(o.pviaje);
 let ant=n(o.antD),can=n(o.canD)+n(o.parD),costo=c.vd+c.cargue,sal=c.pendD;
 P.forEach(([x])=>{const t=n(o['c'+x])*n(o['p'+x]),pg=n(o['a'+x])+n(o['f'+x]);
  c['t'+x]=t;c['pg'+x]=pg;c['s'+x]=t-pg;c['e'+x]=stt(t,pg);ant+=n(o['a'+x]);can+=n(o['f'+x]);costo+=t;sal+=t-pg});
 c.ant=ant;c.can=can;c.costo=costo;c.saldo=sal;c.pagado=c.pagD+c.cargue+c.pgA+c.pgB+c.pgR;
 c.cantRef=n(o.cant);return c}
const ICON=['🌲','🚚','👤','🪚','🔨','🐴'],DESC=['Datos de la compra: de dónde viene, qué tipo es y cuánto vale.','Camión que movilizó la madera y lo pagado por cargarla.','Lo que se le debe y se le ha pagado al dueño de la madera.','Persona que asierra la madera y su pago.','Persona que trabaja los bolillos y su pago.','Persona que transporta la madera con animales y su pago.'];
const money=new Set(['vm','vd','pendD','cargue','tA','tB','tR','sA','sB','sR']);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2600)}
let cloud=null;
function persist(o){const i=db.findIndex(x=>x.id==o.id);i>=0?db[i]=o:db.push(o);save();if(cloud)cloud.set(o)}
function removeOp(id){db=db.filter(x=>x.id!=id);save();if(cloud)cloud.del(id)}
// ---------- formulario
$('#secs').innerHTML=S.map((s,i)=>`<details class="card sec" open><summary>${ICON[i]} ${s.t}</summary><p class="hint">${DESC[i]}</p><div class="g">${s.f.map(([k,l,t,o])=>{
 if(t=='calc')return`<label>${l}<output id="o_${k}">-</output></label>`;
 if(t=='sel')return`<label>${l}<select name="${k}">${o.split(',').map(v=>`<option>${v}</option>`).join('')}</select></label>`;
 return`<label>${l}<input name="${k}" type="${t||'text'}" ${t=='number'?'min="0" step="any" inputmode="decimal" placeholder="0"':''}></label>`}).join('')}</div></details>`).join('');
let cur=null;
const form=()=>{const o={};new FormData($('#fm')).forEach((v,k)=>o[k]=v);return o};
function upd(){const o=form(),c=calc(o);
 Object.keys(c).forEach(k=>{const e=$('#o_'+k);if(!e)return;
  e.innerHTML=k[0]=='e'||k=='stD'?bd(c[k]):fmt(c[k])});
 const R=[['Valor total de compra de la madera',c.vd],['Total pagado al dueño',c.pagD],['Total pendiente al dueño',c.pendD],['Total pagado por cargue',c.cargue],['Total pagado al aserrador',c.pgA],['Total pagado al bolillero',c.pgB],['Total pagado al arriero',c.pgR],['Total de anticipos',c.ant],['Total de cancelaciones/pagos finales',c.can],['COSTO TOTAL DE LA OPERACIÓN',c.costo],['SALDO PENDIENTE TOTAL',c.saldo]];
 $('#bt').textContent=fmt(c.costo);$('#bs').textContent=fmt(c.saldo);
 $('#rs').innerHTML=R.map(([l,v])=>`<div><small>${l}</small><b>${fmt(v)}</b></div>`).join('')}
$('#fm').addEventListener('input',upd);
function load(r){cur=r?r.id:null;$('#fm').reset();
 const o=r||{fecha:new Date().toISOString().slice(0,10)};
 Object.keys(o).forEach(k=>{const e=$('#fm').elements[k];if(e&&k!='id')e.value=o[k]});
 $('#dl').classList.toggle('hide',!r);$('#ft').textContent=r?'✏️ Editando operación':'➕ Nueva operación';upd()}
$('#sv').onclick=()=>{const o=form();
 if(!o.fecha||!o.dueno){toast('⚠ Falta la fecha de compra o el nombre del dueño de la madera');return}
 o.id=cur||Date.now();persist(o);toast('✔ Operación guardada');load(null);tab(1)};
$('#nw').onclick=()=>load(null);
$('#dl').onclick=()=>{if(confirm('¿Seguro que desea eliminar esta operación? No se puede deshacer.')){removeOp(cur);load(null);tab(1)}};
// ---------- filtros / reporte
const FL=[['d1','Fecha desde','date'],['d2','Fecha hasta','date'],['proc','Procedencia'],['dueno','Dueño de la madera'],['placa','Placa del camión'],['nA','Aserrador'],['nB','Bolillero'],['nR','Arriero'],['est','Estado de los pagos','sel','todos,pendiente,parcial,cancelado'],['ant','Anticipos','sel','todos,con anticipos,sin anticipos'],['can','Cancelaciones','sel','todos,con cancelaciones,sin cancelaciones']];
$('#flt').innerHTML=FL.map(([k,l,t,o])=>t=='sel'?`<label>${l}<select id="f_${k}">${o.split(',').map(v=>`<option>${v}</option>`).join('')}</select></label>`:`<label>${l}<input id="f_${k}" type="${t||'text'}"></label>`).join('');
$('#flt').addEventListener('input',render);
$('#clr').onclick=()=>{FL.forEach(([k,,t])=>$('#f_'+k).selectedIndex!==undefined&&t=='sel'?$('#f_'+k).selectedIndex=0:$('#f_'+k).value='');render()};
const has=(a,b)=>String(a||'').toLowerCase().includes(String(b).toLowerCase());
function rows(){const v=k=>$('#f_'+k).value.trim();
 return db.map(o=>({o,c:calc(o)})).filter(({o,c})=>{
  if(v('d1')&&o.fecha<v('d1'))return false;if(v('d2')&&o.fecha>v('d2'))return false;
  for(const k of['proc','dueno','placa','nA','nB','nR'])if(v(k)&&!has(o[k],v(k)))return false;
  if(v('est')!='todos'&&![c.stD,c.eA,c.eB,c.eR].some((e,i)=>e==v('est')&&[c.vd,c.tA,c.tB,c.tR][i]>0))return false;
  if(v('ant')=='con anticipos'&&c.ant<=0)return false;if(v('ant')=='sin anticipos'&&c.ant>0)return false;
  if(v('can')=='con cancelaciones'&&c.can<=0)return false;if(v('can')=='sin cancelaciones'&&c.can>0)return false;
  return true}).sort((a,b)=>(b.o.fecha||'').localeCompare(a.o.fecha||''))}
const bd=s=>`<span class="st ${s}">${{cancelado:'✔ Pagado',parcial:'◐ Parcial',pendiente:'● Pendiente'}[s]}</span>`;
function render(){const R=rows(),T={q:0,vd:0,cargue:0,tA:0,tB:0,tR:0,costo:0,pagado:0,saldo:0,pagD:0,pendD:0,ant:0,can:0};
 R.forEach(({o,c})=>{T.q+=c.cantRef;['vd','cargue','tA','tB','tR','costo','pagado','saldo','pagD','pendD','ant','can'].forEach(k=>T[k]+=c[k])});
 $('#kp').innerHTML=[['Operaciones',R.length,1],['Cantidad de madera',T.q.toLocaleString('es-CO'),1],['Compra de madera',T.vd],['Pagado al dueño',T.pagD],['Pendiente al dueño',T.pendD],['Cargue',T.cargue],['Aserrador',T.tA],['Bolillero',T.tB],['Arriero',T.tR],['Anticipos',T.ant],['Cancelaciones',T.can],['Total pagado',T.pagado],['Costo total',T.costo],['Saldo pendiente',T.saldo]].map(([l,v,r])=>`<div><small>${l}</small><b>${r?v:fmt(v)}</b></div>`).join('');
 const H=['Fecha','Procedencia','Tipo','Cantidad','Dueño','Placa','Compra','Cargue','Aserrador','Bolillero','Arriero','Costo total','Pagado','Saldo','Estado dueño','Aser.','Bol.','Arr.'];
 $('#tb').innerHTML=`<thead><tr>${H.map((h,i)=>`<th class="${i>2&&i!=4&&i!=5&&i<14?'r':''}">${h}</th>`).join('')}</tr></thead><tbody>`+
 (R.length?R.map(({o,c})=>`<tr class="cl" data-id="${o.id}"><td>${o.fecha||''}</td><td>${o.proc||''}</td><td>${o.tipo||''}</td><td class="r">${o.cant||0} ${o.uni=='pulgada'?'pulg.':'ton.'}</td><td>${o.dueno||''}</td><td>${o.placa||''}</td><td class="r">${fmt(c.vd)}</td><td class="r">${fmt(c.cargue)}</td><td class="r">${fmt(c.tA)}</td><td class="r">${fmt(c.tB)}</td><td class="r">${fmt(c.tR)}</td><td class="r"><b>${fmt(c.costo)}</b></td><td class="r">${fmt(c.pagado)}</td><td class="r">${fmt(c.saldo)}</td><td>${bd(c.stD)}</td><td>${bd(c.eA)}</td><td>${bd(c.eB)}</td><td>${bd(c.eR)}</td></tr>`).join(''):`<tr><td colspan="18" class="empty">Todavía no hay operaciones que mostrar.<br>Toque «➕ Nueva operación» para registrar la primera.</td></tr>`)+
 `</tbody><tfoot><tr><td colspan="6">TOTALES</td><td class="r">${fmt(T.vd)}</td><td class="r">${fmt(T.cargue)}</td><td class="r">${fmt(T.tA)}</td><td class="r">${fmt(T.tB)}</td><td class="r">${fmt(T.tR)}</td><td class="r">${fmt(T.costo)}</td><td class="r">${fmt(T.pagado)}</td><td class="r">${fmt(T.saldo)}</td><td colspan="4"></td></tr></tfoot>`;
 $('#tb').querySelectorAll('tbody tr.cl').forEach(tr=>[...tr.children].forEach((td,i)=>td.dataset.label=H[i]));
 $('#cnt').textContent=db.length+' operaciones almacenadas.'}
$('#tb').onclick=e=>{const r=e.target.closest('tr.cl');if(!r)return;load(db.find(x=>x.id==r.dataset.id));tab(2)};
// ---------- exportar
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()};
$('#csv').onclick=()=>{const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const H=['Fecha','Procedencia','Tipo','Cantidad','Unidad','Dueño','Placa','Conductor','Cotero','Viajes','Aserrador','Bolillero','Arriero','Compra','Pagado dueño','Pendiente dueño','Cargue','Total aserrador','Total bolillero','Total arriero','Anticipos','Cancelaciones','Costo total','Total pagado','Saldo pendiente','Estado dueño','Estado aserrador','Estado bolillero','Estado arriero'];
 const L=rows().map(({o,c})=>[o.fecha,o.proc,o.tipo,o.cant,o.uni,o.dueno,o.placa,o.cond,o.cotero,o.viajes,o.nA,o.nB,o.nR,c.vd,c.pagD,c.pendD,c.cargue,c.tA,c.tB,c.tR,c.ant,c.can,c.costo,c.pagado,c.saldo,c.stD,c.eA,c.eB,c.eR].map(q).join(','));
 dl('reporte_madera.csv','\ufeff'+[H.map(q).join(','),...L].join('\n'),'text/csv')};
$('#ex').onclick=()=>dl('respaldo_madera_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(db,null,1),'application/json');
$('#im').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d))throw 0;
  if(confirm('Se importarán '+d.length+' operaciones. Aceptar = combinar con las existentes; (se reemplazan las de igual ID).')){
   const m=new Map(db.map(x=>[x.id,x]));d.forEach(x=>m.set(x.id,x));db=[...m.values()];save();if(cloud)db.forEach(cloud.set);render();toast('✔ Importación completa')}}
  catch(_){alert('Archivo de respaldo no válido')}};r.readAsText(f);e.target.value=''};
// ---------- pestañas
function tab(i){[1,2,3].forEach(k=>{$('#v'+k).classList.toggle('hide',k!=i);$('#t'+k).classList.toggle('on',k==i)});if(i==1)render();if(i==3)render();scrollTo(0,0)}
[1,2,3].forEach(k=>$('#t'+k).onclick=()=>{if(k==2)load(null);tab(k)});
const gate=ok=>{$('nav').classList.toggle('hide',!ok);$('#v0').classList.toggle('hide',ok);if(ok)tab(1);else[1,2,3].forEach(k=>$('#v'+k).classList.add('hide'))};
async function initCloud(){
 const B='https://www.gstatic.com/firebasejs/10.12.2/';
 const [A,Au,Fs]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
 const app=A.initializeApp(FIREBASE_CONFIG),auth=Au.getAuth(app),fs=Fs.initializeFirestore(app,{localCache:Fs.persistentLocalCache()}),col=Fs.collection(fs,'operaciones');
 const err=e=>alert('Error con la nube: '+e.message);
 cloud={set:o=>Fs.setDoc(Fs.doc(col,String(o.id)),o).catch(err),del:id=>Fs.deleteDoc(Fs.doc(col,String(id))).catch(err)};
 const login=()=>Au.signInWithEmailAndPassword(auth,$('#em').value.trim(),$('#pw').value).then(()=>{$('#lerr').textContent='';$('#pw').value=''}).catch(()=>$('#lerr').textContent='Correo o contraseña incorrectos');
 $('#lg').onclick=login;$('#pw').onkeydown=e=>e.key=='Enter'&&login();
 $('#so').onclick=()=>Au.signOut(auth);$('#so').classList.remove('hide');
 let un=null,first=true;
 Au.onAuthStateChanged(auth,u=>{
  if(!u){gate(false);if(un)un();un=null;first=true;return}
  $('#us').textContent='☁ '+u.email;gate(true);
  un=Fs.onSnapshot(col,s=>{let d=s.docs.map(x=>x.data());
   if(first&&!s.metadata.fromCache){first=false;const ids=new Set(d.map(x=>String(x.id))),pend=db.filter(x=>!ids.has(String(x.id)));
    if(pend.length&&confirm('Hay '+pend.length+' operaciones guardadas solo en este navegador. ¿Subirlas a la nube?')){pend.forEach(cloud.set);d=d.concat(pend)}}
   db=d;save();render()},err)})}
if(FIREBASE_CONFIG.apiKey){load(null);gate(false);initCloud().catch(e=>{$('#lerr').textContent='No se pudo conectar con Firebase: '+e.message})}
else{$('#us').textContent='Modo local (sin nube)';load(null);tab(1)}
