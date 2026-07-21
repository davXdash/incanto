import fs from 'node:fs/promises';
import vm from 'node:vm';

const routeFiles=['routes.json','routes-01-established.json','routes-02-established.json','routes-03-established.json','routes-04-established.json','routes-05-established.json'];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const normalize=name=>String(name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/’/g,"'").trim();

async function readRoutes(){const blocks=await Promise.all(routeFiles.map(async file=>JSON.parse(await fs.readFile(file,'utf8'))));return blocks.flat();}
async function readCoordinates(){const source=await fs.readFile('route-map.js','utf8');const match=source.match(/const placeCoordinates=(\{[\s\S]*?\});\nfunction normalizePlace/);if(!match)throw new Error('placeCoordinates not found');return vm.runInNewContext(`(${match[1]})`);}

const accessFerries={
  'sardinien-nordkueste':{from:{name:'Genua',coord:[44.405,8.946]},to:{name:'Porto Torres',coord:[40.835,8.397]},label:'Fähranreise Genua–Porto Torres'},
  'sardinien-suedkueste':{from:{name:'Civitavecchia',coord:[42.093,11.795]},to:{name:'Cagliari',coord:[39.223,9.122]},label:'Fähranreise Civitavecchia–Cagliari'},
  'sizilien-ost-sued':{from:{name:'Villa San Giovanni',coord:[38.215,15.636]},to:{name:'Messina',coord:[38.193,15.554]},label:'Fähre Villa San Giovanni–Messina'},
  'sizilien-westkueste':{from:{name:'Neapel',coord:[40.852,14.268]},to:{name:'Palermo',coord:[38.116,13.361]},label:'Optionale Fähranreise Neapel–Palermo'}
};

async function routeGeometry(points){
  const coords=points.map(([lat,lng])=>`${lng},${lat}`).join(';');
  const url=`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
  let lastError;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const response=await fetch(url,{headers:{'User-Agent':'IncantoRouteGenerator/1.1'},signal:AbortSignal.timeout(45000)});
      if(!response.ok)throw new Error(`OSRM ${response.status}`);
      const data=await response.json();
      if(data.code!=='Ok'||!data.routes?.[0]?.geometry?.coordinates)throw new Error(data.code||'No route');
      return data.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng]);
    }catch(error){lastError=error;if(attempt<3)await delay(1200*attempt);}
  }
  throw lastError;
}

async function main(){
  const [routes,coordinates]=await Promise.all([readRoutes(),readCoordinates()]);
  const output={generatedAt:new Date().toISOString(),provider:'OSRM/OpenStreetMap',routes:{}};
  for(const route of routes){
    const mapped=route.stops.map(name=>({name,coord:coordinates[normalize(name)]||null})).filter(item=>item.coord);
    if(mapped.length<2){console.warn(`${route.id}: fewer than two mapped stops`);continue;}
    let road=[];let mode='road';
    try{road=await routeGeometry(mapped.map(item=>item.coord));}
    catch(error){
      console.warn(`${route.id}: full route failed, falling back to segments (${error.message})`);mode='mixed';
      for(let i=0;i<mapped.length-1;i++){
        const a=mapped[i].coord,b=mapped[i+1].coord;
        try{const segment=await routeGeometry([a,b]);if(road.length&&segment.length)segment.shift();road.push(...segment);}
        catch(segmentError){road.push(a,b);mode='approximate';}
        await delay(400);
      }
    }
    output.routes[route.id]={mode,road,accessFerry:accessFerries[route.id]||null};
    console.log(`${route.id}: ${road.length} points (${mode})`);
    await delay(650);
  }
  if(Object.keys(output.routes).length<routes.length-2)throw new Error(`Only ${Object.keys(output.routes).length} of ${routes.length} routes generated`);
  await fs.writeFile('route-geometries.json',JSON.stringify(output));
}

main().catch(error=>{console.error(error);process.exit(1)});