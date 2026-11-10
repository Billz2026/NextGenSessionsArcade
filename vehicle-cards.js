'use strict';
/* One shared real-photographic card system for all game departments. */
(() => {
  const P=window.MotorTradePhotos;
  if(!P)throw new Error('vehicle-photos.js must load before vehicle-cards.js');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(Number(n)||0);
  const mileage=n=>new Intl.NumberFormat('en-GB').format(Number(n)||0)+' mi';
  const kindText={
    auction:'AUCTION',seller:'PRIVATE SELLER','part-ex':'PART-EXCHANGE',
    stock:'VEHICLE STOCK',workshop:'WORKSHOP',sold:'SOLD',
    reserved:'RESERVED',walkin:'WALK-IN SELLER'
  };
  const moneyLine=(label,value)=>'<div class="vehicle-card-money"><small>'+
    esc(label)+'</small><strong>'+money(value)+'</strong></div>';
  function photo(car,source='stock'){
    const shot=P.select(car),name=esc(car?.title||'Vehicle');
    const label=kindText[source]||esc(source).toUpperCase();
    const grade=car?.profile?.grade||car?.grade||3;
    const shown=shot?
      '<img src="'+esc(P.url(shot))+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" '+
      'alt="Real representative photograph of a '+esc(car.color)+' '+esc(shot.model)+
      ' '+esc(shot.generation)+'; not the fictional game vehicle" data-vehicle-photo="true">'+
      '<div class="vehicle-photo-missing vehicle-photo-failed" hidden>'+
      '<span aria-hidden="true">▱</span><strong>PHOTO UNAVAILABLE</strong>'+
      '<small>Image could not be loaded. Vehicle details remain available.</small></div>':
      '<div class="vehicle-photo-missing"><span aria-hidden="true">▱</span>'+
      '<strong>PHOTO UNAVAILABLE</strong>'+
      '<small>No verified '+esc(car?.color||'colour')+' '+esc(P.identity(car).model)+
      ' image for this generation</small></div>';
    const credit=shot?
      '<div class="vehicle-photo-credit"><a href="'+esc(P.source(shot))+
      '" target="_blank" rel="noopener noreferrer">REAL PHOTO: '+esc(shot.author)+'</a>'+
      ' · <a href="'+esc(shot.licenseUrl)+
      '" target="_blank" rel="noopener noreferrer">'+esc(shot.license)+'</a>'+
      '<span>Display-cropped only · '+esc(shot.note)+'</span></div>':
      '<div class="vehicle-photo-credit"><span>No incorrect or synthetic substitute used</span></div>';
    return '<div class="vehicle-photo-block">'+
      '<div class="vehicle-photo-frame">'+shown+
      '<span class="vehicle-origin-tag">'+esc(label)+'</span>'+
      '<span class="vehicle-grade-tag">GRADE '+esc(grade)+'</span></div>'+credit+'</div>';
  }
  function heading(car,source='stock',identifier=''){
    const id=P.identity(car);
    return photo(car,source)+
      '<div class="vehicle-card-heading"><div><small>'+
      esc(identifier||kindText[source]||source)+'</small><h3>'+esc(car.title)+'</h3>'+
      '<p>'+esc(car.color||'Colour unverified')+' · '+esc(id.generation)+
      ' · '+esc(car.fuel||'Fuel unverified')+' · '+esc(car.gearbox||'Gearbox unverified')+
      '</p></div></div>'+
      '<div class="vehicle-card-statline">'+
      '<div><small>MILEAGE</small><strong>'+mileage(car.miles)+'</strong></div>'+
      '<div><small>OWNERS</small><strong>'+esc(car.profile?.owners??'—')+'</strong></div>'+
      '<div><small>MOT</small><strong>'+(Number.isSafeInteger(car.profile?.mot?.monthsRemaining)?
      esc(car.profile.mot.monthsRemaining)+' months':'Unknown')+'</strong></div></div>';
  }
  function mini(car,source='part-ex'){
    if(!car)return '';
    const id=P.identity(car);
    return '<div class="vehicle-mini">'+photo(car,source)+
      '<div class="vehicle-mini-copy"><strong>'+esc(car.title)+'</strong>'+
      '<span>'+esc(car.color||'Unknown')+' · '+esc(id.generation)+
      ' · '+mileage(car.miles)+'</span></div></div>';
  }
  // Image errors do not bubble: capture them for cards inserted on later game days.
  document.addEventListener('error',event=>{
    const img=event.target;
    if(img?.tagName!=='IMG'||!img.hasAttribute('data-vehicle-photo'))return;
    const fallback=img.nextElementSibling;
    if(!fallback?.classList.contains('vehicle-photo-failed'))return;
    img.hidden=true;
    fallback.hidden=false;
  },true);
  window.MotorTradeCards=Object.freeze({photo,heading,mini,moneyLine,esc,money});
})();