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

    let dreamMode = false;
    let soundEnabled = false;
    let audioContext = null;
    let eggFound = false;
    let lanternLit = false;

    function setPressed(button, pressed) {
      if (button) button.setAttribute("aria-pressed", String(pressed));
    }

    function updateTheme() {
      document.body.classList.toggle("dream-mode", dreamMode);

      if (themeToggle) {
        themeToggle.textContent = dreamMode
          ? "☀️ Day mode"
          : "☾ Dream mode";
        setPressed(themeToggle, dreamMode);
      }
    }

    function getAudioContext() {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return null;

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      return audioContext;
    }

    async function enableSound() {
      const context = getAudioContext();

      if (!context) {
        soundEnabled = false;

        if (soundToggle) {
          soundToggle.textContent = "♫ Sound unavailable";
          setPressed(soundToggle, false);
        }

        return false;
      }

      try {
        if (context.state === "suspended") {
          await context.resume();
        }

        soundEnabled = context.state === "running";
      } catch (error) {
        console.warn("Could not enable audio:", error);
        soundEnabled = false;
      }

      if (soundToggle) {
        soundToggle.textContent = soundEnabled
          ? "♫ Sound: on"
          : "♫ Sound: off";

        setPressed(soundToggle, soundEnabled);
      }

      return soundEnabled;
    }

    function playChime(frequency = 660, duration = 0.25) {
      if (!soundEnabled) return;

      const context = getAudioContext();

      if (!context || context.state !== "running") return;

      try {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(100, frequency * 0.72),
          now + duration * 0.8
        );

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.055, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + duration
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
      } catch (error) {
        console.warn("Could not play chime:", error);
      }
    }

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        dreamMode = !dreamMode;
        updateTheme();
        playChime(660);
      });

      updateTheme();
    }

    if (soundToggle) {
      soundToggle.textContent = "♫ Sound: off";
      setPressed(soundToggle, false);

      soundToggle.addEventListener("click", async () => {
        if (soundEnabled) {
          soundEnabled = false;
          soundToggle.textContent = "♫ Sound: off";
          setPressed(soundToggle, false);
          return;
        }

        const enabled = await enableSound();

        if (enabled) {
          playChime(660);
        }
      });
    }

    document.querySelectorAll(".project-action").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "lullaby") {
          if (projectMessage) {
            projectMessage.textContent =
              "Three little notes for a sleepy night. ♫";
          }

          [523, 659, 784].forEach((note, index) => {
            window.setTimeout(() => playChime(note, 0.3), index * 260);
          }
        } else if (action === "lantern") {
          lanternLit = !lanternLit;

          document.body.classList.toggle("lantern-lit", lanternLit);

          if (projectMessage) {
            projectMessage.textContent = lanternLit
              ? "The dream lantern is glowing! ✦"
              : "The lantern is resting now. ☾";
          }

          playChime(784);
        } else if (action === "story") {
          if (storySection) {
            storySection.scrollIntoView({
              behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches
                ? "auto"
                : "smooth"
            });
          }

          if (projectMessage) {
            projectMessage.textContent =
              "Pip's bedtime story is waiting for you. ♡";
          }

          playChime(587);
        }
      });
    });

    function showSecret() {
      if (eggFound) {
        if (secretMessage) {
          secretMessage.textContent =
            "You already found Pip's little secret. Sweet dreams! ♡";
        }

        return;
      }

      eggFound = true;
      document.body.classList.add("egg-unlocked");

      if (secretMessage) {
        secretMessage.textContent =
          "✨ You found Pip's tiny secret! Sweet dreams, little dreamer. 💗";

        secretMessage.style.display = "block";
        secretMessage.style.visibility = "visible";
        secretMessage.style.opacity = "1";
        secretMessage.setAttribute("aria-live", "polite");
      }

      if (secretButton) {
        secretButton.textContent = "Secret unlocked! ✨";
      }

      if (typeof window.confetti === "function") {
        try {
          window.confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.7 }
          });
        } catch (error) {
          console.warn("Confetti could not run:", error);
        }
      }

      playChime(880);
    }

    if (secretButton) {
      secretButton.addEventListener("click", showSecret);
    }

    if (pipImage) {
      let clickCount = 0;

      pipImage.style.cursor = "pointer";
      pipImage.title = "Psst... click Pip three times!";
      pipImage.setAttribute("role", "button");
      pipImage.setAttribute("tabindex", "0");
      pipImage.setAttribute(
        "aria-label",
        "Click Pip three times to discover a tiny secret"
      );

      function handlePipClick() {
        clickCount += 1;

        if (clickCount >= 3) {
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

    const scenes = document.querySelectorAll(".story-scene");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      scenes.forEach((scene) => observer.observe(scene));
    } else {
      scenes.forEach((scene) => {
        scene.classList.add("is-visible");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPipSite, {
      once: true
    });
  } else {
    initPipSite();
  }
})();
