const mapToolRouteFiles=['routes.json','routes-01-established.json','routes-02-established.json','routes-03-established.json','routes-04-established.json','routes-05-established.json'];

function normalizeMapTool(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/’/g,"'").trim()}

async function initRouteMapTools(){
  const input=document.querySelector('#routeCitySearch');
  const results=document.querySelector('#routeCityResults');
  const select=document.querySelector('#routeMapSelect');
  if(!input||!results||!select)return;

  const responses=await Promise.all(mapToolRouteFiles.map(file=>fetch(file)));
  const blocks=await Promise.all(responses.map(response=>response.ok?response.json():[]));
  const routes=blocks.flat();
  if(!routes.length)return;

  const cityIndex=new Map();
  routes.forEach((route,index)=>route.stops.forEach(stop=>{
    const key=normalizeMapTool(stop);
    if(!cityIndex.has(key))cityIndex.set(key,{label:stop,routes:[]});
    const entry=cityIndex.get(key);
    if(!entry.routes.some(item=>item.id===route.id))entry.routes.push({...route,index});
  }));

  const cities=[...cityIndex.values()].sort((a,b)=>a.label.localeCompare(b.label,'de'));
  const dataList=document.querySelector('#routeCityList');
  if(dataList)dataList.innerHTML=cities.map(city=>`<option value="${city.label}"></option>`).join('');

  function activateRoute(index){
    select.value=String(index);
    select.dispatchEvent(new Event('change',{bubbles:true}));
    document.querySelector('#route-map')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderMatches(matches){
    if(!matches.length){results.innerHTML='<p class="route-city-empty">Kein Ort in den bisherigen Hauptstopps gefunden.</p>';return}
    results.innerHTML=matches.map(city=>`<section><h4>${city.label}</h4><div>${city.routes.map(route=>`<button type="button" data-route-index="${route.index}">${route.title}<small>${route.region} · ${route.days}</small></button>`).join('')}</div></section>`).join('');
    results.querySelectorAll('[data-route-index]').forEach(button=>button.addEventListener('click',()=>activateRoute(Number(button.dataset.routeIndex))));
  }

  function search(){
    const query=normalizeMapTool(input.value);
    if(!query){results.innerHTML='';return}
    renderMatches(cities.filter(city=>normalizeMapTool(city.label).includes(query)).slice(0,8));
  }

  input.addEventListener('input',search);
  input.addEventListener('change',search);
  window.addEventListener('incanto:place-selected',event=>{
    const label=event.detail?.place;
    if(!label)return;
    input.value=label;
    const exact=cityIndex.get(normalizeMapTool(label));
    renderMatches(exact?[exact]:[]);
  });
}

window.addEventListener('DOMContentLoaded',()=>initRouteMapTools().catch(error=>console.error('Kartensuche konnte nicht geladen werden',error)));