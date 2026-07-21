window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>initStaticRoadMap().catch(console.error),0));

async function initStaticRoadMap(){
  const old=document.querySelector('#italyRouteMap');
  if(!old||typeof L==='undefined')return;
  const fresh=old.cloneNode(false);old.replaceWith(fresh);
  const [routeResponses,geometryResponse]=await Promise.all([
    Promise.all(routeMapFiles.map(file=>fetch(file))),
    fetch('route-geometries.json?v=20260721-2')
  ]);
  const blocks=await Promise.all(routeResponses.map(r=>r.ok?r.json():[]));
  const mapRoutes=blocks.flat();
  const geometryData=geometryResponse.ok?await geometryResponse.json():{routes:{}};
  if(!mapRoutes.length)return;

  const map=L.map(fresh,{zoomControl:true,scrollWheelZoom:false,minZoom:5,maxZoom:13,tap:true,touchZoom:true}).setView([42.6,12.5],6);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20,attribution:'&copy; OpenStreetMap &copy; CARTO'}).addTo(map);
  const routeLayer=L.layerGroup().addTo(map);let current=0;
  const title=document.querySelector('#routeMapTitle'),meta=document.querySelector('#routeMapMeta'),summary=document.querySelector('#routeMapSummary'),stops=document.querySelector('#routeMapStops'),count=document.querySelector('#routeMapCount'),select=document.querySelector('#routeMapSelect'),open=document.querySelector('#routeMapOpen');
  select.innerHTML=mapRoutes.map((r,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${r.title}</option>`).join('');

  function show(index){
    current=(index+mapRoutes.length)%mapRoutes.length;
    const route=mapRoutes[current];
    const mapped=route.stops.map(name=>({name,coord:pointFor(name)})).filter(x=>x.coord);
    const stored=geometryData.routes?.[route.id];
    routeLayer.clearLayers();
    mapped.forEach((p,i)=>L.marker(p.coord,{icon:markerIcon(i,mapped.length)}).bindPopup(`<strong>${p.name}</strong><br>${i===0?'Start der Route':i===mapped.length-1?'Ende der Route':`Stopp ${i+1}`}`).addTo(routeLayer));

    const bounds=[];
    const road=Array.isArray(stored?.road)&&stored.road.length>1?stored.road:mapped.map(p=>p.coord);
    if(road.length>1){
      L.polyline(road,{color:'#b58a47',weight:4,opacity:.92,lineJoin:'round'}).addTo(routeLayer);
      bounds.push(...road);
    }
    if(stored?.accessFerry){
      const ferry=[stored.accessFerry.from.coord,stored.accessFerry.to.coord];
      L.polyline(ferry,{color:'#806c50',weight:3,opacity:.9,dashArray:'8 9'}).bindPopup(stored.accessFerry.label).addTo(routeLayer);
      L.circleMarker(ferry[0],{radius:5,color:'#806c50',fillColor:'#fffaf2',fillOpacity:1,weight:2}).bindPopup(`<strong>${stored.accessFerry.from.name}</strong><br>${stored.accessFerry.label}`).addTo(routeLayer);
      bounds.push(...ferry);
    }
    if(bounds.length)map.fitBounds(L.latLngBounds(bounds).pad(.15),{animate:true,maxZoom:8});else map.setView([42.6,12.5],6);
    count.textContent=`Route ${current+1} von ${mapRoutes.length}`;
    title.textContent=route.title;meta.textContent=`${route.days} · ${route.region} · ${route.distance}`;summary.textContent=route.summary;
    stops.innerHTML=mapped.map((p,i)=>`<li><span>${i+1}</span>${p.name}</li>`).join('');select.value=String(current);
    open.onclick=()=>{if(typeof window.openRoute==='function')window.openRoute(route.id);else document.querySelector(`[data-id="${route.id}"]`)?.click()};
  }

  document.querySelector('#routeMapPrev').onclick=()=>show(current-1);
  document.querySelector('#routeMapNext').onclick=()=>show(current+1);
  select.onchange=()=>show(Number(select.value));
  show(0);setTimeout(()=>map.invalidateSize(),200);
}
