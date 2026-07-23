async function initEditorialHighlights(){
  const attimi=document.querySelector('#attimiGrid'),funds=document.querySelector('#fundstueckeGrid');
  if(!attimi||!funds)return;
  try{
    const responses=await Promise.all([fetch('editorial-highlights.json?v=20260723-1'),fetch('editorial-highlights-extended.json?v=20260723-2')]);
    if(!responses[0].ok)throw new Error('Redaktionelle Inhalte konnten nicht geladen werden.');
    const blocks=await Promise.all(responses.map(response=>response.ok?response.json():[]));
    const items=blocks.flat();
    const imageKeywords=item=>`${item.place},${item.title},Italy`.replace(/[’']/g,'').replace(/\s+/g,',');
    const imageFor=(item,index)=>`https://loremflickr.com/1200/800/${encodeURIComponent(imageKeywords(item))}?lock=${index+101}`;
    const card=(item,index)=>`<article class="curated-card"><img src="${imageFor(item,index)}" alt="${item.title} – ${item.place}" loading="lazy"><div class="curated-copy"><span class="eyebrow">${item.region}</span><h3>${item.title}</h3><p class="curated-place">${item.place}</p><p>${item.description}</p><p class="curated-why"><strong>Warum hier:</strong> ${item.why}</p><button type="button" data-open-route="${item.routeId}">PASSENDE ROUTE ÖFFNEN →</button></div></article>`;
    const attimiItems=items.filter(item=>item.category==='attimo'),fundItems=items.filter(item=>item.category==='fund');
    const uniqueIds=list=>[...new Set(list.map(item=>item.routeId))];
    attimi.innerHTML=attimiItems.map((item,index)=>card(item,index)).join('');
    funds.innerHTML=fundItems.map((item,index)=>card(item,index+attimiItems.length)).join('');
    attimi.querySelectorAll('[data-open-route]').forEach(button=>button.addEventListener('click',()=>window.openRoute?.(button.dataset.openRoute,{source:'attimi',ids:uniqueIds(attimiItems)})));
    funds.querySelectorAll('[data-open-route]').forEach(button=>button.addEventListener('click',()=>window.openRoute?.(button.dataset.openRoute,{source:'fundstuecke',ids:uniqueIds(fundItems)})));
  }catch(error){attimi.innerHTML=`<p>${error.message}</p>`;funds.innerHTML=`<p>${error.message}</p>`}
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initEditorialHighlights,{once:true});else initEditorialHighlights();