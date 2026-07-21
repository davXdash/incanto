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

const waterLegNames={
  'comer-see-villen':[['Isola Comacina','Lenno','Boot'],['Bellagio','Varenna','Fähre'],['Varenna','Menaggio','Fähre']],
  'lago-maggiore-orta-mailand':[['Stresa','Isola Bella','Schiff'],['Isola Bella','Isola Madre','Schiff'],['Isola Madre','Isola dei Pescatori','Schiff'],['Isola dei Pescatori','Verbania','Schiff']],
  'sizilien-westkueste':[['Trapani','Favignana','Fähre'],['Favignana','Marsala','Rückfahrt über Trapani']],
  'sardinien-suedkueste':[["Sant’Antioco",'Carloforte','Fähre'],['Carloforte',"Sant’Antioco",'Fähre']],
  'venetien-prosecco-lagune':[['Padua','Venedig','Bahn, Bus oder Boot ab äußerer Basis']]
};

function perpendicularDistance(point,start,end){
  const [y,x]=point,[y1,x1]=start,[y2,x2]=end;const dx=x2-x1,dy=y2-y1;
  if(dx===0&&dy===0)return Math.hypot(x-x1,y-y1);
  const t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));
  return Math.hypot(x-(x1+t*dx),y-(y1+t*dy));
}

function simplify(points,tolerance=0.00018){
  if(points.length<3)return points;
  const keep=new Uint8Array(points.length);keep[0]=1;keep[points.length-1]=1;
  const stack=[[0,points.length-1]];
  while(stack.length){
    const [start,end]=stack.pop();let max=0,index=-1;
    for(let i=start+1;i<end;i++){const distance=perpendicularDistance(points[i],points[start],points[end]);if(distance>max){max=distance;index=i;}}
    if(index!==-1&&max>tolerance){keep[index]=1;stack.push([start,index],[index,end]);}
  }
  return points.filter((_,index)=>keep[index]);
}

async function routeGeometry(points){
  const coords=points.map(([lat,lng])=>`${lng},${lat}`).join(';');
  const url=`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
  let lastError;
  for(let attempt=1;attempt<=2;attempt++){
    try{
      const response=await fetch(url,{headers:{'User-Agent':'IncantoRouteGenerator/1.3'},signal:AbortSignal.timeout(30000)});
      if(!response.ok)throw new Error(`OSRM ${response.status}`);
      const data=await response.json();
      if(data.code!=='Ok'||!data.routes?.[0]?.geometry?.coordinates)throw new Error(data.code||'No route');
      return data.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng]);
    }catch(error){lastError=error;if(attempt<2)await delay(1200);}
  }
  throw lastError;
}

async function main(){
  const [routes,coordinates]=await Promise.all([readRoutes(),readCoordinates()]);
  let previous={routes:{}};try{previous=JSON.parse(await fs.readFile('route-geometries.json','utf8'));}catch{}
  const output={generatedAt:new Date().toISOString(),provider:'OSRM/OpenStreetMap',routes:{}};
  const audit={generatedAt:output.generatedAt,totalRoutes:routes.length,routes:{},summary:{road:0,cached:0,mixed:0,missing:0,originalPoints:0,simplifiedPoints:0}};
  for(const route of routes){
    const allStops=route.stops.map(name=>({name,coord:coordinates[normalize(name)]||null}));
    const mapped=allStops.filter(item=>item.coord);const missingStops=allStops.filter(item=>!item.coord).map(item=>item.name);
    if(mapped.length<2){audit.summary.missing++;audit.routes[route.id]={mode:'missing',mappedStops:mapped.length,totalStops:route.stops.length,missingStops};continue;}
    const waterSegments=(waterLegNames[route.id]||[]).map(([from,to,label])=>({coords:[coordinates[normalize(from)],coordinates[normalize(to)]],label})).filter(segment=>segment.coords.every(Boolean));
    const waterPairs=new Set((waterLegNames[route.id]||[]).flatMap(([from,to])=>[`${normalize(from)}>${normalize(to)}`,`${normalize(to)}>${normalize(from)}`]));
    let road=[];let mode='road';let failed=false;
    for(let i=0;i<mapped.length-1;i++){
      const a=mapped[i],b=mapped[i+1];
      if(waterPairs.has(`${normalize(a.name)}>${normalize(b.name)}`))continue;
      try{const segment=await routeGeometry([a.coord,b.coord]);if(road.length&&segment.length)segment.shift();road.push(...segment);}
      catch(error){failed=true;console.warn(`${route.id}: ${a.name} -> ${b.name}: ${error.message}`);break;}
      await delay(450);
    }
    if(failed&&Array.isArray(previous.routes?.[route.id]?.road)&&previous.routes[route.id].road.length>1){road=previous.routes[route.id].road;mode='cached';}
    else if(failed){road=mapped.map(item=>item.coord);mode='mixed';}
    const originalPoints=road.length;const compact=mode==='road'?simplify(road):road;
    output.routes[route.id]={mode,road:compact,waterSegments,accessFerry:accessFerries[route.id]||null};
    audit.summary[mode]++;audit.summary.originalPoints+=originalPoints;audit.summary.simplifiedPoints+=compact.length;
    audit.routes[route.id]={mode,mappedStops:mapped.length,totalStops:route.stops.length,missingStops,originalPoints,simplifiedPoints:compact.length,waterSegments:waterSegments.length,accessFerry:Boolean(accessFerries[route.id])};
    console.log(`${route.id}: ${originalPoints} -> ${compact.length} points (${mode})`);
  }
  if(Object.keys(output.routes).length<routes.length-2)throw new Error(`Only ${Object.keys(output.routes).length} of ${routes.length} routes generated`);
  await Promise.all([fs.writeFile('route-geometries.json',JSON.stringify(output)),fs.writeFile('route-geometry-audit.json',JSON.stringify(audit,null,2))]);
}

main().catch(error=>{console.error(error);process.exit(1)});