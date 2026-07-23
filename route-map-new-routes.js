async function initNewRouteGeometryOverlay(){
  const original=document.querySelector('#italyRouteMap'),canvas=original?.parentElement,select=document.querySelector('#routeMapSelect');
  if(!original||!canvas||!select||typeof L==='undefined')return;
  const [routeResponse,geometryResponse]=await Promise.all([fetch('routes-06-established.json?v=20260723-2'),fetch('route-geometries-new.json?v=20260723-1')]);
  if(!routeResponse.ok||!geometryResponse.ok)return;
  const newRoutes=await routeResponse.json(),geometry=(await geometryResponse.json()).routes||{},ids=new Set(newRoutes.map(route=>route.id));
  const overlay=document.createElement('div');overlay.className='new-route-map-overlay';overlay.setAttribute('aria-hidden','true');canvas.appendChild(overlay);
  const map=L.map(overlay,{zoomControl:true,scrollWheelZoom:false,minZoom:5,maxZoom:13,tap:true,touchZoom:true}).setView([42.6,12.5],6);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20,attribution:'&copy; OpenStreetMap &copy; CARTO'}).addTo(map);
  const layer=L.layerGroup().addTo(map);
  function selectedRoute(){const title=document.querySelector('#routeMapTitle')?.textContent.trim();return newRoutes.find(route=>route.title===title)}
  function draw(){
    const route=selectedRoute();
    if(!route||!ids.has(route.id)){overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');return}
    overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');layer.clearLayers();
    const data=geometry[route.id]||{},bounds=[];
    if(Array.isArray(data.road)&&data.road.length>1){L.polyline(data.road,{color:'#b58a47',weight:4,opacity:.94,lineJoin:'round'}).bindPopup('Straßenverlauf zwischen den Hauptstopps').addTo(layer);bounds.push(...data.road)}
    (data.waterSegments||[]).forEach(segment=>{if(!Array.isArray(segment.coords)||segment.coords.length<2)return;L.polyline(segment.coords,{color:'#806c50',weight:3,opacity:.95,dashArray:'8 9'}).bindPopup(segment.label||'Fähr- oder Bootsverbindung').addTo(layer);bounds.push(...segment.coords)});
    if(data.accessFerry){const ferry=[data.accessFerry.from.coord,data.accessFerry.to.coord];L.polyline(ferry,{color:'#806c50',weight:3,opacity:.95,dashArray:'8 9'}).bindPopup(data.accessFerry.label).addTo(layer);bounds.push(...ferry)}
    if(bounds.length)map.fitBounds(L.latLngBounds(bounds).pad(.14),{animate:false,maxZoom:8});
    requestAnimationFrame(()=>map.invalidateSize());
  }
  new MutationObserver(draw).observe(document.querySelector('#routeMapTitle'),{childList:true,characterData:true,subtree:true});
  select.addEventListener('change',()=>setTimeout(draw,0));
  document.querySelector('#routeMapPrev')?.addEventListener('click',()=>setTimeout(draw,0));
  document.querySelector('#routeMapNext')?.addEventListener('click',()=>setTimeout(draw,0));
  draw();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>initNewRouteGeometryOverlay().catch(console.error),{once:true});else initNewRouteGeometryOverlay().catch(console.error);