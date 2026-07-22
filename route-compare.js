const DESIDERIO_HEARTS={
  'toscana-cuore':5,'ligurien':4,'gardasee-veneto':5,'suedtirol-dolomiten':3,'emilia-romagna':4,'umbrien-marken':4,'apulien':5,'sizilien-ost-sued':4,'rom-sizilien':3,
  'comer-see-villen':4,'valtellina-genussroute':3,'costa-dei-trabocchi':4,'cilento-kueste':4,'piemont-weinlandschaften':4,'sardinien-nordkueste':5,'kalabrien-kuestendoerfer':3,'friaul-triest-collio':4,
  'sizilien-westkueste':5,'basilikata-coast-to-coast':3,'venetien-prosecco-lagune':4,'sardinien-suedkueste':5,'lago-maggiore-orta-mailand':4,'latium-tuscia-seen':3,'italien-meer-zu-meer':3,'aostatal-genuss-panorama':3,'marken-conero-verdicchio':4
};
function incantoCompareLabel(route,index){return `Route ${String(index+1).padStart(2,'0')} · ${route.title} · ${route.days}`}
function readable(values){const labels={sea:'Meer',beach:'Strand','sand-beach':'Sandstrand',wine:'Wein',culinary:'Genuss',mountain:'Berge',lake:'See',culture:'Kultur',city:'Städte',cities:'Städte',nature:'Natur',luxury:'Stil & Luxus',villages:'Dörfer',markets:'Märkte',islands:'Inseln',gardens:'Gärten',wellness:'Wellness',boat:'Boot',lagoon:'Lagune',coast:'Küste',vineyards:'Weinberge',panorama:'Panorama',history:'Geschichte'};return [...new Set((values||[]).map(value=>labels[value]||String(value).replaceAll('-',' ')))].join(' · ')||'–'}
function incantoCompareValue(route,key,index){
  const meta=route.meta||{};
  if(key==='number')return `Route ${String(index+1).padStart(2,'0')}`;
  if(key==='hearts'){const count=DESIDERIO_HEARTS[route.id]??Math.max(0,Math.min(5,Number(meta.hearts||0)));return count?`${'♥'.repeat(count)}${'♡'.repeat(5-count)}`:'–'}
  if(key==='themes')return readable([...(meta.themes||[]),...(meta.landscape||[])] )||route.eyebrow;
  if(key==='water')return readable(meta.water)||'Kein eigener Wasserschwerpunkt';
  if(key==='wine')return readable((meta.themes||[]).filter(value=>['wine','culinary','markets'].includes(value)))||((route.eyebrow||'').toLowerCase().includes('wein')?'Wein ist Teil der Route':'Kein ausgesprochener Weinfokus');
  if(key==='stops')return (route.stops||[]).slice(0,7).join(' · ')+((route.stops||[]).length>7?` · +${route.stops.length-7} weitere`:'' );
  if(key==='scope')return `${route.stops?.length||0} Hauptstopps · ${route.detours?.length||0} besondere Abzweigungen`;
  if(key==='summer')return meta.summer_notes||meta.nrwSummerFit||meta.nrwsummerfit||meta.summer_nrw===true?'Für die NRW-Sommerferien vorgesehen':'Saison im Detail prüfen';
  if(key==='mobility')return String(meta.mobility||'nicht gesondert bewertet').replaceAll('-',' ');
  if(key==='heat')return String(meta.heat||meta.summer_notes||'regional unterschiedlich').replaceAll('-',' ');
  if(key==='camper')return route.details?.camper?.strategy||route.editorial?.camper||String(meta.camper_fit||meta.camper||'Wohnmobilhinweise stehen in der Detailansicht.').replaceAll('-',' ');
  if(key==='feel')return route.details?.idealFor||route.editorial?.decision||route.why||route.summary;
  return route[key]||'–';
}
function initRouteComparison(routes){
  const first=document.querySelector('#compareRouteA'),second=document.querySelector('#compareRouteB'),output=document.querySelector('#routeCompareOutput');
  if(!first||!second||!output||!routes?.length)return;
  routes.forEach((route,index)=>{route.routeNumber=index+1;route.meta=route.meta||{};route.meta.hearts=DESIDERIO_HEARTS[route.id]??route.meta.hearts});
  const options=routes.map((route,index)=>`<option value="${route.id}">${incantoCompareLabel(route,index)}</option>`).join('');
  first.innerHTML=options;second.innerHTML=options;first.value=routes[0].id;second.value=routes[Math.min(1,routes.length-1)].id;
  const rows=[['Feste Nummer','number'],['Reisedauer','days'],['Strecke vor Ort','distance'],['Region','region'],['Desiderio-Passung','hearts'],['Reiseprofil','themes'],['Meer, See & Wasser','water'],['Wein & Genuss','wine'],['Wichtigste Orte','stops'],['Umfang','scope'],['Reisegefühl','feel'],['Sommerferien','summer'],['Bewegungsniveau','mobility'],['Hitze','heat'],['Mit dem Wohnmobil','camper']];
  function render(){
    let a=routes.find(route=>route.id===first.value)||routes[0],b=routes.find(route=>route.id===second.value)||routes[1]||routes[0];
    if(a.id===b.id){const replacement=routes.find(route=>route.id!==a.id);if(replacement){b=replacement;second.value=b.id}}
    const ai=routes.indexOf(a),bi=routes.indexOf(b);
    output.innerHTML=`<div class="compare-head compare-label"></div><article class="compare-head"><span class="compare-route-number">${String(ai+1).padStart(2,'0')}</span><img src="${a.image}" alt=""><h3>${a.title}</h3><button type="button" data-open-route="${a.id}">DETAILS ÖFFNEN</button></article><article class="compare-head"><span class="compare-route-number">${String(bi+1).padStart(2,'0')}</span><img src="${b.image}" alt=""><h3>${b.title}</h3><button type="button" data-open-route="${b.id}">DETAILS ÖFFNEN</button></article>${rows.map(([label,key])=>`<div class="compare-label">${label}</div><div class="compare-value">${incantoCompareValue(a,key,ai)}</div><div class="compare-value">${incantoCompareValue(b,key,bi)}</div>`).join('')}`;
    output.querySelectorAll('[data-open-route]').forEach(button=>button.onclick=()=>window.openRoute?.(button.dataset.openRoute));
  }
  first.onchange=render;second.onchange=render;render();
}
window.DESIDERIO_HEARTS=DESIDERIO_HEARTS;
window.addEventListener('incanto:routes-ready',event=>initRouteComparison(event.detail.routes));
window.addEventListener('DOMContentLoaded',()=>{if(window.incantoRoutes?.length)initRouteComparison(window.incantoRoutes)});