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
}
window.addEventListener('DOMContentLoaded',initIncantoExtras);