/* ──────────────────────────────────────────
   CURSOR (AMBIENT GLOW ONLY)
────────────────────────────────────────── */
const glow=document.getElementById('mouse-glow');
const isMobile='ontouchstart' in window;
if(isMobile && glow){
  glow.style.display='none';
} else if(glow) {
  let tickingCursor = false;
  document.addEventListener('mousemove', e => {
    if (!tickingCursor) {
      requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        tickingCursor = false;
      });
      tickingCursor = true;
    }
  }, {passive:true});
}

/* ──────────────────────────────────────────
   NAV SCROLL
────────────────────────────────────────── */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>80),{passive:true});

/* ──────────────────────────────────────────
   REVEAL ON SCROLL
────────────────────────────────────────── */
const ro=new IntersectionObserver(es=>{
  es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');ro.unobserve(e.target)}})
},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.r').forEach(el=>ro.observe(el));

/* ──────────────────────────────────────────
   STAT COUNTERS
────────────────────────────────────────── */
function animCount(el,target,dur,decimals=0,suffix=''){
  if(!el)return;
  let start=performance.now();
  (function step(now){
    let p=Math.min((now-start)/dur,1);
    p=1-Math.pow(1-p,4);
    const val=target*p;
    el.textContent=decimals>0?val.toFixed(decimals):Math.round(val);
    if(p<1)requestAnimationFrame(step);
    else el.textContent=decimals>0?target.toFixed(decimals):target;
  })(start);
}
setTimeout(()=>{
  animCount(document.getElementById('sn1'),800,1800);
  animCount(document.getElementById('sn2'),7,1500);
  animCount(document.getElementById('sn3'),4.9,2000,1);
},1200);

/* ──────────────────────────────────────────
   MAGNETIC BUTTONS
────────────────────────────────────────── */
document.querySelectorAll('.mag-btn').forEach(btn=>{
  const fill=btn.querySelector('.mag-btn-fill');
  let r=null;
  btn.addEventListener('pointerenter',()=>{
    r=btn.getBoundingClientRect();
  });
  btn.addEventListener('mousemove',e=>{
    if(!r)r=btn.getBoundingClientRect();
    const x=e.clientX-r.left-r.width/2;
    const y=e.clientY-r.top-r.height/2;
    btn.style.transform=`translate(${x*.18}px,${y*.18}px)`;
    if(fill)fill.style.transform=`translate(${x*.08}px,${y*.08}px)`;
  });
  btn.addEventListener('mouseleave',()=>{
    btn.style.transform='';
    if(fill)fill.style.transform='';
    r=null;
  });
});

/* ──────────────────────────────────────────
   PARALLAX (desktop only)
────────────────────────────────────────── */
if(!isMobile){
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(!ticking){
      requestAnimationFrame(()=>{
        const sy=scrollY;
        const hero=document.querySelector('.hero-canvas');
        if(hero)hero.style.transform=`translateY(${sy*.25}px)`;
        const orbs=document.querySelectorAll('.orb');
        orbs.forEach((o,i)=>o.style.transform=`translateY(${sy*(i%2===0?.12:-.1)}px)`);
        ticking=false;
      });
      ticking=true;
    }
  },{passive:true});
}

/* ──────────────────────────────────────────
   FOCUS RAIL 3D CAROUSEL (GSAP)
────────────────────────────────────────── */
const railItems = [
  { id: 1, title: "Nude Refinado", meta: "Gel Premium", description: "Aplicação em gel com finalização nude pêssego e detalhes em rose gold. Durabilidade de 4 semanas.", imageSrc: "images/manicure.jpeg" },
  { id: 2, title: "Rose Gold Metálico", meta: "Nail Art", description: "Esmalte metálico rose gold com efeito espelhado. Acabamento cinema com top coat brilhante especial.", imageSrc: "images/pe1.jpeg" },
  { id: 3, title: "Francesa Moderna", meta: "Clássico Premium", description: "Releitura contemporânea da francesa clássica com linhas ultrafinas e acabamento acetinado.", imageSrc: "images/pe2.jpeg" },
  { id: 4, title: "Nail Art Floral", meta: "Arte Manual", description: "Composição floral pintada à mão com técnica aquarela e detalhes em pó cromado dourado.", imageSrc: "images/pe3.jpeg" },
  { id: 5, title: "Espelhado Premium", meta: "Cromado", description: "Efeito espelhado com pó chrome de alto brilho. Acabamento que reflete luz de forma cinematográfica.", imageSrc: "images/pe4.jpeg" },
  { id: 6, title: "Stiletto Exclusivo", meta: "Design Editorial", description: "Formato stiletto com nail art exclusiva geométrica e partículas douradas. Peça única, criada especialmente.", imageSrc: "images/pe5.jpeg" }
];

let activeIndex = 0;
const totalCount = railItems.length;

const railContainer = document.getElementById("focus-rail");
const railTrack = document.getElementById("rail-track");
const railCards = document.querySelectorAll(".rail-card");
const railMeta = document.getElementById("rail-meta");
const railTitle = document.getElementById("rail-title");
const railDesc = document.getElementById("rail-desc");
const railCounter = document.getElementById("rail-counter");
const railBtnPrev = document.getElementById("rail-btn-prev");
const railBtnNext = document.getElementById("rail-btn-next");
const railBtnExplore = document.getElementById("rail-btn-explore");
const railBgLayers = [
  document.querySelector(".rail-bg-ambience .layer-1"),
  document.querySelector(".rail-bg-ambience .layer-2")
];

function wrapIndex(v, max) {
  return ((v % max) + max) % max;
}

let activeBgLayer = 0;
function updateRail(direction = 0) {
  activeIndex = wrapIndex(activeIndex, totalCount);
  const activeItem = railItems[activeIndex];

  // 1. Text & metadata update with fade + blur animation
  gsap.killTweensOf([railMeta, railTitle, railDesc]);
  gsap.timeline()
    .to([railMeta, railTitle, railDesc], { opacity: 0, y: direction * 10, filter: "blur(4px)", duration: 0.12, ease: "power2.in" })
    .call(() => {
      railMeta.textContent = activeItem.meta || "";
      railTitle.textContent = activeItem.title || "";
      railDesc.textContent = activeItem.description || "";
      railCounter.textContent = `${activeIndex + 1} / ${totalCount}`;
      
      const waText = encodeURIComponent(`Olá Julia, gostaria de agendar um horário para fazer o design de portfólio: "${activeItem.title}" (${activeItem.meta})`);
      railBtnExplore.href = `https://wa.me/5511999999999?text=${waText}`;
    })
    .to([railMeta, railTitle, railDesc], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power2.out", stagger: 0.04 });

  // 2. Ambience Background Crossfade
  const inactiveBgLayer = activeBgLayer === 0 ? 1 : 0;
  const activeLayerEl = railBgLayers[activeBgLayer];
  const inactiveLayerEl = railBgLayers[inactiveBgLayer];

  if (activeLayerEl && inactiveLayerEl) {
    inactiveLayerEl.style.backgroundImage = `url('${activeItem.imageSrc}')`;
    gsap.to(inactiveLayerEl, { opacity: 0.35, duration: 0.8, ease: "power2.out" });
    gsap.to(activeLayerEl, { opacity: 0, duration: 0.8, ease: "power2.out" });
    activeBgLayer = inactiveBgLayer;
  }

  // 3. 3D Card transforms
  const isMobileViewport = window.innerWidth < 768;
  const cardGap = isMobileViewport ? 190 : 270;

  railCards.forEach((card, index) => {
    let diff = index - activeIndex;
    if (diff > totalCount / 2) diff -= totalCount;
    if (diff < -totalCount / 2) diff += totalCount;

    const isCenter = diff === 0;
    const dist = Math.abs(diff);

    const xOffset = diff * cardGap;
    const zOffset = -dist * 160;
    const scale = isCenter ? 1 : 0.82;
    const rotateY = diff * -18;

    const opacity = isCenter ? 1 : Math.max(0.05, 1 - dist * 0.45);
    const blur = isCenter ? 0 : dist * 5;
    const brightness = isCenter ? 1 : 0.45;
    const zIndex = 10 - dist;

    card.classList.toggle("active", isCenter);

    gsap.killTweensOf(card);
    gsap.to(card, {
      x: xOffset,
      z: zOffset,
      scale: scale,
      rotateY: rotateY,
      opacity: opacity,
      filter: `blur(${blur}px) brightness(${brightness})`,
      zIndex: zIndex,
      pointerEvents: dist <= 2 ? "auto" : "none",
      duration: 0.65,
      ease: isCenter ? "back.out(1.15)" : "power3.out"
    });
  });
}

const handlePrev = () => {
  activeIndex--;
  updateRail(-1);
};
const handleNext = () => {
  activeIndex++;
  updateRail(1);
};

if (railBtnPrev) railBtnPrev.addEventListener("click", handlePrev);
if (railBtnNext) railBtnNext.addEventListener("click", handleNext);

// Click on side cards to focus
railCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    let diff = index - activeIndex;
    if (diff > totalCount / 2) diff -= totalCount;
    if (diff < -totalCount / 2) diff += totalCount;

    if (diff !== 0) {
      activeIndex += diff;
      updateRail(diff > 0 ? 1 : -1);
    }
  });
});

// Mouse wheel / Trackpad support
let lastWheelTime = 0;
if (railContainer) {
  railContainer.addEventListener("wheel", (e) => {
    const now = Date.now();
    if (now - lastWheelTime < 450) return;

    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = isHorizontal ? e.deltaX : e.deltaY;

    if (Math.abs(delta) > 20) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastWheelTime = now;
    }
  }, { passive: true });
}

// Keyboard arrows navigation
if (railContainer) {
  railContainer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      handleNext();
      e.preventDefault();
    }
  });
}

// Drag & swipe support
const trackWrapper = document.querySelector(".rail-track-wrapper");
if (trackWrapper) {
  let startX = 0;
  let startTime = 0;
  let isDragging = false;

  trackWrapper.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    startTime = Date.now();
    isDragging = true;
  });

  trackWrapper.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const dragDistance = currentX - startX;
    gsap.set(railTrack, { x: dragDistance * 0.15 });
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.clientX;
    const deltaX = endX - startX;
    const deltaTime = Date.now() - startTime;
    const velocity = deltaX / (deltaTime || 1);

    gsap.to(railTrack, { x: 0, duration: 0.35, ease: "power2.out" });

    if (Math.abs(deltaX) > 60 || Math.abs(velocity) > 0.4) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  trackWrapper.addEventListener("pointerup", endDrag);
  trackWrapper.addEventListener("pointercancel", endDrag);
}

// Initialization & resize
if (railContainer) {
  updateRail();
  window.addEventListener("resize", () => updateRail(), { passive: true });
}

/* ──────────────────────────────────────────
   HERO PARALLAX MOUSE (desktop)
────────────────────────────────────────── */
if(!isMobile){
  const hero=document.getElementById('hero');
  let r=null;
  hero.addEventListener('pointerenter',()=>{
    r=hero.getBoundingClientRect();
  });
  hero.addEventListener('mousemove',e=>{
    if(!r)r=hero.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    const orb1=hero.querySelector('.orb-1');
    const orb2=hero.querySelector('.orb-2');
    if(orb1)orb1.style.transform=`translate(${x*30}px,${y*20}px) scale(1)`;
    if(orb2)orb2.style.transform=`translate(${x*-20}px,${y*-15}px)`;
  });
  hero.addEventListener('pointerleave',()=>{
    r=null;
  });
}

/* ──────────────────────────────────────────
   TESTIMONIALS 3D PHONE SCROLL & MOUSE ROTATION (GSAP)
────────────────────────────────────────── */
if (typeof gsap !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  const depContainer = document.getElementById("dep-3d-container");
  const depMockup = document.getElementById("mockup-ref-dep");
  const depMockupWrapper = document.querySelector(".mockup-scroll-wrapper-dep");
  const msgsTrack = document.querySelector(".messages-track");
  const bubbles = gsap.utils.toArray(".msg-bubble");
  
  if (depContainer && depMockup && depMockupWrapper && msgsTrack) {
    // ScrollTrigger animates the parent wrapper
    gsap.set(depMockupWrapper, { rotationX: 20, rotationY: -15, scale: 0.8, y: 150, z: -200, autoAlpha: 0 });
    gsap.set(bubbles, { autoAlpha: 0, y: 50, scale: 0.9 });
    
    gsap.set(".dep-left-text", { autoAlpha: 0, x: -50 });
    gsap.set(".dep-right-text", { autoAlpha: 0, x: 50 });
    gsap.set(".dep-badge", { autoAlpha: 0, y: 30, scale: 0.8 });
    
    const depTl = gsap.timeline({
      scrollTrigger: {
        trigger: depContainer,
        start: "top top",
        end: "+=1500",
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
      }
    });

    depTl.to(depMockupWrapper, {
      autoAlpha: 1,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: "power3.out"
    }, 0)
    .to(".dep-left-text", { autoAlpha: 1, x: 0, duration: 1.5, ease: "power3.out" }, 0.2)
    .to(".dep-right-text", { autoAlpha: 1, x: 0, duration: 1.5, ease: "power3.out" }, 0.2)
    .to(".dep-badge", { autoAlpha: 1, y: 0, scale: 1, duration: 1, stagger: 0.2, ease: "back.out(1.5)" }, 0.5);

    bubbles.forEach((bubble, i) => {
      depTl.to(bubble, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.5)"
      });
      
      if (i > 1) {
        depTl.to(msgsTrack, {
          y: () => {
            let offset = 0;
            for (let j = 0; j < i - 1; j++) {
              offset += bubbles[j].offsetHeight + 16; // 16px gap
            }
            return -offset;
          },
          duration: 0.6,
          ease: "power2.inOut"
        }, "<"); 
      }
      
      depTl.to({}, { duration: 0.8 });
    });

    depTl.to([depMockupWrapper, ".dep-left-text", ".dep-right-text", ".dep-badge"], {
      scale: 0.85,
      y: -100,
      autoAlpha: 0,
      duration: 1.5,
      stagger: 0.05,
      ease: "power3.in"
    });


  }
}
