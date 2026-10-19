
(() => {
  "use strict";

  function initPipSite() {
    const themeToggle = document.getElementById("themeToggle");
    const soundToggle = document.getElementById("soundToggle");
    const secretButton = document.getElementById("secretButton");
    const secretMessage = document.getElementById("secretMessage");
    const projectMessage = document.getElementById("projectMessage");
    const pipImage = document.querySelector(".hero-art .pip-image");
    const storySection = document.getElementById("story");
    const scenes = document.querySelectorAll(".story-scene");

    let soundEnabled = false;
    let audioContext = null;
    let pipClicks = 0;
    let secretFound = false;
    let lanternLit = false;

    // DREAM MODE
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const enabled = document.body.classList.toggle("dream-mode");
        themeToggle.textContent = enabled ? "☀️ Day mode" : "☾ Dream mode";
        themeToggle.setAttribute("aria-pressed", String(enabled));
      });
    }

    // SOUND
    function getAudioContext() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioContext) audioContext = new AudioContextClass();
      return audioContext;
    }

    async function playChime(frequency = 660, duration = 0.25) {
      if (!soundEnabled) return;

      try {
        const context = getAudioContext();
        if (!context) return;
        if (context.state === "suspended") await context.resume();
        if (context.state !== "running") return;

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
      } catch (error) {
        console.error("Sound error:", error);
      }
    }

    if (soundToggle) {
      soundToggle.addEventListener("click", async () => {
        if (soundEnabled) {
          soundEnabled = false;
          soundToggle.textContent = "♫ Sound: off";
          soundToggle.setAttribute("aria-pressed", "false");
          return;
        }

        try {
          const context = getAudioContext();
          if (!context) {
            soundToggle.textContent = "♫ Sound unavailable";
            return;
          }

          if (context.state === "suspended") await context.resume();

          soundEnabled = context.state === "running";
          soundToggle.textContent = soundEnabled ? "♫ Sound: on" : "♫ Sound: off";
          soundToggle.setAttribute("aria-pressed", String(soundEnabled));

          if (soundEnabled) await playChime(660);
        } catch (error) {
          soundEnabled = false;
          soundToggle.textContent = "♫ Sound: off";
          soundToggle.setAttribute("aria-pressed", "false");
          console.error("Unable to enable sound:", error);
        }
      });
    }

    // PROJECT BUTTONS
    document.querySelectorAll(".project-action").forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.action;

        if (action === "lullaby") {
          if (projectMessage) {
            projectMessage.textContent = "Three little notes for a sleepy night. ♫";
          }

          [523, 659, 784].forEach((note, index) => {
            window.setTimeout(() => playChime(note, 0.3), index * 300);
          });
        } else if (action === "lantern") {
          lanternLit = !lanternLit;
          document.body.classList.toggle("lantern-lit", lanternLit);
          button.setAttribute("aria-pressed", String(lanternLit));

          if (projectMessage) {
            projectMessage.textContent = lanternLit
              ? "The dream lantern is glowing! ✨"
              : "The lantern is resting now. ☾";
          }

          await playChime(784);
        } else if (action === "story") {
          if (storySection) {
            storySection.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
              block: "start"
            });
          }

          if (projectMessage) {
            projectMessage.textContent = "Pip's bedtime story is waiting for you. ♡";
          }

          await playChime(587);
        }
      });
    });

    // TINY SECRET
    async function showSecret() {
      secretFound = true;
      document.body.classList.add("egg-unlocked");

      if (secretMessage) {
        secretMessage.textContent =
          "✨ You found Pip's tiny secret! Sweet dreams, little dreamer. 💗";
        secretMessage.hidden = false;
        secretMessage.style.display = "block";
        secretMessage.setAttribute("aria-live", "polite");
      }

      if (secretButton) {
        secretButton.textContent = "Secret unlocked! ✨";
        secretButton.setAttribute("aria-pressed", "true");
      }

      if (typeof window.confetti === "function") {
        try {
          window.confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.7 }
          });
        } catch (error) {
          console.error("Confetti error:", error);
        }
      }

      await playChime(880);
    }

    if (secretButton) {
      secretButton.addEventListener("click", showSecret);
    }

    // CLICK PIP THREE TIMES
    if (pipImage) {
      pipImage.style.cursor = "pointer";
      pipImage.title = "Psst... click Pip three times!";
      pipImage.setAttribute("role", "button");
      pipImage.setAttribute("tabindex", "0");
      pipImage.setAttribute(
        "aria-label",
        "Click Pip three times to discover a tiny secret"
      );

      function handlePipClick() {
        pipClicks += 1;

        if (pipClicks >= 3) {
          pipClicks = 0;
          showSecret();
        }
      }

      pipImage.addEventListener("click", handlePipClick);
      pipImage.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handlePipClick();
        }
      });
    }

    // STORY SCENE REVEALS
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      scenes.forEach((scene) => observer.observe(scene));
    } else {
      scenes.forEach((scene) => scene.classList.add("is-visible"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPipSite, { once: true });
  } else {
    initPipSite();
  }
})();
