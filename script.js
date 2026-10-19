const themeToggle=document.querySelector("#themeToggle");
const soundToggle=document.querySelector("#soundToggle");
const secretButton=document.querySelector("#secretButton");
const secretMessage=document.querySelector("#secretMessage");
const projectMessage=document.querySelector("#projectMessage");
let dreamMode=false,soundEnabled=false,audioContext=null,eggFound=false,sparkleFrame=0;

function updateTheme(){document.body.classList.toggle("dream-mode",dreamMode);themeToggle.setAttribute("aria-pressed",String(dreamMode));themeToggle.textContent=dreamMode?"☀️ Day mode":"☾ Dream mode";}
themeToggle.addEventListener("click",()=>{dreamMode=!dreamMode;updateTheme();playChime(660);});

soundToggle.addEventListener("click",async()=>{
  soundEnabled=!soundEnabled;
  if(soundEnabled){
    try{
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)throw new Error("Web Audio is not supported.");
      audioContext ||= new AudioContextClass();
      if(audioContext.state==="suspended")await audioContext.resume();
      soundToggle.textContent="♫ Sound: on";
    }catch(error){soundEnabled=false;soundToggle.textContent="♫ Sound: off";console.warn("Audio unavailable:",error.message);}
  }else{soundToggle.textContent="♫ Sound: off";}
  soundToggle.setAttribute("aria-pressed",String(soundEnabled));
});
function playChime(frequency=660){
  if(!soundEnabled||!audioContext||audioContext.state!=="running")return;
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
  oscillator.type="sine";oscillator.frequency.setValueAtTime(frequency,now);oscillator.frequency.exponentialRampToValueAtTime(frequency*.72,now+.22);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.28);
  oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+.3);
}
document.querySelectorAll(".primary-button,.project-action").forEach(button=>button.addEventListener("click",()=>playChime(660)));

document.querySelectorAll(".project-action").forEach(button=>button.addEventListener("click",()=>{
  const action=button.dataset.action;
  if(action==="lullaby"){[523,659,784].forEach((note,index)=>window.setTimeout(()=>playChime(note),index*220));projectMessage.textContent="Three little notes for a sleepy night. ♫";}
  if(action==="lantern"){document.body.classList.toggle("lantern-lit");projectMessage.textContent=document.body.classList.contains("lantern-lit")?"The dream lantern is glowing! ✦":"The lantern is resting now. ☾";playChime(784);}
  if(action==="story"){document.querySelector("#story").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
}));

secretButton.addEventListener("click",()=>{
  if(eggFound){secretMessage.textContent="You already found Pip's little secret. Sweet dreams! ♡";return;}
  eggFound=true;document.body.classList.add("egg-unlocked");
  secretMessage.textContent="You found the secret! Pip has a tiny gift for you. ✨";
  if(typeof window.confetti==="function")window.confetti({particleCount:90,spread:65,origin:{y:.65}});
  playChime(880);
});

// Reveal story scenes as they enter the viewport.
const scenes=document.querySelectorAll(".story-scene");
if("IntersectionObserver"in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}),{threshold:.12});
  scenes.forEach(scene=>observer.observe(scene));
}else{scenes.forEach(scene=>scene.classList.add("is-visible"));}

/* Tiny Secret: Click Pip three times to unlock */
document.addEventListener("DOMContentLoaded", () => {
  const pip = document.querySelector(".hero-art .pip-image")
    || document.querySelector(".pip-image");

  const secretMessage = document.querySelector("#secretMessage");

  if (!pip || !secretMessage) {
    console.error("Tiny Secret: Pip image or #secretMessage element not found.");
    return;
  }

  let clickCount = 0;
  let unlocked = false;

  pip.style.cursor = "pointer";
  pip.setAttribute("title", "Psst... click Pip three times!");

  pip.addEventListener("click", () => {
    if (unlocked) return;

    clickCount++;

    if (clickCount >= 3) {
      unlocked = true;

      document.body.classList.add("egg-unlocked");

      secretMessage.textContent =
        "✨ You found Pip's tiny secret! Sweet dreams, little dreamer. 💗";

      secretMessage.style.display = "block";
      secretMessage.style.visibility = "visible";
      secretMessage.style.opacity = "1";
      secretMessage.setAttribute("aria-live", "polite");
    }
  });
});
