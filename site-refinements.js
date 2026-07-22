let desiderioJumpOrigin=null;
let desiderioHighlights=[];

function rememberJumpOrigin(event){
  const link=event.target.closest('a[href^="#"],[data-route-filter],[data-scroll-target]');
  if(!link||link.closest('.dialog-jump-nav'))return;
  const target=link.dataset.scrollTarget||link.getAttribute('href');
  if(!target||target==='#'||!document.querySelector(target))return;
  desiderioJumpOrigin={y:window.scrollY,element:link};
  document.querySelector('#backToTop')?.classList.add('has-return-point');
}

document.addEventListener('click',rememberJumpOrigin,true);

function bindContextualBackButton(){
  const button=document.querySelector('#backToTop');
  if(!button)return;
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    if(desiderioJumpOrigin){
      const target=desiderioJumpOrigin;
      desiderioJumpOrigin=null;
      button.classList.remove('has-return-point');
      window.scrollTo({top:target.y,behavior:'smooth'});
      setTimeout(()=>target.element?.focus?.({preventScroll:true}),450);
    }else{
      window.scrollTo({top:0,behavior:'smooth'});
    }
  },true);
}

function routeNumber(routeId){
  const index=(window.incantoRoutes||[]).findIndex(route=>route.id===routeId);
  return index>=0?index+1:null;
}

function decorateRouteNumbers(){
  document.querySelectorAll('.route-card[data-id]').forEach(card=>{
    const number=routeNumber(card.dataset.id);
    if(!number)return;
    let badge=card.querySelector('.route-number-badge');
    if(!badge){badge=document.createElement('span');badge.className='route-number-badge';card.appendChild(badge)}
    badge.textContent=String(number).padStart(2,'0');
    badge.setAttribute('aria-label',`Route ${number}`);
  });
}

function applyEditorialHeartBalance(){
  const ratings=window.DESIDERIO_HEARTS||{};
  (window.incantoRoutes||[]).forEach(route=>{route.meta=route.meta||{};if(ratings[route.id])route.meta.hearts=ratings[route.id]});
  document.querySelectorAll('.route-card[data-id]').forEach(card=>{
    const count=ratings[card.dataset.id];
    if(!count)return;
    const hearts=card.querySelector('.route-hearts');
    if(hearts){hearts.textContent='♥'.repeat(count)+'♡'.repeat(5-count);hearts.setAttribute('aria-label',`${count} von 5 Herzen`)}
  });
}

function curatedForRoute(routeId){return desiderioHighlights.filter(item=>item.routeId===routeId)}
function curatedSection(routeId){
  const items=curatedForRoute(routeId);
  if(!items.length)return null;
  const details=document.createElement('details');
  details.className='longform-section collapsible-section curated-route-section';
  details.id='dialog-kuration';
  details.open=true;
  details.innerHTML=`<summary><span>Attimi d’Incanto & Fundstücke dieser Route</span><i aria-hidden="true">+</i></summary><div class="section-content curated-route-grid">${items.map(item=>`<article><span class="eyebrow">${item.category==='attimo'?'ATTIMO D’INCANTO':'FUNDSTÜCK'}</span><h4>${item.title}</h4><p class="curated-place">${item.place}</p><p>${item.description}</p><p><strong>Warum hier:</strong> ${item.why}</p></article>`).join('')}</div>`;
  return details;
}

function injectCuratedIntoDialog(route){
  const body=document.querySelector('#dialogContent .dialog-body');
  if(!body||body.querySelector('#dialog-kuration'))return;
  const section=curatedSection(route.id);
  if(!section)return;
  const sources=body.querySelector('#dialog-quellen');
  if(sources)sources.before(section);else body.appendChild(section);
  const nav=body.querySelector('.dialog-jump-nav');
  if(nav&&!nav.querySelector('[href="#dialog-kuration"]')){
    const link=document.createElement('a');link.href='#dialog-kuration';link.textContent='Besondere Funde';
    link.onclick=event=>{event.preventDefault();section.open=true;section.scrollIntoView({behavior:'smooth',block:'start'})};
    nav.appendChild(link);
  }
}

async function loadEditorialHighlights(){
  try{const response=await fetch('editorial-highlights.json?v=20260722-2');if(response.ok)desiderioHighlights=await response.json()}catch{}
}

function refreshRefinements(){decorateRouteNumbers();applyEditorialHeartBalance()}

async function initSiteRefinements(){
  bindContextualBackButton();
  await loadEditorialHighlights();
  refreshRefinements();
  window.addEventListener('incanto:routes-ready',refreshRefinements);
  window.addEventListener('incanto:dialog-route-changed',event=>injectCuratedIntoDialog(event.detail.route));
  const grid=document.querySelector('#routeGrid');
  if(grid)new MutationObserver(()=>requestAnimationFrame(refreshRefinements)).observe(grid,{childList:true});
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initSiteRefinements,{once:true});else initSiteRefinements();