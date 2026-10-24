const K='madera_v1',$=s=>document.querySelector(s),n=v=>parseFloat(v)||0;
const fmt=v=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v||0);
let db=[];try{db=JSON.parse(localStorage.getItem(K))||[]}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){alert('No se pudo guardar en el navegador')}};
const qa=s=>String(s).replace(/"/g,'&quot;');
// cuentas bancarias (se crean estas la primera vez; se pueden agregar más desde la página Bancos)
const KB='madera_bancos_v1';let bk=[];try{bk=JSON.parse(localStorage.getItem(KB))||[]}catch(e){}
if(!bk.length)bk=[['gloria-bancolombia','Gloria','Bancolombia'],['gloria-bogota','Gloria','Banco de Bogotá'],['gicel-bancolombia','Gicel','Bancolombia'],['jairo-bancolombia','Jairo','Bancolombia']].map(([id,titular,banco])=>({id,titular,banco,ini:0,movs:[]}));
const saveB=()=>{try{localStorage.setItem(KB,JSON.stringify(bk))}catch(e){}};saveB();
const bn=k=>k.titular+' · '+k.banco,bopts=v=>'<option value="">Sin banco / efectivo</option>'+bk.map(k=>`<option value="${qa(k.id)}"${k.id==v?' selected':''}>${bn(k)}</option>`).join('');
function refreshBanks(){document.querySelectorAll('select[data-bank]').forEach(e=>{const v=e.value;e.innerHTML=bopts(v);e.value=v})}
const TW=['Bolillero','Aserrador','Cotero','Arriero','Motorista','Transportador'],TI={Bolillero:'🔨',Aserrador:'🪚',Cotero:'📦',Arriero:'🐴',Motorista:'🚛',Transportador:'🚚'},TV={Bolillero:'trabajada',Aserrador:'trabajada',Cotero:'cargada',Arriero:'transportada',Motorista:'transportada',Transportador:'transportada'};
// compras antiguas guardaban aserrador/bolillero/arriero en campos fijos: se convierten solas a la lista de trabajadores
const trabs=o=>Array.isArray(o.trab)?o.trab:[['A','Aserrador'],['B','Bolillero'],['R','Arriero']].filter(([x])=>o['n'+x]||n(o['c'+x])||n(o['p'+x])||n(o['a'+x])||n(o['f'+x])).map(([x,t])=>({t,n:o['n'+x]||'',c:o['c'+x],p:o['p'+x],a:o['a'+x],f:o['f'+x],ad:'',ab:'',fd:'',fb:''}));
const wn=(o,ts)=>trabs(o).filter(w=>ts.includes(w.t)).map(w=>w.n||'').join(' ');
const OTR=['Cotero','Motorista','Transportador'];
const S=[
{t:'1. Información de la madera',f:[['fecha','Fecha de compra','date'],['proc','Procedencia'],['tipo','Tipo de madera'],['cant','Cantidad de madera','number'],['uni','Unidad de medida','sel','tonelada,pulgada,m³'],['pton','Precio por tonelada','number'],['ppul','Precio por pulgada','number'],['pm3','Precio por m³','number'],['vm','Valor total de la madera','calc']]},
{t:'2. Información del camión',f:[['camion','Número / identificación'],['placa','Placa'],['cond','Propietario o conductor'],['cotero','Cotero (quien carga)'],['pcF','Cargue pagado a la finca (por unidad de madera)','number'],['pcC','Cargue pagado al cotero (por unidad de madera)','number'],['viajes','Viajes del camión (cada viaje descuenta del anticipo)','list','➕ Agregar viaje'],['qTrans','Madera transportada (suma de viajes)','calc'],['cargueF','Cargue a la finca','calc'],['cargueC','Cargue al cotero','calc'],['cargue','Valor total del cargue','calc'],['bCargue','Banco con el que se pagó el cargue','bank']]},
{t:'3. Anticipo al dueño de la finca',f:[['dueno','Nombre del dueño de la finca'],['cantD','Cantidad comprada (la del paso 1)','calc'],['precD','Precio pactado por unidad (vacío = el del paso 1)','number'],['vd','Valor total de la madera','calc'],['antis','Anticipos entregados (agregue más si el anticipo está bajo)','list','➕ Agregar anticipo (inyectar dinero)'],['pagD','Total de anticipos','calc'],['valTrans','Descontado por los viajes','calc'],['saldoAnt','Saldo del anticipo (a favor / en contra)','calc'],['stD','Estado del anticipo','calc'],['mov','Movimientos del anticipo','led']]},
];
const UL={tonelada:'ton.',pulgada:'pulg.','m³':'m³'},today=()=>new Date().toISOString().slice(0,10);
const stt=(tot,pag)=>tot<=0&&pag<=0?'pendiente':pag<=0?'pendiente':pag>=tot?'cancelado':'parcial';
function calc(o){
 const up=o.uni=='pulgada'?n(o.ppul):o.uni=='m³'?n(o.pm3):n(o.pton),c={};
 c.vm=n(o.cant)*up;c.cantD=n(o.cant);
 const pd=n(o.precD)||up,AN=o.antis||[],VJ=o.viajes||[];c.pd=pd;c.vd=n(o.cant)*pd;
 c.qTrans=VJ.reduce((a,x)=>a+n(x.c),0);c.valTrans=c.qTrans*pd;
 c.pagD=AN.reduce((a,x)=>a+n(x.v),0);c.saldoAnt=c.pagD-c.valTrans;c.pendD=Math.max(0,-c.saldoAnt);
 c.stD=c.pagD<=0&&c.valTrans<=0?'':c.saldoAnt<0?'pendiente':c.saldoAnt<=c.pagD*.2?'parcial':'cancelado';
 c.cargueF=c.qTrans*n(o.pcF);c.cargueC=c.qTrans*n(o.pcC);c.cargue=c.cargueF+c.cargueC;
 c.mov=[...AN.map(x=>({f:x.f||'',t:'Anticipo recibido',v:n(x.v)})),...VJ.map(x=>({f:x.f||'',t:'Viaje de '+n(x.c)+' '+(UL[o.uni]||''),v:-n(x.c)*pd}))].filter(x=>x.v).sort((a,b)=>(a.f||'9').localeCompare(b.f||'9')||b.v-a.v);
 let s=0;c.mov.forEach(x=>x.s=s+=x.v);
 const TR=trabs(o).map(w=>{const t=n(w.c)*n(w.p),pg=n(w.a)+n(w.f);return{...w,tot:t,pg,s:t-pg,e:stt(t,pg)}});c.TR=TR;
 let ant=c.pagD,can=0,costo=c.vd+c.cargue,sal=c.pendD;
 TR.forEach(w=>{ant+=n(w.a);can+=n(w.f);costo+=w.tot;sal+=w.s});
 [['A',['Aserrador']],['B',['Bolillero']],['R',['Arriero']],['O',OTR]].forEach(([x,ts])=>{const L=TR.filter(w=>ts.includes(w.t)),t=L.reduce((a,w)=>a+w.tot,0),pg=L.reduce((a,w)=>a+w.pg,0);c['t'+x]=t;c['pg'+x]=pg;c['s'+x]=t-pg;c['e'+x]=stt(t,pg)});
 c.ant=ant;c.can=can;c.costo=costo;c.saldo=sal;c.pagado=c.pagD+c.cargue+c.pgA+c.pgB+c.pgR+c.pgO;
 c.cantRef=n(o.cant);return c}
const ICON=['🌲','🚚','👤','🪚','🔨','🐴'],DESC=['Datos de la compra: de dónde viene, qué tipo es y cuánto vale.','Camión, viajes y cargue pagado a la finca y al cotero. El cargue se calcula por cantidad de madera.','El dueño recibe anticipos y cada viaje los va descontando. Si el anticipo baja, puede agregar más dinero.','Persona que asierra la madera y su pago.','Persona que trabaja los bolillos y su pago.','Persona que transporta la madera con animales y su pago.'];
const money=new Set(['vm','vd','pendD','cargue','tA','tB','tR','sA','sB','sR']);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2600)}
const KV='madera_ventas_v1';let vt=[];try{vt=JSON.parse(localStorage.getItem(KV))||[]}catch(e){}
const saveV=()=>{try{localStorage.setItem(KV,JSON.stringify(vt))}catch(e){}};
const KP='madera_prestamos_v1';let pr=[];try{pr=JSON.parse(localStorage.getItem(KP))||[]}catch(e){}
const savePr=()=>{try{localStorage.setItem(KP,JSON.stringify(pr))}catch(e){}};
let cloud=null;
function persist(o){const i=db.findIndex(x=>x.id==o.id);i>=0?db[i]=o:db.push(o);save();if(cloud)cloud.set(o)}
function removeOp(id){db=db.filter(x=>x.id!=id);save();if(cloud)cloud.del(id)}
// ---------- formulario
const LF={antis:[['f','Fecha','date'],['v','Valor entregado','number'],['b','Banco que pagó','bank']],viajes:[['f','Fecha del viaje','date'],['c','Cantidad de madera del viaje','number']]};
const rowH=(k,r)=>`<div class="lr">${LF[k].map(([f,l,t])=>t=='bank'?`<label class="lc"><small>${l}</small><select data-f="${f}" data-bank>${bopts(r[f])}</select></label>`:`<label class="lc"><small>${l}</small><input data-f="${f}" type="${t}" value="${r[f]??''}" ${t=='number'?'min="0" step="any" inputmode="decimal" placeholder="0"':''}></label>`).join('')}<span class="lv"></span><button type="button" class="x" title="Quitar">✕</button></div>`;
const lst=k=>[...document.querySelectorAll('#l_'+k+' .lr')].map(d=>{const o={};d.querySelectorAll('input,select').forEach(i=>o[i.dataset.f]=i.value);return o});
const setLst=(k,a)=>{$('#l_'+k).innerHTML=a.map(r=>rowH(k,r)).join('')};
const LW=(k,l,b)=>`<div class="lw"><b>${l}</b><div id="l_${k}"></div><button type="button" class="b s" data-add="${k}">${b}</button></div>`;
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(a){$('#l_'+a.dataset.add).insertAdjacentHTML('beforeend',rowH(a.dataset.add,{f:today()}));upd();return}
 const x=e.target.closest('.lr .x');if(x){x.closest('.lr').remove();upd();return}
 const wx=e.target.closest('.wc .wx');if(wx){wx.closest('.wc').remove();upd();return}
 const tw=e.target.closest('[data-tw]');if(tw){const d=addW(tw.dataset.tw);$('#addw').open=false;d.scrollIntoView({behavior:'smooth',block:'center'});const i=d.querySelector('[data-f=n]');if(i)i.focus({preventScroll:true})}});
$('#secs').innerHTML=S.map((s,i)=>`<details class="card sec" open><summary>${ICON[i]} ${s.t}</summary><p class="hint">${DESC[i]}</p><div class="g">${s.f.map(([k,l,t,o])=>{
 if(t=='bank')return`<label>${l}<select name="${k}" data-bank>${bopts()}</select></label>`;if(t=='calc')return`<label>${l}<output id="o_${k}">-</output></label>`;if(t=='list')return LW(k,l,o);if(t=='led')return`<div class="lw"><b>${l}</b><div id="o_${k}"></div></div>`;
 if(t=='sel')return`<label>${l}<select name="${k}">${o.split(',').map(v=>`<option>${v}</option>`).join('')}</select></label>`;
 return`<label>${l}<input name="${k}" type="${t||'text'}" ${t=='number'?'min="0" step="any" inputmode="decimal" placeholder="0"':''}></label>`}).join('')}</div></details>`).join('')+`<details class="card sec" open><summary>👷 4. Trabajadores</summary><p class="hint">Agregue los trabajadores uno por uno, del tipo que necesite. Cada uno tiene su pago, su banco y su saldo.</p><div id="trabs"></div><details class="addw" id="addw"><summary>➕ Agregar trabajador</summary><div class="menu">${TW.map(t=>`<button type="button" class="b s" data-tw="${t}">${TI[t]} ${t}</button>`).join('')}</div></details></details>`;
const wcH=w=>{const t=w.t,tl=t.toLowerCase(),I=(f,l,ty)=>`<label>${l}<input data-f="${f}" type="${ty||'text'}" ${ty=='number'?'min="0" step="any" inputmode="decimal" placeholder="0"':''}></label>`,B=(f,l)=>`<label>${l}<select data-f="${f}" data-bank>${bopts()}</select></label>`;
 return`<div class="wc card" data-t="${t}"><div class="wh"><b>${TI[t]} ${t}</b><button type="button" class="x wx" title="Quitar este trabajador">✕</button></div><div class="g">${I('n','Nombre del '+tl)}${I('c','Cantidad de madera '+TV[t],'number')}${I('p','Precio pagado al '+tl,'number')}<label>Valor total a pagar<output data-o="tot">-</output></label>${I('a','Anticipo','number')}${I('ad','Fecha del anticipo','date')}${B('ab','Banco del anticipo')}${I('f','Pago final / cancelación','number')}${I('fd','Fecha del pago final','date')}${B('fb','Banco del pago final')}<label>Saldo pendiente<output data-o="s">-</output></label><label>Estado del pago<output data-o="e">-</output></label></div></div>`};
const wlst=()=>[...document.querySelectorAll('#trabs .wc')].map(d=>{const w={t:d.dataset.t};d.querySelectorAll('[data-f]').forEach(e=>w[e.dataset.f]=e.value);return w});
function setTrabs(a){$('#trabs').innerHTML=a.map(wcH).join('');document.querySelectorAll('#trabs .wc').forEach((d,i)=>d.querySelectorAll('[data-f]').forEach(e=>e.value=a[i][e.dataset.f]??''))}
function addW(t){$('#trabs').insertAdjacentHTML('beforeend',wcH({t}));const d=$('#trabs').lastElementChild;d.querySelector('[data-f=ad]').value=d.querySelector('[data-f=fd]').value=today();upd();return d}
let cur=null;
const form=()=>{const o={};new FormData($('#fm')).forEach((v,k)=>o[k]=v);o.antis=lst('antis');o.viajes=lst('viajes');o.trab=wlst();return o};
function upd(){const o=form(),c=calc(o);
 Object.keys(c).forEach(k=>{const e=$('#o_'+k);if(!e)return;
  e.innerHTML=k=='stD'?bdo(c[k]):k[0]=='e'?bd(c[k]):k=='cantD'||k=='qTrans'?c[k]+' '+(UL[o.uni]||''):k=='saldoAnt'?fmt(Math.abs(c[k]))+(c[k]<0?' en contra (se le debe)':c[k]>0?' a favor':''):k=='mov'?'':fmt(c[k])});
 $('#o_mov').innerHTML=c.mov.length?`<div class="tw"><table class="mv"><thead><tr><th>Fecha</th><th>Movimiento</th><th class="r">Valor</th><th class="r">Saldo del anticipo</th></tr></thead><tbody>${c.mov.map(x=>`<tr><td>${x.f}</td><td>${x.t}</td><td class="r ${x.v<0?'dn':'up'}">${fmt(x.v)}</td><td class="r"><b class="${x.s<0?'dn':''}">${fmt(x.s)}</b></td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Aquí verá cómo baja el anticipo con cada viaje.</p>';
 document.querySelectorAll('#l_viajes .lr').forEach(d=>{const q=n(d.querySelector('[data-f=c]').value);d.querySelector('.lv').textContent=q?'Descuenta '+fmt(q*c.pd)+' · cargue '+fmt(q*(n(o.pcF)+n(o.pcC))):''});
 const R=[['Valor total de compra de la madera',c.vd],['Total de anticipos entregados',c.pagD],['Anticipo a favor (con el dueño)',Math.max(0,c.saldoAnt)],['Pendiente al dueño (anticipo en contra)',c.pendD],['Total pagado por cargue',c.cargue],['Total pagado a aserradores',c.pgA],['Total pagado a bolilleros',c.pgB],['Total pagado a arrieros',c.pgR],['Total pagado a cotero, motorista y transportador',c.pgO],['Total de anticipos',c.ant],['Total de cancelaciones/pagos finales',c.can],['COSTO TOTAL DE LA OPERACIÓN',c.costo],['SALDO PENDIENTE TOTAL',c.saldo]];
 document.querySelectorAll('#trabs .wc').forEach((d,i)=>{const w=c.TR[i];if(!w)return;d.querySelector('[data-o=tot]').textContent=fmt(w.tot);d.querySelector('[data-o=s]').textContent=fmt(w.s);d.querySelector('[data-o=e]').innerHTML=bd(w.e)});
 $('#bt').textContent=fmt(c.costo);$('#bs').textContent=fmt(c.saldo);
 $('#rs').innerHTML=R.map(([l,v])=>`<div><small>${l}</small><b>${fmt(v)}</b></div>`).join('')}
$('#fm').addEventListener('input',upd);
function load(r){cur=r?r.id:null;$('#fm').reset();
 const o=r||{fecha:new Date().toISOString().slice(0,10)};
 Object.keys(o).forEach(k=>{const e=$('#fm').elements[k];if(e&&k!='id')e.value=o[k]});
 setLst('antis',o.antis||[]);setLst('viajes',o.viajes||[]);setTrabs(trabs(o));$('#dl').classList.toggle('hide',!r);$('#ft').textContent=r?'✏️ Editando operación':'➕ Nueva compra';upd()}
$('#sv').onclick=()=>{const o=form();
 if(!o.fecha||!o.dueno){toast('⚠ Falta la fecha de compra o el nombre del dueño de la madera');return}
 o.id=cur||Date.now();persist(o);toast('✔ Operación guardada');load(null);tab(1)};
$('#nw').onclick=()=>load(null);
$('#dl').onclick=()=>{if(confirm('¿Seguro que desea eliminar esta operación? No se puede deshacer.')){removeOp(cur);load(null);tab(1)}};
// ---------- filtros / reporte
const FL=[['d1','Fecha desde','date'],['d2','Fecha hasta','date'],['proc','Procedencia'],['dueno','Dueño de la madera'],['placa','Placa del camión'],['nA','Aserrador'],['nB','Bolillero'],['nR','Arriero'],['nT','Cotero, motorista o transportador'],['est','Estado de los pagos','sel','todos,con saldo pendiente,pendiente,parcial,cancelado'],['ant','Anticipos','sel','todos,con anticipos,sin anticipos'],['can','Cancelaciones','sel','todos,con cancelaciones,sin cancelaciones']];
$('#flt').innerHTML=FL.map(([k,l,t,o])=>t=='sel'?`<label>${l}<select id="f_${k}">${o.split(',').map(v=>`<option>${v}</option>`).join('')}</select></label>`:`<label>${l}<input id="f_${k}" type="${t||'text'}"></label>`).join('');
$('#flt').addEventListener('input',render);
$('#clr').onclick=()=>{FL.forEach(([k,,t])=>$('#f_'+k).selectedIndex!==undefined&&t=='sel'?$('#f_'+k).selectedIndex=0:$('#f_'+k).value='');render()};
const has=(a,b)=>String(a||'').toLowerCase().includes(String(b).toLowerCase());
function rows(){const v=k=>$('#f_'+k).value.trim();
 return db.map(o=>({o,c:calc(o)})).filter(({o,c})=>{
  if(v('d1')&&o.fecha<v('d1'))return false;if(v('d2')&&o.fecha>v('d2'))return false;
  for(const k of['proc','dueno','placa'])if(v(k)&&!has(o[k],v(k)))return false;
  for(const [k,ts] of [['nA',['Aserrador']],['nB',['Bolillero']],['nR',['Arriero']],['nT',OTR]])if(v(k)&&!has(wn(o,ts),v(k)))return false;
  if(v('est')=='con saldo pendiente'?c.saldo<=0:v('est')!='todos'&&![c.stD,c.eA,c.eB,c.eR,c.eO].some((e,i)=>e==v('est')&&[c.vd,c.tA,c.tB,c.tR,c.tO][i]>0))return false;
  if(v('ant')=='con anticipos'&&c.ant<=0)return false;if(v('ant')=='sin anticipos'&&c.ant>0)return false;
  if(v('can')=='con cancelaciones'&&c.can<=0)return false;if(v('can')=='sin cancelaciones'&&c.can>0)return false;
  return true}).sort((a,b)=>(b.o.fecha||'').localeCompare(a.o.fecha||''))}
const bdo=s=>s?`<span class="st ${s}">${{cancelado:'✔ Anticipo disponible',parcial:'⚠ Anticipo bajo',pendiente:'● En contra (se le debe)'}[s]}</span>`:'<span class="note">Sin movimientos</span>';
const bd=s=>`<span class="st ${s}">${{cancelado:'✔ Pagado',parcial:'◐ Parcial',pendiente:'● Pendiente'}[s]}</span>`;
function render(){const R=rows(),T={q:0,vd:0,cargue:0,tA:0,tB:0,tR:0,tO:0,costo:0,pagado:0,saldo:0,pagD:0,pendD:0,ant:0,can:0};
 R.forEach(({o,c})=>{T.q+=c.cantRef;['vd','cargue','tA','tB','tR','tO','costo','pagado','saldo','pagD','pendD','ant','can'].forEach(k=>T[k]+=c[k])});
 $('#kp').innerHTML=[['Operaciones',R.length,1],['Cantidad de madera',T.q.toLocaleString('es-CO'),1],['Compra de madera',T.vd],['Pagado al dueño',T.pagD],['Pendiente al dueño',T.pendD],['Cargue',T.cargue],['Aserrador',T.tA],['Bolillero',T.tB],['Arriero',T.tR],['Cotero, motorista y transportador',T.tO],['Anticipos',T.ant],['Cancelaciones',T.can],['Total pagado',T.pagado],['Costo total',T.costo],['Saldo pendiente',T.saldo]].map(([l,v,r])=>`<div><small>${l}</small><b>${r?v:fmt(v)}</b></div>`).join('');
 const H=['Fecha','Procedencia','Tipo','Cantidad','Dueño','Placa','Compra','Cargue','Aserrador','Bolillero','Arriero','Otros trab.','Costo total','Pagado','Saldo','Estado dueño','Aser.','Bol.','Arr.','Otros'];
 $('#tb').innerHTML=`<thead><tr>${H.map((h,i)=>`<th class="${i>2&&i!=4&&i!=5&&i<15?'r':''}">${h}</th>`).join('')}</tr></thead><tbody>`+
 (R.length?R.map(({o,c})=>`<tr class="cl" data-id="${o.id}"><td>${o.fecha||''}</td><td>${o.proc||''}</td><td>${o.tipo||''}</td><td class="r">${o.cant||0} ${UL[o.uni]||''}</td><td>${o.dueno||''}</td><td>${o.placa||''}</td><td class="r">${fmt(c.vd)}</td><td class="r">${fmt(c.cargue)}</td><td class="r">${fmt(c.tA)}</td><td class="r">${fmt(c.tB)}</td><td class="r">${fmt(c.tR)}</td><td class="r">${fmt(c.tO)}</td><td class="r"><b>${fmt(c.costo)}</b></td><td class="r">${fmt(c.pagado)}</td><td class="r">${fmt(c.saldo)}</td><td>${bdo(c.stD)}</td><td>${bd(c.eA)}</td><td>${bd(c.eB)}</td><td>${bd(c.eR)}</td><td>${bd(c.eO)}</td></tr>`).join(''):`<tr><td colspan="20" class="empty">Todavía no hay operaciones que mostrar.<br>Toque «➕ Nueva compra» para registrar la primera.</td></tr>`)+
 `</tbody><tfoot><tr><td colspan="6">TOTALES</td><td class="r">${fmt(T.vd)}</td><td class="r">${fmt(T.cargue)}</td><td class="r">${fmt(T.tA)}</td><td class="r">${fmt(T.tB)}</td><td class="r">${fmt(T.tR)}</td><td class="r">${fmt(T.tO)}</td><td class="r">${fmt(T.costo)}</td><td class="r">${fmt(T.pagado)}</td><td class="r">${fmt(T.saldo)}</td><td colspan="5"></td></tr></tfoot>`;
 $('#tb').querySelectorAll('tbody tr.cl').forEach(tr=>[...tr.children].forEach((td,i)=>td.dataset.label=H[i]));
 $('#cnt').textContent=db.length+' operaciones almacenadas.';refreshBanks();dash();ppl();vrender();prender();pagos();brender()}
$('#tb').onclick=e=>{const r=e.target.closest('tr.cl');if(!r)return;load(db.find(x=>x.id==r.dataset.id));tab(2)};
// ---------- exportar
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()};
$('#csv').onclick=()=>{const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const H=['Fecha','Procedencia','Tipo','Cantidad','Unidad','Dueño','Placa','Conductor','Cotero (cargue)','Viajes','Aserrador','Bolillero','Arriero','Cotero, motorista o transportador','Compra','Pagado dueño','Pendiente dueño','Cargue','Total aserrador','Total bolillero','Total arriero','Total cotero, motorista y transportador','Anticipos','Cancelaciones','Costo total','Total pagado','Saldo pendiente','Estado dueño','Estado aserrador','Estado bolillero','Estado arriero','Estado otros trabajadores'];
 const L=rows().map(({o,c})=>[o.fecha,o.proc,o.tipo,o.cant,o.uni,o.dueno,o.placa,o.cond,o.cotero,(o.viajes||[]).length,wn(o,['Aserrador']),wn(o,['Bolillero']),wn(o,['Arriero']),trabs(o).filter(w=>OTR.includes(w.t)).map(w=>w.t+': '+(w.n||'')).join('; '),c.vd,c.pagD,c.pendD,c.cargue,c.tA,c.tB,c.tR,c.tO,c.ant,c.can,c.costo,c.pagado,c.saldo,c.stD,c.eA,c.eB,c.eR,c.eO].map(q).join(','));
 dl('reporte_madera.csv','\ufeff'+[H.map(q).join(','),...L].join('\n'),'text/csv')};
$('#ex').onclick=()=>dl('respaldo_madera_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({compras:db,ventas:vt,prestamos:pr,bancos:bk},null,1),'application/json');
$('#im').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{let d=JSON.parse(r.result),dv=[],dp=[],dk=[];if(!Array.isArray(d)){dv=d.ventas||[];dp=d.prestamos||[];dk=d.bancos||[];d=d.compras||[]}
  if(confirm('Se importarán '+d.length+' operaciones. Aceptar = combinar con las existentes; (se reemplazan las de igual ID).')){
   const m=new Map(db.map(x=>[x.id,x]));d.forEach(x=>m.set(x.id,x));db=[...m.values()];save();if(cloud)db.forEach(cloud.set);const mv=new Map(vt.map(x=>[x.id,x]));dv.forEach(x=>mv.set(x.id,x));vt=[...mv.values()];saveV();if(cloud)vt.forEach(cloud.setV);const mp=new Map(pr.map(x=>[x.id,x]));dp.forEach(x=>mp.set(x.id,x));pr=[...mp.values()];savePr();if(cloud)pr.forEach(cloud.setP);const mb=new Map(bk.map(x=>[x.id,x]));dk.forEach(x=>mb.set(x.id,x));bk=[...mb.values()];saveB();if(cloud)bk.forEach(cloud.setB);render();toast('✔ Importación completa')}}
  catch(_){alert('Archivo de respaldo no válido')}};r.readAsText(f);e.target.value=''};
// ---------- ventas (ingresos)
const cv=v=>{const t=n(v.cant)*n(v.precio),s=t-n(v.abono);return{t,s,e:stt(t,n(v.abono))}};
const bdv=s=>`<span class="st ${s}">${{cancelado:'✔ Cobrado',parcial:'◐ Abonó',pendiente:'● Por cobrar'}[s]}</span>`;
const mk=(F,pre,f)=>F.map(([k,l,t,o])=>{const a=f?`id="${pre}${k}"`:`name="${k}"`;
 return t=='bank'?`<label>${l}<select ${a} data-bank>${bopts()}</select></label>`:t=='calc'?`<label>${l}<output id="${pre}${k}">-</output></label>`:t=='sel'?`<label>${l}<select ${a}>${o.split(',').map(v=>`<option>${v}</option>`).join('')}</select></label>`:`<label>${l}<input ${a} type="${t||'text'}" ${t=='number'?'min="0" step="any" inputmode="decimal" placeholder="0"':''}></label>`}).join('');
$('#vg').innerHTML=mk([['fecha','Fecha de venta','date'],['cliente','Cliente (quién compra)'],['prod','Producto','sel','estiba,huacal,tablero,otro'],['det','Medidas o detalle'],['cant','Cantidad vendida','number'],['precio','Precio por unidad','number'],['t','Valor total de la venta','calc'],['abono','Valor recibido (abono o pago total)','number'],['banco','Banco donde entró el dinero','bank'],['s','Saldo por cobrar','calc'],['e','Estado del cobro','calc']],'ov_');
$('#vf').innerHTML=mk([['d1','Desde','date'],['d2','Hasta','date'],['cliente','Cliente'],['prod','Producto','sel','todos,estiba,huacal,tablero,otro'],['est','Estado del cobro','sel','todos,pendiente,parcial,cancelado']],'vf_',1);
let curV=null;
const vform=()=>{const o={};new FormData($('#fv')).forEach((v,k)=>o[k]=v);return o};
function vupd(){const c=cv(vform());$('#ov_t').textContent=fmt(c.t);$('#ov_s').textContent=fmt(c.s);$('#ov_e').innerHTML=bdv(c.e)}
function vload(r){curV=r?r.id:null;$('#fv').reset();const o=r||{fecha:new Date().toISOString().slice(0,10)};
 Object.keys(o).forEach(k=>{const e=$('#fv').elements[k];if(e&&k!='id')e.value=o[k]});
 $('#vx').classList.toggle('hide',!r);$('#vft').textContent=r?'✏️ Editando venta':'➕ Registrar una venta';$('#vd').open=true;vupd()}
$('#fv').addEventListener('input',vupd);
$('#vs').onclick=()=>{const o=vform();if(!o.fecha||!o.cliente||!n(o.cant)){toast('⚠ Falta la fecha, el cliente o la cantidad');return}
 o.id=curV||Date.now();const i=vt.findIndex(x=>x.id==o.id);i>=0?vt[i]=o:vt.push(o);saveV();if(cloud)cloud.setV(o);toast('✔ Venta guardada');vload(null);render()};
$('#vn').onclick=()=>vload(null);
$('#vx').onclick=()=>{if(confirm('¿Eliminar esta venta? No se puede deshacer.')){vt=vt.filter(x=>x.id!=curV);saveV();if(cloud)cloud.delV(curV);vload(null);render()}};
$('#vt').onclick=e=>{const r=e.target.closest('tr.cl');if(r){vload(vt.find(x=>x.id==r.dataset.id));scrollTo(0,0)}};
$('#vf').addEventListener('input',vrender);
function vrender(){const g=k=>$('#vf_'+k).value.trim();
 const R=vt.map(o=>({o,c:cv(o)})).filter(({o,c})=>(!g('d1')||o.fecha>=g('d1'))&&(!g('d2')||o.fecha<=g('d2'))&&(!g('cliente')||has(o.cliente,g('cliente')))&&(g('prod')=='todos'||o.prod==g('prod'))&&(g('est')=='todos'||c.e==g('est'))).sort((a,b)=>(b.o.fecha||'').localeCompare(a.o.fecha||''));
 const P={};vt.forEach(o=>{const p=P[o.prod]=P[o.prod]||{q:0,t:0};p.q+=n(o.cant);p.t+=cv(o).t});
 $('#vk').innerHTML=[['estiba','🟫 Estibas'],['huacal','📦 Huacales'],['tablero','🪵 Tableros'],['otro','Otros']].map(([p,l])=>`<div class="kc"><small>${l}</small><b>${(P[p]?P[p].q:0).toLocaleString('es-CO')} und.</b><i>${fmt(P[p]?P[p].t:0)} vendidos</i></div>`).join('');
 const tt=R.reduce((a,{o,c})=>({t:a.t+c.t,r:a.r+n(o.abono),s:a.s+c.s}),{t:0,r:0,s:0}),H=['Fecha','Cliente','Producto','Detalle','Cantidad','Precio','Total','Recibido','Por cobrar','Estado'];
 $('#vt').innerHTML='<thead><tr>'+H.map((x,i)=>`<th class="${i>3&&i<9?'r':''}">${x}</th>`).join('')+'</tr></thead><tbody>'+(R.map(({o,c})=>`<tr class="cl" data-id="${o.id}"><td>${o.fecha||''}</td><td>${o.cliente||''}</td><td>${o.prod}</td><td>${o.det||''}</td><td class="r">${n(o.cant)}</td><td class="r">${fmt(n(o.precio))}</td><td class="r"><b>${fmt(c.t)}</b></td><td class="r">${fmt(n(o.abono))}</td><td class="r">${fmt(c.s)}</td><td>${bdv(c.e)}</td></tr>`).join('')||'<tr><td colspan="10" class="empty">Todavía no hay ventas que mostrar. Registre la primera arriba.</td></tr>')+`</tbody><tfoot><tr><td colspan="6">TOTALES</td><td class="r">${fmt(tt.t)}</td><td class="r">${fmt(tt.r)}</td><td class="r">${fmt(tt.s)}</td><td></td></tr></tfoot>`;
 $('#vt').querySelectorAll('tbody tr.cl').forEach(tr=>[...tr.children].forEach((td,i)=>td.dataset.label=H[i]))}
// ---------- préstamos y quincena
const cpr=p=>{const d=(p.desc||[]).reduce((a,x)=>a+n(x.v),0),s=n(p.valor)-d;return{d,s,e:s<=0?'cancelado':d>0?'parcial':'pendiente'}};
const bdp=s=>`<span class="st ${s}">${{cancelado:'✔ Saldado',parcial:'◐ Abonó',pendiente:'● Debe'}[s]}</span>`;
const nk=s=>String(s||'').trim().toLowerCase();
$('#pg').innerHTML=mk([['fecha','Fecha del préstamo','date'],['persona','Nombre de la persona'],['rol','Rol','sel','aserrador,bolillero,arriero,cotero,motorista,transportador,otro'],['valor','Valor prestado','number'],['nota','Nota (opcional)']],'op_');
let curP=null;
const pform=()=>{const o={};new FormData($('#fp')).forEach((v,k)=>o[k]=v);return o};
function pload(r){curP=r?r.id:null;$('#fp').reset();const o=r||{fecha:today()};
 Object.keys(o).forEach(k=>{const e=$('#fp').elements[k];if(e&&k!='id'&&k!='desc')e.value=o[k]});
 $('#px').classList.toggle('hide',!r);$('#pft').textContent=r?'✏️ Editando préstamo':'➕ Registrar un préstamo';$('#pd').open=true}
$('#ps').onclick=()=>{const o=pform();if(!o.persona||!n(o.valor)){toast('⚠ Falta el nombre o el valor del préstamo');return}
 const old=pr.find(x=>x.id==curP);o.id=curP||Date.now();o.desc=old?old.desc:[];const i=pr.findIndex(x=>x.id==o.id);i>=0?pr[i]=o:pr.push(o);
 savePr();if(cloud)cloud.setP(o);toast('✔ Préstamo guardado');pload(null);render()};
$('#pn').onclick=()=>pload(null);
$('#px').onclick=()=>{if(confirm('¿Eliminar este préstamo?')){pr=pr.filter(x=>x.id!=curP);savePr();if(cloud)cloud.delP(curP);pload(null);render()}};
$('#ptb').onclick=e=>{const r=e.target.closest('tr.cl');if(r){pload(pr.find(x=>x.id==r.dataset.id));scrollTo(0,0)}};
$('#qm').value=today().slice(0,7);$('#qm').oninput=$('#qh').oninput=()=>prender();
function qdata(){const m=$('#qm').value,h=$('#qh').value;if(!m)return null;
 const [y,mo]=m.split('-').map(Number),end=m+'-'+(h=='1'?'15':String(new Date(y,mo,0).getDate())),ini=m+(h=='1'?'-01':'-16'),key=m+'-'+h,P={};
 const add=(rol,nm,g,yy)=>{if(!nm||!String(nm).trim())return;const id=rol+'|'+nk(nm),e=P[id]=P[id]||{rol,nm:String(nm).trim(),g:0,y:0};e.g+=g;e.y+=yy};
 db.filter(o=>o.fecha>=ini&&o.fecha<=end).forEach(o=>{const c=calc(o);c.TR.forEach(w=>add(w.t.toLowerCase(),w.n,w.tot,w.pg));add('cotero',o.cotero,c.cargueC,0)});
 pr.forEach(p=>add(p.rol,p.persona,0,0));
 const rows=Object.entries(P).map(([id,e])=>{const L=pr.filter(p=>p.rol+'|'+nk(p.persona)==id),s=L.reduce((a,p)=>a+Math.max(0,cpr(p).s),0),
  ap=L.reduce((a,p)=>a+(p.desc||[]).filter(x=>x.q==key).reduce((b,x)=>b+n(x.v),0),0),por=Math.max(0,e.g-e.y),dsc=ap||Math.min(por,s);
  return{...e,L,s,ap,por,dsc,net:por-dsc}}).filter(e=>e.g||e.s||e.ap).sort((a,b)=>a.nm.localeCompare(b.nm));
 return{rows,key,end}}
$('#qt').onclick=e=>{const b=e.target.closest('[data-ap]');if(!b)return;const q=qdata(),r=q.rows[b.dataset.ap];if(!r||r.dsc<=0)return;let rest=r.dsc;
 r.L.filter(p=>cpr(p).s>0).sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).forEach(p=>{const t=Math.min(rest,cpr(p).s);if(t>0){p.desc=[...(p.desc||[]),{f:q.end,v:t,q:q.key}];rest-=t;if(cloud)cloud.setP(p)}});
 savePr();toast('✔ Descuento aplicado');render()};
function prender(){const H=['Fecha','Persona','Rol','Valor','Descontado','Saldo','Estado'];
 $('#ptb').innerHTML='<thead><tr>'+H.map((x,i)=>`<th class="${i>2&&i<6?'r':''}">${x}</th>`).join('')+'</tr></thead><tbody>'+(pr.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')).map(p=>{const c=cpr(p);return `<tr class="cl" data-id="${p.id}"><td>${p.fecha||''}</td><td>${p.persona}</td><td>${p.rol}</td><td class="r">${fmt(n(p.valor))}</td><td class="r">${fmt(c.d)}</td><td class="r"><b>${fmt(c.s)}</b></td><td>${bdp(c.e)}</td></tr>`}).join('')||'<tr><td colspan="7" class="empty">No hay préstamos registrados todavía.</td></tr>')+'</tbody>';
 const q=qdata();
 $('#qt').innerHTML=!q?'':'<thead><tr><th>Persona</th><th>Rol</th><th class="r">Ganado en la quincena</th><th class="r">Ya pagado / anticipos</th><th class="r">Por pagar</th><th class="r">Préstamo pendiente</th><th class="r">Descuento</th><th class="r">Neto a pagar</th><th></th></tr></thead><tbody>'+(q.rows.map((r,i)=>`<tr><td><b>${r.nm}</b></td><td>${r.rol}</td><td class="r">${fmt(r.g)}</td><td class="r">${fmt(r.y)}</td><td class="r">${fmt(r.por)}</td><td class="r">${fmt(r.s+r.ap)}</td><td class="r"><b>${fmt(r.dsc)}</b></td><td class="r"><b>${fmt(r.net)}</b></td><td>${r.ap?'<span class="st cancelado">✔ Aplicado</span>':r.dsc>0?`<button class="b s" data-ap="${i}">Aplicar descuento</button>`:''}</td></tr>`).join('')||'<tr><td colspan="9" class="empty">No hay movimientos ni préstamos en esta quincena.</td></tr>')+'</tbody>'}
// ---------- panel de inicio
const MES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const sh=v=>v>=1e6?(v/1e6).toFixed(1)+' M':v>=1e3?Math.round(v/1e3)+' mil':Math.round(v);
function spark(v,c){const w=120,h=34,m=Math.max(...v,1),p=v.map((y,i)=>(i*w/(v.length-1))+','+(h-3-Math.max(0,y)/m*(h-8))).join(' ');
 return `<svg class="sp" height="36" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="0,${h} ${p} ${w},${h}" fill="${c}" opacity=".12"/><polyline points="${p}" fill="none" stroke="${c}" stroke-width="2"/></svg>`}
function dash(){
 const all=db.map(o=>({o,c:calc(o)})),V=vt.map(o=>({o,c:cv(o)})),now=new Date(),ms=[];
 for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);ms.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'))}
 const S=(A,f)=>ms.map(m=>A.filter(x=>(x.o.fecha||'').slice(0,7)==m).reduce((a,x)=>a+f(x),0)),sm=(A,f)=>A.reduce((a,x)=>a+f(x),0);
 const ing=S(V,x=>x.c.t),cos=S(all,x=>x.c.costo),TI=sm(V,x=>x.c.t),TC=sm(all,x=>x.c.costo);
 $('#dt').textContent=now.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('#k4').innerHTML=[['1. Ingresos por ventas',TI,ing,'#2f7a3b'],['2. Costos de compra',TC,cos,'#a0692f'],['3. Utilidad (ingresos − costos)',TI-TC,ing.map((v,i)=>v-cos[i]),'#8bb53a'],['4. Por cobrar a clientes',sm(V,x=>x.c.s),S(V,x=>x.c.s),'#0f766e'],['5. Por pagar a proveedores',sm(all,x=>x.c.saldo),S(all,x=>x.c.saldo),'#ef4444']].map(([l,t,s,col])=>{
  const a=s[5],b=s[4],p=b?(a-b)/Math.abs(b)*100:null;
  return `<div class="kc"><small>${l}</small><b>${fmt(t)}</b>${p===null?'<i></i>':`<i class="${p>=0?'up':'dn'}">${p>=0?'▲':'▼'} ${Math.abs(p).toFixed(1)}% vs mes anterior</i>`}${spark(s,col)}</div>`}).join('');
 const A=ing,B=cos,W=700,H=240,L=62,Bm=30,Tp=12,mx=Math.max(...A,...B,1),X=i=>L+i*(W-L-14)/5,Y=v=>Tp+(H-Tp-Bm)*(1-v/mx),pts=s=>s.map((v,i)=>X(i)+','+Y(v)).join(' ');
 $('#ch').innerHTML=`<svg viewBox="0 0 ${W} ${H}">${[0,1,2,3,4].map(i=>{const v=mx*i/4;return `<line x1="${L}" x2="${W-14}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end">${sh(v)}</text>`}).join('')}${ms.map((m,i)=>`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${MES[+m.slice(5)-1]}</text>`).join('')}${[[A,'#2f7a3b'],[B,'#a0692f']].map(([s,c])=>`<polygon points="${X(0)},${Y(0)} ${pts(s)} ${X(5)},${Y(0)}" fill="${c}" opacity=".1"/><polyline points="${pts(s)}" fill="none" stroke="${c}" stroke-width="2.5"/>${s.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${c}"/>`).join('')}`).join('')}</svg><div class="lg"><span><i style="background:#2f7a3b"></i>Ingresos (ventas)</span><span><i style="background:#a0692f"></i>Costos (compras)</span></div>`;
 const pe=[];all.forEach(({o,c})=>{if(c.pendD>0&&o.dueno)pe.push({id:o.id,r:'Dueño',n:o.dueno,v:c.pendD,e:c.stD});c.TR.forEach(w=>{if(w.s>0&&w.n)pe.push({id:o.id,r:w.t,n:w.n,v:w.s,e:w.e})})});
 pe.sort((a,b)=>b.v-a.v);
 $('#pp').innerHTML='<thead><tr><th>Persona</th><th>Rol</th><th class="r">Saldo</th><th>Estado</th></tr></thead><tbody>'+(pe.slice(0,6).map(p=>`<tr class="cl" data-id="${p.id}"><td>${p.n}</td><td>${p.r}</td><td class="r">${fmt(p.v)}</td><td>${(p.r=='Dueño'?bdo:bd)(p.e)}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">¡Sin pagos pendientes! 🎉</td></tr>')+'</tbody>';
 const cb=V.filter(x=>x.c.s>0).sort((a,b)=>b.c.s-a.c.s).slice(0,6);
 $('#cp').innerHTML='<thead><tr><th>Cliente</th><th>Producto</th><th class="r">Por cobrar</th><th>Estado</th></tr></thead><tbody>'+(cb.map(({o,c})=>`<tr class="cl" data-vid="${o.id}"><td>${o.cliente}</td><td>${o.prod}</td><td class="r">${fmt(c.s)}</td><td>${bdv(c.e)}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">Nadie le debe por ahora 🎉</td></tr>')+'</tbody>';
 const rec=(A,f)=>A.slice().sort((a,b)=>(b.o.fecha||'').localeCompare(a.o.fecha||'')).slice(0,5).map(f).join('');
 $('#lv').innerHTML=rec(V,({o,c})=>`<div class="li" data-vid="${o.id}"><div><b>${o.cliente||'-'}</b><small>${n(o.cant)} ${o.prod} · ${o.fecha||''}</small></div><div class="r"><b>${fmt(c.t)}</b><small>Por cobrar ${fmt(c.s)}</small></div></div>`)||'<p class="empty">Aún no hay ventas. Toque «💰 Nueva venta».</p>';
 $('#lo').innerHTML=rec(all,({o,c})=>`<div class="li" data-id="${o.id}"><div><b>${o.dueno||'-'}</b><small>${o.proc||''} · ${o.fecha||''}</small></div><div class="r"><b>${fmt(c.costo)}</b><small>Saldo ${fmt(c.saldo)}</small></div></div>`)||'<p class="empty">Aún no hay compras. Toque «➕ Nueva compra».</p>'}
// ---------- pagos pendientes e historial de fincas
// El historial sale de los anticipos y viajes de cada compra (ya se guardan en el navegador y en la nube),
// agrupados por dueño de la finca. Así nunca se pierde ni se puede desordenar.
function fdata(){const m={};
 db.forEach(o=>{const nm=String(o.dueno||'').trim();if(!nm)return;const c=calc(o),k=nk(nm),pr=String(o.proc||'').trim(),F=m[k]=m[k]||{k,nm,pr:new Set(),ant:0,desc:0,mov:[]};
  if(pr)F.pr.add(pr);F.ant+=c.pagD;F.desc+=c.valTrans;c.mov.forEach(x=>F.mov.push({...x,id:o.id,proc:pr}))});
 return Object.values(m).filter(F=>F.mov.length).map(F=>{F.mov.sort((a,b)=>(a.f||'9').localeCompare(b.f||'9')||b.v-a.v);let s=0;F.mov.forEach(x=>x.s=s+=x.v);F.saldo=F.ant-F.desc;return F})}
const bdf=f=>f.saldo<0?`<span class="st pendiente">● Se le debe ${fmt(-f.saldo)}</span>`:f.saldo>0?(f.saldo<=f.ant*.2?`<span class="st parcial">⚠ Anticipo bajo · ${fmt(f.saldo)}</span>`:`<span class="st cancelado">✔ Anticipo disponible · ${fmt(f.saldo)}</span>`):'<span class="note">Sin saldo</span>';
const mvB=(L,cols)=>`<thead><tr><th>Fecha</th>${cols?'<th>Finca</th>':''}<th>Compra (procedencia)</th><th>Movimiento</th><th class="r">Valor</th><th class="r">Saldo de la finca</th></tr></thead><tbody>${L.map(x=>`<tr class="cl" data-id="${x.id}"><td>${x.f}</td>${cols?`<td><b>${x.nm}</b></td>`:''}<td>${x.proc}</td><td>${x.t}</td><td class="r ${x.v<0?'dn':'up'}">${fmt(x.v)}</td><td class="r"><b class="${x.s<0?'dn':''}">${fmt(x.s)}</b></td></tr>`).join('')}</tbody>`,mvT=(L,cols)=>`<div class="tw"><table class="mv">${mvB(L,cols)}</table></div>`;
const kpi=A=>A.map(([l,v,r])=>`<div><small>${l}</small><b>${r?v:fmt(v)}</b></div>`).join('');
function hopts(){const F=fdata().sort((a,b)=>a.nm.localeCompare(b.nm)),s=$('#hf_finca'),cur=s.value||'todas';
 s.innerHTML='<option value="todas">Todas las fincas</option>'+F.map(f=>`<option value="${qa(f.k)}">${f.nm}</option>`).join('');s.value=F.some(f=>f.k==cur)?cur:'todas'}
function hist(){const d1=$('#hf_d1').value,d2=$('#hf_d2').value,tp=$('#hf_tipo').value,fk=$('#hf_finca').value,L=[];let q=0,fs=null;
 fdata().forEach(f=>{if(fk!='todas'&&f.k!=fk)return;fs=f;f.mov.forEach(x=>{
  if((d1||d2)&&!x.f)return;if(d1&&x.f<d1)return;if(d2&&x.f>d2)return;if(tp=='a'&&x.v<=0)return;if(tp=='v'&&x.v>=0)return;
  L.push({...x,nm:f.nm,q:q++})})});
 L.sort((a,b)=>(b.f||'9').localeCompare(a.f||'9')||b.q-a.q);
 const en=L.filter(x=>x.v>0).reduce((a,x)=>a+x.v,0),de=-L.filter(x=>x.v<0).reduce((a,x)=>a+x.v,0);
 $('#hk').innerHTML=kpi([['Movimientos',L.length,1],['Anticipos entregados',en],['Descontado por viajes',de],['Neto del período (entregado − descontado)',en-de],...(fk!='todas'&&fs?[['Saldo actual de la finca',fs.saldo]]:[])]);
 $('#ht').innerHTML=L.length?mvB(L,1):'<tbody><tr><td class="empty">No hay movimientos con esos filtros.</td></tr></tbody>'}
$('#hf').addEventListener('input',hist);
$('#hclr').onclick=()=>{$('#hf_finca').value='todas';$('#hf_d1').value=$('#hf_d2').value='';$('#hf_tipo').value='todos';hist()};
function pagos(){
 // --- por pagar: fincas
 const F=fdata().sort((a,b)=>a.saldo-b.saldo||a.nm.localeCompare(b.nm));
 // --- por pagar: aserrador, bolillero, arriero
 const pe=[];db.forEach(o=>{const c=calc(o);c.TR.forEach(w=>{if(w.s>0&&String(w.n||'').trim())pe.push({id:o.id,f:o.fecha||'',r:w.t,nm:w.n,v:w.s,e:w.e})})});
 pe.sort((a,b)=>b.v-a.v);
 const deuda=F.reduce((a,f)=>a+Math.max(0,-f.saldo),0),otros=pe.reduce((a,p)=>a+p.v,0);
 $('#pk').innerHTML=kpi([['Anticipos entregados a fincas',F.reduce((a,f)=>a+f.ant,0)],['Descontado por viajes',F.reduce((a,f)=>a+f.desc,0)],['Anticipo que aún queda en fincas',F.reduce((a,f)=>a+Math.max(0,f.saldo),0)],['Se le debe a fincas',deuda],['TOTAL POR PAGAR (fincas + otros)',deuda+otros]]);
 $('#fl').innerHTML=F.map(f=>`<details class="fc"><summary><span><b>${f.nm}</b>${f.pr.size?`<small>${[...f.pr].join(', ')}</small>`:''}</span><span>${bdf(f)}</span></summary>
  <div class="kp">${kpi([['Anticipos entregados',f.ant],['Descontado por viajes',f.desc],['Saldo actual (negativo = se le debe)',f.saldo]])}</div>${mvT(f.mov)}</details>`).join('')||'<p class="empty">Aún no hay anticipos ni viajes registrados en las fincas.</p>';
 $('#po').innerHTML='<thead><tr><th>Fecha</th><th>Persona</th><th>Rol</th><th class="r">Saldo pendiente</th><th>Estado</th></tr></thead><tbody>'+(pe.map(p=>`<tr class="cl" data-id="${p.id}"><td>${p.f}</td><td>${p.nm}</td><td>${p.r}</td><td class="r">${fmt(p.v)}</td><td>${bd(p.e)}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">¡Sin pagos pendientes! 🎉</td></tr>')+`</tbody><tfoot><tr><td colspan="3">TOTAL</td><td class="r">${fmt(otros)}</td><td></td></tr></tfoot>`;
 // --- por cobrar: clientes
 const m={};vt.forEach(o=>{const nm=String(o.cliente||'').trim();if(!nm)return;const c=cv(o),k=nk(nm),C=m[k]=m[k]||{nm,t:0,r:0,s:0,L:[]};C.t+=c.t;C.r+=n(o.abono);C.s+=c.s;C.L.push({o,c})});
 const C=Object.values(m).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
 $('#ck').innerHTML=kpi([['Clientes que me deben',C.length,1],['Vendido a esos clientes',C.reduce((a,x)=>a+x.t,0)],['Ya recibido',C.reduce((a,x)=>a+x.r,0)],['TOTAL POR COBRAR',C.reduce((a,x)=>a+x.s,0)]]);
 $('#cc').innerHTML=C.map(x=>{const L=x.L.filter(y=>y.c.s>0).sort((a,b)=>(a.o.fecha||'').localeCompare(b.o.fecha||''));
  return `<details class="fc"><summary><span><b>${x.nm}</b><small>${L.length} venta(s) con saldo · vendido ${fmt(x.t)} · recibido ${fmt(x.r)}</small></span><span><b class="dn">Debe ${fmt(x.s)}</b> ${bdv(stt(x.t,x.r))}</span></summary>
  <div class="tw"><table class="mv"><thead><tr><th>Fecha</th><th>Producto</th><th class="r">Cantidad</th><th class="r">Total</th><th class="r">Recibido</th><th class="r">Por cobrar</th></tr></thead><tbody>${L.map(({o,c})=>`<tr class="cl" data-vid="${o.id}"><td>${o.fecha||''}</td><td>${o.prod}${o.det?' · '+o.det:''}</td><td class="r">${n(o.cant)}</td><td class="r">${fmt(c.t)}</td><td class="r">${fmt(n(o.abono))}</td><td class="r"><b class="dn">${fmt(c.s)}</b></td></tr>`).join('')}</tbody></table></div></details>`}).join('')||'<p class="empty">Nadie le debe por ahora 🎉</p>';
 hopts();hist()}
$('#v5').onclick=e=>{const v=e.target.closest('[data-vid]');if(v){vload(vt.find(x=>x.id==v.dataset.vid));tab(7);return}const r=e.target.closest('[data-id]');if(r){load(db.find(x=>x.id==r.dataset.id));tab(2)}};
// ---------- bancos
// Cada pago de una compra (anticipo a finca, anticipo o pago final a un trabajador, cargue) y cada venta cobrada
// guardan el banco; el historial y los saldos de la página Bancos salen de ahí, más los movimientos manuales.
let BM=[];
function bmovs(){const L=[],P1=(b,f,v,t,who,ref)=>L.push({b:b||'',f:f||'',v,t,who:who||'',...ref});
 db.forEach(o=>{const c=calc(o),f0=o.fecha||'';
  (o.antis||[]).forEach(x=>{if(n(x.v))P1(x.b,x.f||f0,-n(x.v),'Anticipo a finca',o.dueno,{id:o.id,o:'c'})});
  if(c.cargue>0)P1(o.bCargue,f0,-c.cargue,'Pago de cargue',o.dueno,{id:o.id,o:'c'});
  c.TR.forEach(w=>{if(n(w.a))P1(w.ab,w.ad||f0,-n(w.a),'Anticipo '+w.t.toLowerCase(),w.n,{id:o.id,o:'c'});if(n(w.f))P1(w.fb,w.fd||f0,-n(w.f),'Pago final '+w.t.toLowerCase(),w.n,{id:o.id,o:'c'})})});
 vt.forEach(o=>{if(n(o.abono))P1(o.banco,o.fecha,n(o.abono),'Venta cobrada',o.cliente,{vid:o.id,o:'v'})});
 bk.forEach(k=>(k.movs||[]).forEach(m=>P1(k.id,m.f,n(m.v),n(m.v)>0?'Ingreso manual':'Retiro manual',m.nota,{bid:k.id,mid:m.id,o:'m'})));
 L.forEach((m,i)=>m.q=i);return L}
function brender(){const M=bmovs(),T={},none={n:0,i:0,o:0};
 bk.forEach(k=>T[k.id]={k,s:n(k.ini),i:0,o:0});
 M.slice().sort((a,b)=>(a.f||'9').localeCompare(b.f||'9')||a.q-b.q).forEach(m=>{const t=T[m.b];if(t){t.s+=m.v;m.s=t.s;m.v>0?t.i+=m.v:t.o-=m.v}else{m.b='';none.n++;m.v>0?none.i+=m.v:none.o-=m.v}});
 BM=M;
 $('#bcards').innerHTML=`<div class="kc"><small>TOTAL EN BANCOS</small><b>${fmt(Object.values(T).reduce((a,t)=>a+t.s,0))}</b><i>${bk.length} cuentas</i></div>`+bk.map(k=>{const t=T[k.id];return `<div class="kc bkc" data-bid="${qa(k.id)}"><small>${k.titular} · ${k.banco}</small><b class="${t.s<0?'dn':''}">${fmt(t.s)}</b><i>Entró ${fmt(t.i)} · Salió ${fmt(t.o)}</i><button type="button" class="b s sm" data-bedit="${qa(k.id)}">✏️ Editar cuenta</button></div>`}).join('');
 $('#bsin').textContent=none.n?`Hay ${none.n} movimientos sin banco asignado (efectivo o registros anteriores): entró ${fmt(none.i)} · salió ${fmt(none.o)}. No afectan ningún saldo de banco.`:'';
 const sl=$('#bh_banco'),cur=sl.value||'todos';sl.innerHTML='<option value="todos">Todos los bancos</option>'+bk.map(k=>`<option value="${qa(k.id)}">${bn(k)}</option>`).join('')+'<option value="__none">Sin banco / efectivo</option>';sl.value=[...sl.options].some(o=>o.value==cur)?cur:'todos';
 BT=T;bhist()}
let BT={};
function bhist(){const d1=$('#bh_d1').value,d2=$('#bh_d2').value,tp=$('#bh_tipo').value,og=$('#bh_origen').value,bf=$('#bh_banco').value;
 const L=BM.filter(m=>{if(bf!='todos'&&(bf=='__none'?m.b!='':m.b!=bf))return false;if((d1||d2)&&!m.f)return false;if(d1&&m.f<d1)return false;if(d2&&m.f>d2)return false;if(tp=='i'&&m.v<=0)return false;if(tp=='e'&&m.v>=0)return false;if(og!='todos'&&m.o!=og)return false;return true}).sort((a,b)=>(b.f||'9').localeCompare(a.f||'9')||b.q-a.q);
 const en=L.filter(m=>m.v>0).reduce((a,m)=>a+m.v,0),sa=-L.filter(m=>m.v<0).reduce((a,m)=>a+m.v,0);
 $('#bhk').innerHTML=kpi([['Movimientos',L.length,1],['Entró',en],['Salió',sa],['Neto (entró − salió)',en-sa],...(BT[bf]?[['Saldo actual del banco',BT[bf].s]]:[])]);
 $('#bht').innerHTML=L.length?'<thead><tr><th>Fecha</th><th>Banco</th><th>Movimiento</th><th>Detalle</th><th class="r">Entró</th><th class="r">Salió</th><th class="r">Saldo del banco</th><th></th></tr></thead><tbody>'+L.map(m=>`<tr class="${m.id||m.vid?'cl':''}" ${m.id?`data-id="${m.id}"`:m.vid?`data-vid="${m.vid}"`:''}><td>${m.f}</td><td>${m.b?(bk.find(k=>k.id==m.b)?bn(bk.find(k=>k.id==m.b)):''):'<span class="note">Sin banco</span>'}</td><td>${m.t}</td><td>${m.who}</td><td class="r up">${m.v>0?fmt(m.v):''}</td><td class="r dn">${m.v<0?fmt(-m.v):''}</td><td class="r">${m.b?`<b class="${m.s<0?'dn':''}">${fmt(m.s)}</b>`:'—'}</td><td>${m.o=='m'?`<button type="button" class="x sm" data-delm="${qa(m.bid)}|${m.mid}" title="Eliminar este movimiento">✕</button>`:''}</td></tr>`).join('')+'</tbody>':'<tbody><tr><td class="empty">No hay movimientos con esos filtros.</td></tr></tbody>'}
$('#bhf').addEventListener('input',bhist);
$('#bhclr').onclick=()=>{$('#bh_banco').value='todos';$('#bh_d1').value=$('#bh_d2').value='';$('#bh_tipo').value='todos';$('#bh_origen').value='todos';bhist()};
$('#bg').innerHTML=mk([['titular','Titular de la cuenta (ej.: Gloria)'],['banco','Banco (ej.: Bancolombia)'],['ini','Saldo inicial de la cuenta','number']],'ob_');
$('#mg').innerHTML=mk([['b','Banco','bank'],['f','Fecha','date'],['tipo','Tipo','sel','ingreso,retiro'],['v','Valor','number'],['nota','Nota (opcional)']],'om_');
let curB=null;
function bload(k){curB=k?k.id:null;const f=$('#fb');f.reset();if(k)['titular','banco','ini'].forEach(x=>f.elements[x].value=k[x]??'');$('#bdl').classList.toggle('hide',!k);$('#bft').textContent=k?'✏️ Editando cuenta':'➕ Agregar cuenta bancaria';$('#bd').open=!!k}
$('#bsv').onclick=()=>{const o={};new FormData($('#fb')).forEach((v,k)=>o[k]=v);if(!o.titular.trim()||!o.banco.trim()){toast('⚠ Falta el titular o el banco');return}
 const old=bk.find(x=>x.id==curB),k={id:curB||'b'+Date.now(),titular:o.titular.trim(),banco:o.banco.trim(),ini:n(o.ini),movs:old?old.movs||[]:[]},i=bk.findIndex(x=>x.id==k.id);
 i>=0?bk[i]=k:bk.push(k);saveB();if(cloud)cloud.setB(k);toast('✔ Cuenta guardada');bload(null);render()};
$('#bnw').onclick=()=>bload(null);
$('#bdl').onclick=()=>{const k=bk.find(x=>x.id==curB);if(!k)return;if(bmovs().some(m=>m.b==k.id)){toast('⚠ Esta cuenta ya tiene movimientos: no se puede eliminar');return}
 if(confirm('¿Eliminar esta cuenta bancaria?')){bk=bk.filter(x=>x.id!=k.id);saveB();if(cloud)cloud.delB(k.id);bload(null);render()}};
$('#msv').onclick=()=>{const o={};new FormData($('#fmv')).forEach((v,k)=>o[k]=v);const k=bk.find(x=>x.id==o.b);
 if(!k||!n(o.v)||!o.f){toast('⚠ Falta el banco, la fecha o el valor');return}
 k.movs=[...(k.movs||[]),{id:Date.now(),f:o.f,v:Math.abs(n(o.v))*(o.tipo=='retiro'?-1:1),nota:o.nota||''}];saveB();if(cloud)cloud.setB(k);toast('✔ Movimiento registrado');$('#fmv').reset();$('#fmv').elements.f.value=today();render()};
$('#v9').onclick=e=>{
 const d=e.target.closest('[data-delm]');if(d){const [bid,mid]=d.dataset.delm.split('|'),k=bk.find(x=>x.id==bid);if(k&&confirm('¿Eliminar este movimiento manual?')){k.movs=(k.movs||[]).filter(m=>String(m.id)!=mid);saveB();if(cloud)cloud.setB(k);render()}return}
 const ed=e.target.closest('[data-bedit]');if(ed){bload(bk.find(x=>x.id==ed.dataset.bedit));scrollTo(0,0);return}
 const b=e.target.closest('[data-bid]');if(b){$('#bh_banco').value=b.dataset.bid;bhist();$('#bhc').scrollIntoView({behavior:'smooth'});return}
 const v=e.target.closest('[data-vid]');if(v){vload(vt.find(x=>x.id==v.dataset.vid));tab(7);return}
 const r=e.target.closest('[data-id]');if(r){load(db.find(x=>x.id==r.dataset.id));tab(2)}};
// ---------- pestañas
const TT={4:'Inicio',1:'Reportes y operaciones',2:'Nueva compra de madera',7:'Ventas e ingresos',8:'Préstamos y quincena',3:'Respaldo y datos',6:'Personas y proveedores',5:'Pagos pendientes',9:'Bancos'};
function tab(i,al){const nv=al||i;[1,2,3,4,5,6,7,8,9].forEach(k=>$('#v'+k).classList.toggle('hide',k!=i));[1,2,3,4,5,6,7,8,9].forEach(k=>$('#t'+k).classList.toggle('on',k==nv));$('#pt').textContent=TT[nv];render();scrollTo(0,0)}
function ppl(){const m={},q=($('#pq').value||'').toLowerCase();
 db.forEach(o=>{const c=calc(o),add=(r,nm,t,p,s)=>{nm=String(nm||'').trim();if(!nm)return;const k=r+'|'+nm.toLowerCase(),e=m[k]=m[k]||{nm,r,n:0,t:0,p:0,s:0};e.n++;e.t+=t;e.p+=p;e.s+=s};add('Dueño',o.dueno,c.valTrans,c.pagD,c.pendD);c.TR.forEach(w=>add(w.t,w.n,w.tot,w.pg,w.s))});
 const L=Object.values(m).filter(e=>e.nm.toLowerCase().includes(q)).sort((a,b)=>b.s-a.s);
 $('#pt2').innerHTML='<thead><tr><th>Nombre</th><th>Rol</th><th class="r">Operaciones</th><th class="r">Total</th><th class="r">Pagado</th><th class="r">Saldo</th><th>Estado</th></tr></thead><tbody>'+(L.map(e=>`<tr><td><b>${e.nm}</b></td><td>${e.r}</td><td class="r">${e.n}</td><td class="r">${fmt(e.t)}</td><td class="r">${fmt(e.p)}</td><td class="r">${fmt(e.s)}</td><td>${bd(stt(e.t,e.p))}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">No hay personas registradas todavía.</td></tr>')+'</tbody>'}
$('#pq').oninput=ppl;
const est=v=>$('#f_est').value=v;
$('#t4').onclick=()=>tab(4);$('#t2').onclick=()=>{load(null);tab(2)};$('#t3').onclick=()=>tab(3);$('#t6').onclick=()=>tab(6);$('#t7').onclick=()=>tab(7);$('#t8').onclick=()=>{pload(null);tab(8)};$('#nv').onclick=()=>{vload(null);tab(7)};
$('#t1').onclick=()=>{if($('#f_est').value=='con saldo pendiente')est('todos');tab(1)};
$('#t5').onclick=()=>tab(5);$('#t9').onclick=()=>{bload(null);const e=$('#fmv').elements.f;if(!e.value)e.value=today();tab(9)};
$('#nb').onclick=()=>{load(null);tab(2)};$('#xb').onclick=()=>$('#csv').click();
$('#v4').onclick=e=>{const v=e.target.closest('[data-vid]');if(v){vload(vt.find(x=>x.id==v.dataset.vid));tab(7);return}const r=e.target.closest('[data-id]');if(r){load(db.find(x=>x.id==r.dataset.id));tab(2)}};
const gate=ok=>{$('.side').classList.toggle('hide',!ok);$('.top').classList.toggle('hide',!ok);$('#v0').classList.toggle('hide',ok);if(ok)tab(4);else[1,2,3,4,5,6,7,8,9].forEach(k=>$('#v'+k).classList.add('hide'))};
async function initCloud(){
 const B='https://www.gstatic.com/firebasejs/10.12.2/';
 const [A,Au,Fs]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);
 const app=A.initializeApp(FIREBASE_CONFIG),auth=Au.getAuth(app),fs=Fs.initializeFirestore(app,{localCache:Fs.persistentLocalCache()}),col=Fs.collection(fs,'operaciones');
 const err=e=>alert('Error con la nube: '+e.message);
 const colV=Fs.collection(fs,'ventas'),colP=Fs.collection(fs,'prestamos'),colB=Fs.collection(fs,'bancos');cloud={setB:o=>Fs.setDoc(Fs.doc(colB,String(o.id)),o).catch(err),delB:id=>Fs.deleteDoc(Fs.doc(colB,String(id))).catch(err),setP:o=>Fs.setDoc(Fs.doc(colP,String(o.id)),o).catch(err),delP:id=>Fs.deleteDoc(Fs.doc(colP,String(id))).catch(err),setV:o=>Fs.setDoc(Fs.doc(colV,String(o.id)),o).catch(err),delV:id=>Fs.deleteDoc(Fs.doc(colV,String(id))).catch(err),set:o=>Fs.setDoc(Fs.doc(col,String(o.id)),o).catch(err),del:id=>Fs.deleteDoc(Fs.doc(col,String(id))).catch(err)};
 const login=()=>Au.signInWithEmailAndPassword(auth,$('#em').value.trim(),$('#pw').value).then(()=>{$('#lerr').textContent='';$('#pw').value=''}).catch(()=>$('#lerr').textContent='Correo o contraseña incorrectos');
 $('#lg').onclick=login;$('#pw').onkeydown=e=>{if(e.key=='Enter')login()};$('#em').onkeydown=e=>{if(e.key=='Enter')$('#pw').focus()};
 $('#so').onclick=()=>Au.signOut(auth);$('#so').classList.remove('hide');
 $('#rp').onclick=ev=>{ev.preventDefault();const e=$('#em').value.trim();if(!e){$('#lerr').textContent='Escriba su correo arriba y vuelva a tocar aquí';return}
  Au.sendPasswordResetEmail(auth,e).then(()=>$('#lerr').textContent='✔ Le enviamos un correo para cambiar la contraseña').catch(()=>$('#lerr').textContent='No se pudo enviar el correo. Revise que esté bien escrito.')};
 let idle;const bump=()=>{clearTimeout(idle);idle=setTimeout(()=>{if(auth.currentUser){Au.signOut(auth);toast('Sesión cerrada por inactividad')}},SESION_MIN*60000)};
 ['click','keydown','touchstart'].forEach(ev=>addEventListener(ev,bump,{passive:true}));bump();
 let un=null,un2=null,un3=null,un4=null,first=true,firstV=true,firstB=true;
 Au.onAuthStateChanged(auth,u=>{
  if(!u){gate(false);if(un)un();if(un2)un2();if(un3)un3();if(un4)un4();un=un2=un3=un4=null;first=firstV=firstB=true;return}
  $('#us').textContent='☁ '+u.email;gate(true);
  un=Fs.onSnapshot(col,s=>{let d=s.docs.map(x=>x.data());
   if(first&&!s.metadata.fromCache){first=false;const ids=new Set(d.map(x=>String(x.id))),pend=db.filter(x=>!ids.has(String(x.id)));
    if(pend.length&&confirm('Hay '+pend.length+' operaciones guardadas solo en este navegador. ¿Subirlas a la nube?')){pend.forEach(cloud.set);d=d.concat(pend)}}
   db=d;save();render()},err);
  un2=Fs.onSnapshot(colV,s=>{const d=s.docs.map(x=>x.data());if(firstV&&!s.metadata.fromCache){firstV=false;const ids=new Set(d.map(x=>String(x.id)));vt.filter(x=>!ids.has(String(x.id))).forEach(x=>{cloud.setV(x);d.push(x)})}vt=d;saveV();render()},err);
  un3=Fs.onSnapshot(colP,s=>{pr=s.docs.map(x=>x.data());savePr();render()},err);
  un4=Fs.onSnapshot(colB,s=>{let d=s.docs.map(x=>x.data());if(firstB&&!s.metadata.fromCache){firstB=false;const ids=new Set(d.map(x=>String(x.id)));bk.filter(x=>!ids.has(String(x.id))).forEach(x=>{cloud.setB(x);d.push(x)})}
   if(d.length||!firstB){bk=d;saveB()}render()},err)})}
$('#sp').onchange=e=>$('#pw').type=e.target.checked?'text':'password';
if(!FIREBASE_CONFIG.apiKey&&!MODO_LOCAL){load(null);gate(false);$('#lg').disabled=true;$('#lerr').textContent='Falta configurar Firebase: pegue los datos de su proyecto en config.js'}
else if(FIREBASE_CONFIG.apiKey){load(null);gate(false);initCloud().catch(e=>{$('#lerr').textContent='No se pudo conectar con Firebase: '+e.message})}
else{$('#us').textContent='Modo local (sin nube)';load(null);tab(4)}
