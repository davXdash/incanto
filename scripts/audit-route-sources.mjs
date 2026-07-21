import fs from 'node:fs/promises';

const routeFiles=['routes.json','routes-01-established.json','routes-02-established.json','routes-03-established.json','routes-04-established.json','routes-05-established.json'];
const detailFiles=['route-details-01.json','route-details-02.json','route-details-03.json','route-details-04.json','route-details-05.json','route-details-06.json','route-details-07.json','route-details-09.json','route-details-10.json'];
const genericPatterns=[/\/reiserouten\/?$/i,/\/things-to-do\/itineraries\/?$/i,/\/mit-dem-wohnmobil\/italien\/?$/i,/\/wohnmobil-tour-italien\/?$/i,/\/wohnmobil-routenplaner\/?$/i];

const readJson=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const cleanUrl=url=>String(url||'').trim().replace(/\/$/,'');

async function main(){
  const routeBlocks=await Promise.all(routeFiles.map(readJson));
  const detailBlocks=await Promise.all(detailFiles.map(readJson));
  const routes=routeBlocks.flat();
  const details=Object.assign({},...detailBlocks);
  const report={generatedAt:new Date().toISOString(),totalRoutes:routes.length,summary:{complete:0,missing:0,generic:0,duplicates:0},routes:{}};

  for(const route of routes){
    const all=[...(details[route.id]?.sources||[]),route.source,route.source2].filter(item=>item?.name&&item?.url);
    const unique=[];const seen=new Set();let duplicates=0;
    for(const source of all){const key=cleanUrl(source.url).toLowerCase();if(seen.has(key)){duplicates++;continue}seen.add(key);unique.push({name:source.name,url:source.url});}
    const generic=unique.filter(source=>genericPatterns.some(pattern=>pattern.test(cleanUrl(source.url))));
    const missing=unique.length<2;
    if(missing)report.summary.missing++;else report.summary.complete++;
    report.summary.generic+=generic.length;report.summary.duplicates+=duplicates;
    report.routes[route.id]={title:route.title,sourceCount:unique.length,duplicatesRemoved:duplicates,genericLinks:generic,sources:unique,status:missing?'missing':generic.length?'review':'complete'};
  }

  await fs.writeFile('route-source-audit.json',JSON.stringify(report,null,2));
}

main().catch(error=>{console.error(error);process.exit(1)});