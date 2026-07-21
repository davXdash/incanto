function initIncantoExtras(){
  const topButton=document.querySelector('#backToTop');
  if(topButton){
    const update=()=>topButton.classList.toggle('visible',window.scrollY>520);
    window.addEventListener('scroll',update,{passive:true});
    topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    update();
  }
  document.querySelectorAll('[data-open-route]').forEach(button=>button.addEventListener('click',()=>window.openRoute?.(button.dataset.openRoute)));
  document.querySelectorAll('[data-route-filter]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();
    const key=link.dataset.routeFilter;
    document.querySelector('#routes')?.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>window.applyRouteFilter?.(key),280);
  }));
  document.querySelectorAll('[data-scroll-target]').forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();
    document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  const favoriteCard=[...document.querySelectorAll('.journey-grid article')].find(card=>card.querySelector('h3')?.textContent.trim()==='Unsere Lieblingsrouten');
  if(favoriteCard){
    const link=favoriteCard.querySelector('a');
    const text=favoriteCard.querySelector('p');
    if(link){link.href='lieblingsrouten.html';link.textContent='LIEBLINGSROUTEN AUSWÄHLEN →'}
    if(text)text.textContent='Wählt getrennt bis zu vier Routen, tauscht eure Stände aus und findet Schritt für Schritt eure Finalisten.';
  }
  const requestedRoute=new URLSearchParams(location.search).get('route');
  if(requestedRoute){
    const openRequested=()=>setTimeout(()=>window.openRoute?.(requestedRoute),80);
    if(window.incantoRoutes?.length)openRequested();else window.addEventListener('incanto:routes-ready',openRequested,{once:true});
  }
}
window.addEventListener('DOMContentLoaded',initIncantoExtras);