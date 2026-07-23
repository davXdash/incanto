function applyDesiderioVisualFixes(){
  const heroCopy=document.querySelector('.hero-copy');
  if(heroCopy){
    const description=heroCopy.querySelector('p');
    if(description)description.innerHTML='<strong>Desiderio – Sehnsucht, Wunsch, Verlangen.</strong><br>Desiderio ist der Anfang: das Gefühl, einen Ort, einen Geschmack oder ein gemeinsames Erlebnis nicht nur interessant zu finden, sondern wirklich erleben zu wollen.';
    const scriptLine=heroCopy.querySelector('.script-line');
    const scriptCaption=heroCopy.querySelector('.script-caption');
    scriptLine?.classList.add('hero-art-of-living');
    scriptCaption?.classList.add('hero-art-caption');
  }
  const story=document.querySelector('.brand-story');
  if(story){
    const heading=story.querySelector('.section-heading');
    const intro=heading?.querySelector('p');
    if(intro)intro.innerHTML='<span class="brand-transition">Desiderio → Incanto</span>';
    const articles=[...story.querySelectorAll('.brand-story-grid article')];
    articles.find(article=>article.querySelector('.eyebrow')?.textContent.trim()==='DESIDERIO')?.remove();
    const incanto=articles.find(article=>article.querySelector('.eyebrow')?.textContent.trim()==='INCANTO');
    incanto?.classList.add('incanto-definition-compact');
  }
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',applyDesiderioVisualFixes,{once:true});else applyDesiderioVisualFixes();