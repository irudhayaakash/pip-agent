
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const soundToggle = document.getElementById("soundToggle");
  const projectMessage = document.getElementById("projectMessage");
  const secretButton = document.getElementById("secretButton");
  const secretMessage = document.getElementById("secretMessage");
  const pipImage = document.querySelector(".pip-image");

  let audioContext = null;
  let soundEnabled = false;
  let melodyTimer = null;
  let noteIndex = 0;
  let pipClicks = 0;
  let pipClickTimer = null;

  // DREAM MODE
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("dream-mode");

      themeToggle.setAttribute("aria-pressed", String(enabled));
      themeToggle.textContent = enabled
        ? "☀️ Day mode"
        : "☾ Dream mode";
    });
  }

  // AUDIO SETUP
  function getAudioContext() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio is not supported by this browser.");
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  function playNote(frequency, duration = 0.5, volume = 0.07) {
    if (!soundEnabled) return;

    try {
      const context = getAudioContext();

      if (context.state === "suspended") {
        context.resume().catch(console.error);
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        frequency,
        context.currentTime
      );

      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.linearRampToValueAtTime(
        volume,
        context.currentTime + 0.04
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.03);
    } catch (error) {
      console.error("Unable to play sound:", error);
      showMessage("Your browser could not play the sound.");
    }
  }

  const lullabyNotes = [
    261.63, 329.63, 392.00, 329.63,
    293.66, 349.23, 392.00, 261.63,
    329.63, 392.00, 440.00, 392.00,
    349.23, 329.63, 293.66, 261.63
  ];

  function playLullabyNote() {
    if (!soundEnabled) return;

    playNote(lullabyNotes[noteIndex], 0.65, 0.045);
    noteIndex = (noteIndex + 1) % lullabyNotes.length;
  }

  function startLullaby() {
    stopLullaby();
    playLullabyNote();

    melodyTimer = window.setInterval(() => {
      playLullabyNote();
    }, 650);
  }

  function stopLullaby() {
    if (melodyTimer !== null) {
      window.clearInterval(melodyTimer);
      melodyTimer = null;
    }
  }

  // SOUND ON / OFF
  if (soundToggle) {
    soundToggle.addEventListener("click", async () => {
      if (!soundEnabled) {
        try {
          soundEnabled = true;
          const context = getAudioContext();

          await context.resume();

          soundToggle.textContent = "♫ Sound: on";
          soundToggle.setAttribute("aria-pressed", "true");

          startLullaby();
          showMessage("Sweet dreams! Your lullaby is playing. ♡");
        } catch (error) {
          soundEnabled = false;
          soundToggle.textContent = "♫ Sound: off";
          soundToggle.setAttribute("aria-pressed", "false");

          showMessage("Sound could not start. Check your browser settings.");
          console.error(error);
        }
      } else {
        soundEnabled = false;
        stopLullaby();

        soundToggle.textContent = "♫ Sound: off";
        soundToggle.setAttribute("aria-pressed", "false");

        showMessage("The nursery is quiet again. 🌙");
      }
    });
  }

  // PROJECT FEEDBACK
  function showMessage(message) {
    if (projectMessage) {
      projectMessage.textContent = message;
    }
  }

  // CONFETTI EFFECT
  function celebrate() {
    if (typeof window.confetti === "function") {
      window.confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.65 },
        colors: ["#f7b7c8", "#f9d98b", "#b9c9ff", "#c5e6d3"]
      });
    }
  }

  // PROJECT BUTTONS
  document.querySelectorAll(".project-action").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "lullaby") {
        if (!soundEnabled) {
          showMessage("Turn on Sound at the top to hear Pip's lullaby. ♫");
          soundToggle?.focus();
          return;
        }

        startLullaby();
        showMessage("Close your eyes and enjoy Pip's gentle lullaby. ♡");
        playNote(523.25, 0.9, 0.08);
      }

      if (action === "lantern") {
        const enabled = document.body.classList.toggle("lantern-lit");

        button.setAttribute("aria-pressed", String(enabled));
        button.textContent = enabled
          ? "Dim the lantern ☾"
          : "Light the lantern ✦";

        showMessage(
          enabled
            ? "Pip's dream lantern is glowing! ✨"
            : "The lantern is resting until the next dream. 🌙"
        );

        if (enabled) {
          playNote(659.25, 0.5, 0.06);
          celebrate();
        }
      }

      if (action === "story") {
        const storySection = document.getElementById("story");

        showMessage("Once upon a moonlit night... let's read Pip's story. ♡");

        storySection?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        playNote(392, 0.4, 0.04);
      }
    });
  });

  // SECRET BUTTON
  if (secretButton && secretMessage) {
    secretButton.addEventListener("click", () => {
      secretMessage.hidden = false;
      secretMessage.textContent =
        "Pip's little secret: you make the world brighter just by being you. ✨";

      secretButton.textContent = "Secret discovered! ♡";

      celebrate();
      playNote(783.99, 0.7, 0.07);
    });
  }

  // CLICK PIP THREE TIMES
  if (pipImage) {
    pipImage.style.cursor = "pointer";

    pipImage.addEventListener("click", () => {
      pipClicks++;

      if (pipClickTimer !== null) {
        window.clearTimeout(pipClickTimer);
      }

      pipClickTimer = window.setTimeout(() => {
        pipClicks = 0;
      }, 1200);

      if (pipClicks >= 3) {
        pipClicks = 0;

        if (secretMessage) {
          secretMessage.hidden = false;
          secretMessage.textContent =
            "You found Pip's hidden magic! Keep dreaming, little star. ✨";
        }

        celebrate();
        playNote(659.25, 0.6, 0.07);
      }
    });
  }

  // STORY SCROLL REVEAL
  const storyScenes = document.querySelectorAll(".story-scene");

  if ("IntersectionObserver" in window && storyScenes.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    storyScenes.forEach((scene) => observer.observe(scene));
  } else {
    storyScenes.forEach((scene) => scene.classList.add("visible"));
  }

  console.log("Pip's Dream Nursery is ready! ✨");
});
