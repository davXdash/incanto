function incantoCompareLabel(route){return `${route.title} · ${route.days}`}
function incantoCompareValue(route,key){
  const meta=route.meta||{};
  if(key==='hearts'){const count=Math.max(0,Math.min(5,Number(meta.hearts||0)));return count?`${'♥'.repeat(count)}${'♡'.repeat(5-count)}`:'–'}
  if(key==='themes')return [...(meta.themes||[]),...(meta.water||[]),...(meta.landscape||[])].map(value=>({sea:'Meer',beach:'Strand',wine:'Wein',culinary:'Genuss',mountain:'Berge',lake:'Seen',culture:'Kultur',city:'Städte',nature:'Natur',luxury:'Stil & Luxus'}[value]||value)).filter((value,index,array)=>array.indexOf(value)===index).join(' · ')||route.eyebrow;
  if(key==='stops')return `${route.stops?.length||0} Hauptstopps`;
  if(key==='camper')return route.details?.camper?.strategy||route.editorial?.camper||'Wohnmobilhinweise sind in der Detailansicht hinterlegt.';
  if(key==='feel')return route.details?.idealFor||route.editorial?.decision||route.why||route.summary;
  return route[key]||'–';
}
function initRouteComparison(routes){
  const first=document.querySelector('#compareRouteA');
  const second=document.querySelector('#compareRouteB');
  const output=document.querySelector('#routeCompareOutput');
  if(!first||!second||!output||!routes?.length)return;
  const options=routes.map(route=>`<option value="${route.id}">${incantoCompareLabel(route)}</option>`).join('');
  first.innerHTML=options;second.innerHTML=options;
  first.value=routes[0].id;second.value=routes[Math.min(1,routes.length-1)].id;
  const rows=[['Reisedauer','days'],['Strecke vor Ort','distance'],['Region','region'],['Incanto-Faktor','hearts'],['Schwerpunkte','themes'],['Umfang','stops'],['Reisegefühl','feel'],['Mit dem Wohnmobil','camper']];
  function render(){
    let a=routes.find(route=>route.id===first.value)||routes[0];
    let b=routes.find(route=>route.id===second.value)||routes[1]||routes[0];
    if(a.id===b.id){const replacement=routes.find(route=>route.id!==a.id);if(replacement){b=replacement;second.value=b.id}}
    output.innerHTML=`<div class="compare-head compare-label"></div><article class="compare-head"><img src="${a.image}" alt=""><h3>${a.title}</h3><button type="button" data-open-route="${a.id}">DETAILS ÖFFNEN</button></article><article class="compare-head"><img src="${b.image}" alt=""><h3>${b.title}</h3><button type="button" data-open-route="${b.id}">DETAILS ÖFFNEN</button></article>${rows.map(([label,key])=>`<div class="compare-label">${label}</div><div class="compare-value">${incantoCompareValue(a,key)}</div><div class="compare-value">${incantoCompareValue(b,key)}</div>`).join('')}`;
    output.querySelectorAll('[data-open-route]').forEach(button=>button.onclick=()=>window.openRoute?.(button.dataset.openRoute));
  }
  first.onchange=render;second.onchange=render;render();
}
window.addEventListener('incanto:routes-ready',event=>initRouteComparison(event.detail.routes));
window.addEventListener('DOMContentLoaded',()=>{if(window.incantoRoutes?.length)initRouteComparison(window.incantoRoutes)});