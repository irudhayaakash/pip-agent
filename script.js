
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

  const lullabyNotes = [
    261.63, 329.63, 392.0, 329.63,
    293.66, 349.23, 392.0, 261.63,
    329.63, 392.0, 440.0, 392.0,
    349.23, 329.63, 293.66, 261.63
  ];

  // FEEDBACK MESSAGE
  function showMessage(message) {
    if (projectMessage) {
      projectMessage.textContent = message;
    }
  }

  // DREAM MODE
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-pressed",
      String(document.body.classList.contains("dream-mode"))
    );

    themeToggle.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("dream-mode");

      themeToggle.setAttribute("aria-pressed", String(enabled));
      themeToggle.textContent = enabled
        ? "☀️ Day mode"
        : "☾ Dream mode";

      showMessage(
        enabled
          ? "Welcome to Pip's dreamy night sky. ✨"
          : "Welcome back to the nursery sunshine. ☀️"
      );
    });
  }

  // AUDIO SETUP
  function getAudioContext() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio is not supported in this browser.");
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  async function enableAudio() {
    const context = getAudioContext();

    if (context.state !== "running") {
      await context.resume();
    }

    if (context.state !== "running") {
      throw new Error("The audio context could not be started.");
    }

    return context;
  }

  function playNote(frequency, duration = 0.5, volume = 0.045) {
    if (!soundEnabled || !audioContext) return;

    try {
      const context = audioContext;

      if (context.state !== "running") return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(
        volume,
        startTime + 0.04
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + duration
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.04);

      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        gain.disconnect();
      }, { once: true });
    } catch (error) {
      console.error("Unable to play note:", error);
    }
  }

  // LULLABY
  function stopLullaby() {
    if (melodyTimer !== null) {
      window.clearInterval(melodyTimer);
      melodyTimer = null;
    }
  }

  function playLullabyNote() {
    if (!soundEnabled) return;

    playNote(lullabyNotes[noteIndex], 0.58, 0.045);
    noteIndex = (noteIndex + 1) % lullabyNotes.length;
  }

  function startLullaby() {
    stopLullaby();
    noteIndex = 0;
    playLullabyNote();

    melodyTimer = window.setInterval(() => {
      playLullabyNote();
    }, 650);
  }

  // SOUND TOGGLE
  if (soundToggle) {
    soundToggle.setAttribute("aria-pressed", "false");

    soundToggle.addEventListener("click", async () => {
      if (soundEnabled) {
        soundEnabled = false;
        stopLullaby();

        soundToggle.textContent = "♫ Sound: off";
        soundToggle.setAttribute("aria-pressed", "false");

        showMessage("The nursery is quiet again. 🌙");
        return;
      }

      try {
        // Start/resume audio directly from the user's click.
        await enableAudio();

        soundEnabled = true;
        soundToggle.textContent = "♫ Sound: on";
        soundToggle.setAttribute("aria-pressed", "true");

        startLullaby();
        showMessage("Sweet dreams! Pip's lullaby is playing. ♡");
      } catch (error) {
        soundEnabled = false;
        stopLullaby();

        soundToggle.textContent = "♫ Sound: off";
        soundToggle.setAttribute("aria-pressed", "false");

        showMessage(
          "Sound could not start. Check your browser permissions and try again."
        );

        console.error("Audio startup failed:", error);
      }
    });
  }

  // CONFETTI
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

  // PROJECT ACTIONS
  document.querySelectorAll(".project-action").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;

      if (action === "lullaby") {
        if (!soundEnabled) {
          showMessage("Turn on Sound at the top to hear Pip's lullaby. ♫");
          soundToggle?.focus();
          return;
        }

        startLullaby();
        showMessage("Close your eyes and enjoy Pip's gentle lullaby. ♡");
        playNote(523.25, 0.75, 0.065);
      }

      else if (action === "lantern") {
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

      else if (action === "story") {
        const storySection = document.getElementById("story");

        showMessage("Once upon a moonlit night... let's read Pip's story. ♡");

        if (storySection) {
          storySection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        } else {
          showMessage("The story section could not be found. Check the story ID.");
        }

        playNote(392, 0.4, 0.04);
      }

      else {
        showMessage(
          "This project button needs a valid data-action in index.html."
        );
        console.warn("Unknown project action:", action, button);
      }
    });
  });

  // SECRET MESSAGE
  function revealSecret(message) {
    if (secretMessage) {
      secretMessage.hidden = false;
      secretMessage.textContent = message;
    }

    document.body.classList.add("egg-unlocked");
    celebrate();
    playNote(783.99, 0.7, 0.07);
  }

  if (secretButton) {
    secretButton.addEventListener("click", () => {
      revealSecret(
        "Pip's little secret: you make the world brighter just by being you. ✨"
      );

      secretButton.textContent = "Secret discovered! ♡";
      secretButton.setAttribute("aria-pressed", "true");
    });
  }

  // CLICK PIP THREE TIMES TO DISCOVER HIDDEN MAGIC
  if (pipImage) {
    pipImage.style.cursor = "pointer";
    pipImage.setAttribute("tabindex", "0");
    pipImage.setAttribute("role", "button");
    pipImage.setAttribute(
      "aria-label",
      "Click Pip three times to discover hidden magic"
    );

    const handlePipClick = () => {
      pipClicks++;

      if (pipClickTimer !== null) {
        window.clearTimeout(pipClickTimer);
      }

      pipClickTimer = window.setTimeout(() => {
        pipClicks = 0;
        pipClickTimer = null;
      }, 1200);

      if (pipClicks >= 3) {
        pipClicks = 0;

        if (pipClickTimer !== null) {
          window.clearTimeout(pipClickTimer);
          pipClickTimer = null;
        }

        revealSecret(
          "You found Pip's hidden magic! Keep dreaming, little star. ✨"
        );
      }
    };

    pipImage.addEventListener("click", handlePipClick);

    pipImage.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlePipClick();
      }
    });
  }

  // STORY REVEAL ANIMATION
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
