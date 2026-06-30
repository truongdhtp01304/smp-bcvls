// List of available ambient background videos
const backgroundVideos = [
  "./data/video/cherry-leaves.1920x1080.mp4",
  "https://moewalls.com/wp-content/uploads/preview/2025/minecraft-autumn-mountains-preview.webm",
  "./data/video/minecraft-kitsune-girl-moewalls-com.mp4",
  "./data/video/steve-peaceful-day-of-fishing-minecraft-moewalls-com.mp4"
];

// Initialize application logic
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Random Video Background Initialization
  const bgVideo = document.getElementById("bg-video");
  const videoToggleBtn = document.getElementById("video-toggle-btn");
  const videoIcon = document.getElementById("video-icon");
  const nextVideoBtn = document.getElementById("next-video-btn");

  let currentVideoIndex = Math.floor(Math.random() * backgroundVideos.length);

  // Persist video enabled state across page refreshes
  let isVideoEnabled = localStorage.getItem("videoEnabled") !== "false";

  function loadBackgroundVideo(index) {
    if (!bgVideo) return;
    bgVideo.src = backgroundVideos[index];
    bgVideo.load();
    if (isVideoEnabled) {
      bgVideo.style.opacity = "1";
      bgVideo.play().catch(e => console.log("Tự động phát video nền bị chặn bởi trình duyệt, đang chờ tương tác:", e));
    } else {
      bgVideo.style.opacity = "0";
      bgVideo.pause();
    }
  }

  // Apply initial button visual state based on saved settings
  if (videoToggleBtn) {
    if (!isVideoEnabled) {
      videoToggleBtn.classList.add("disabled");
      if (videoIcon) {
        videoIcon.setAttribute("data-lucide", "video-off");
      }
    } else {
      videoToggleBtn.classList.remove("disabled");
      if (videoIcon) {
        videoIcon.setAttribute("data-lucide", "video");
      }
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Initial random video load
  loadBackgroundVideo(currentVideoIndex);

  // Toggle Video background play/pause
  if (videoToggleBtn) {
    videoToggleBtn.addEventListener("click", () => {
      if (!bgVideo) return;
      if (isVideoEnabled) {
        bgVideo.style.opacity = "0";
        bgVideo.pause();
        isVideoEnabled = false;
        localStorage.setItem("videoEnabled", "false");
        videoToggleBtn.classList.add("disabled");
        if (videoIcon) {
          videoIcon.setAttribute("data-lucide", "video-off");
          window.lucide.createIcons();
        }
      } else {
        isVideoEnabled = true;
        localStorage.setItem("videoEnabled", "true");
        bgVideo.style.opacity = "1";
        bgVideo.play().catch(e => console.log(e));
        videoToggleBtn.classList.remove("disabled");
        if (videoIcon) {
          videoIcon.setAttribute("data-lucide", "video");
          window.lucide.createIcons();
        }
      }
    });
  }

  // Skip to next background video
  if (nextVideoBtn) {
    nextVideoBtn.addEventListener("click", () => {
      currentVideoIndex = (currentVideoIndex + 1) % backgroundVideos.length;
      loadBackgroundVideo(currentVideoIndex);
    });
  }

  // 2. Fetch Minecraft Server Status
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const serverIp = "top-travelers.gl.joinmc.link";

  async function checkServerStatus() {
    // 1. Try mcstatus.io (v2 API) - highly reliable with no strict rate limits
    try {
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${serverIp}`);
      const data = await response.json();

      if (data && data.online) {
        statusDot.className = "status-dot online";
        const playersOnline = data.players.online;
        const playersMax = data.players.max;
        statusText.innerHTML = `<span class="status-online-text">Đang chạy</span> (${playersOnline}/${playersMax})`;
        return; // successfully updated status
      }
    } catch (e) {
      console.warn("mcstatus.io API failed or offline, trying fallback:", e);
    }

    // 2. Fallback to mcsrvstat.us (v3 API)
    try {
      const response = await fetch(`https://api.mcsrvstat.us/3/${serverIp}`);
      const data = await response.json();

      if (data && data.online) {
        statusDot.className = "status-dot online";
        const playersOnline = data.players.online;
        const playersMax = data.players.max;
        statusText.innerHTML = `<span class="status-online-text">Đang chạy</span> (${playersOnline}/${playersMax})`;
        return; // successfully updated status
      }
    } catch (e) {
      console.error("All server status APIs failed or server is truly offline:", e);
    }

    // 3. Fallback: If both fail or say offline, set state to offline
    statusDot.className = "status-dot offline";
    statusText.innerHTML = `<span class="status-offline-text">Ngoại tuyến</span>`;
  }

  // Run immediately and check every 60 seconds
  checkServerStatus();
  setInterval(checkServerStatus, 60000);

  // 3. Copy Server IP Logic
  const copyIpBtn = document.getElementById("copy-ip-btn");
  const copyIpBox = document.getElementById("copy-ip-box");
  const toastMessage = document.getElementById("toast-message");

  function copyIpToClipboard() {
    navigator.clipboard.writeText(serverIp).then(() => {
      // Show Toast notification
      if (toastMessage) {
        toastMessage.classList.add("show");
        setTimeout(() => {
          toastMessage.classList.remove("show");
        }, 3000);
      }
    }).catch(err => {
      console.error("Không thể sao chép địa chỉ IP:", err);
    });
  }

  if (copyIpBtn) {
    copyIpBtn.addEventListener("click", copyIpToClipboard);
  }
  if (copyIpBox) {
    copyIpBox.addEventListener("click", copyIpToClipboard);
  }

  // 4. Mod List Search & Render
  const fullModListContainer = document.getElementById("full-mod-list");
  const modSearchInput = document.getElementById("mod-search-input");
  const modCountText = document.getElementById("mod-count");
  const noModsFound = document.getElementById("no-mods-found");

  if (modCountText) {
    modCountText.textContent = modPackList.length;
  }

  function renderModList(searchQuery = "") {
    if (!fullModListContainer) return;
    fullModListContainer.innerHTML = "";

    const query = searchQuery.toLowerCase().trim();
    let matchCount = 0;

    modPackList.forEach(mod => {
      if (mod.toLowerCase().includes(query)) {
        matchCount++;

        // Create mod item elements
        const modItem = document.createElement("div");
        modItem.className = "mod-list-item";

        const modIcon = document.createElement("div");
        modIcon.className = "mod-item-icon";
        modIcon.innerHTML = `<i data-lucide="package" class="icon-xs"></i>`;

        const modName = document.createElement("span");
        modName.className = "mod-item-name";

        // Highlight search keyword if matching
        if (query) {
          const startIndex = mod.toLowerCase().indexOf(query);
          const endIndex = startIndex + query.length;
          const highlightedText =
            mod.substring(0, startIndex) +
            `<mark class="search-highlight">${mod.substring(startIndex, endIndex)}</mark>` +
            mod.substring(endIndex);
          modName.innerHTML = highlightedText;
        } else {
          modName.textContent = mod;
        }

        modItem.appendChild(modIcon);
        modItem.appendChild(modName);
        fullModListContainer.appendChild(modItem);
      }
    });

    // Toggle no results state
    if (noModsFound) {
      if (matchCount === 0) {
        noModsFound.style.display = "block";
      } else {
        noModsFound.style.display = "none";
      }
    }

    // Refresh icons inside dynamically rendered elements
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          class: ['icon-xs']
        }
      });
    }
  }

  // Initial render of mods
  renderModList();

  // Search input event listener
  if (modSearchInput) {
    modSearchInput.addEventListener("input", (e) => {
      renderModList(e.target.value);
    });
  }

  // 5. Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (mobileToggle && navMenu) {
    const hamburgerIcon = mobileToggle.querySelector(".menu-icon-hamburger");
    const closeIcon = mobileToggle.querySelector(".menu-icon-close");

    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      const isOpen = navMenu.classList.contains("open");

      if (hamburgerIcon && closeIcon) {
        if (isOpen) {
          hamburgerIcon.style.display = "none";
          closeIcon.style.display = "inline-block";
        } else {
          hamburgerIcon.style.display = "inline-block";
          closeIcon.style.display = "none";
        }
      }
    });

    // Close menu when clicking link
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        if (hamburgerIcon && closeIcon) {
          hamburgerIcon.style.display = "inline-block";
          closeIcon.style.display = "none";
        }
      });
    });
  }

  // 6. Interactive Trail Grid Background
  const trailGridContainer = document.getElementById("trail-grid");
  const cellSize = 40;
  const hoverDuration = 150;
  let cols = 0;
  let rows = 0;
  let cells = [];
  const timeouts = new Map();
  let lastHoveredIndex = -1;

  function calculateGridDimensions() {
    if (!trailGridContainer) return;

    // Clear existing cells and timeouts
    trailGridContainer.innerHTML = "";
    cells = [];
    timeouts.forEach(clearTimeout);
    timeouts.clear();
    lastHoveredIndex = -1;

    cols = Math.ceil(document.documentElement.clientWidth / cellSize);
    rows = Math.ceil(document.documentElement.clientHeight / cellSize);

    trailGridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    trailGridContainer.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    const totalCells = cols * rows;
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.className = "trail-cell";
      trailGridContainer.appendChild(cell);
      cells.push(cell);
    }
  }

  function updateCellAndNeighbors(index) {
    if (!cells[index]) return;

    const r = Math.floor(index / cols);
    const c = index % cols;

    function updateRadii(i, curRow, curCol) {
      if (i < 0 || i >= cells.length || !cells[i]) return;

      const topActive = curRow > 0 && cells[i - cols]?.classList.contains("active");
      const bottomActive = curRow < rows - 1 && cells[i + cols]?.classList.contains("active");
      const leftActive = curCol > 0 && cells[i - 1]?.classList.contains("active");
      const rightActive = curCol < cols - 1 && cells[i + 1]?.classList.contains("active");

      const tl = topActive || leftActive ? "0" : "4px";
      const tr = topActive || rightActive ? "0" : "4px";
      const br = bottomActive || rightActive ? "0" : "4px";
      const bl = bottomActive || leftActive ? "0" : "4px";

      cells[i].style.borderRadius = `${tl} ${tr} ${br} ${bl}`;
    }

    updateRadii(index, r, c);
    if (r > 0) updateRadii(index - cols, r - 1, c);
    if (r < rows - 1) updateRadii(index + cols, r + 1, c);
    if (c > 0) updateRadii(index - 1, r, c - 1);
    if (c < cols - 1) updateRadii(index + 1, r, c + 1);
  }

  function handleGridMouseMove(e) {
    if (!cells.length) return;
    // Check if device supports hover pointer
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const col = Math.floor(e.clientX / cellSize);
    const row = Math.floor(e.clientY / cellSize);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const index = row * cols + col;

      if (index !== lastHoveredIndex) {
        lastHoveredIndex = index;
        const targetCell = cells[index];

        if (!targetCell) return;

        targetCell.classList.add("active");
        updateCellAndNeighbors(index);

        if (timeouts.has(index)) {
          clearTimeout(timeouts.get(index));
        }

        const timeout = setTimeout(() => {
          if (cells[index]) {
            cells[index].classList.remove("active");
            updateCellAndNeighbors(index);
          }
        }, hoverDuration);

        timeouts.set(index, timeout);
      }
    }
  }

  if (trailGridContainer) {
    calculateGridDimensions();
    window.addEventListener("resize", calculateGridDimensions);
    document.addEventListener("mousemove", handleGridMouseMove);
    document.addEventListener("mouseleave", () => {
      lastHoveredIndex = -1;
    });
  }

  // 7. Text Scramble Effect
  const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const scrambleElements = document.querySelectorAll(".scramble-text");

  scrambleElements.forEach(element => {
    const originalText = element.getAttribute("data-scramble") || element.textContent;
    let isScrambling = false;
    let scrambleInterval = null;

    element.addEventListener("mouseenter", () => {
      if (isScrambling) return;
      isScrambling = true;

      const duration = originalText.length * 3;
      let frame = 0;

      if (scrambleInterval) clearInterval(scrambleInterval);

      scrambleInterval = setInterval(() => {
        frame++;
        const progress = frame / duration;
        const revealedLength = Math.floor(progress * originalText.length);

        const scrambledHTML = originalText
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealedLength) return originalText[i];

            const randomChar = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            return `<span class="scramble-char-scrambling">${randomChar}</span>`;
          })
          .join("");

        element.innerHTML = scrambledHTML;

        if (frame >= duration) {
          clearInterval(scrambleInterval);
          element.textContent = originalText;
          isScrambling = false;
        }
      }, 30);
    });

    element.addEventListener("mouseleave", () => {
      if (scrambleInterval) clearInterval(scrambleInterval);
      element.textContent = originalText;
      isScrambling = false;
    });
  });

  // 8. Scroll Reveal Animations (matching hero-section.md timeline behavior)
  const revealElements = [
    ...document.querySelectorAll("#instructions .section-heading, #instructions .section-subheading"),
    ...document.querySelectorAll("#rules .section-heading, #rules .section-subheading"),
    ...document.querySelectorAll("#donate .section-heading, #donate .section-subheading"),
    ...document.querySelectorAll(".onboarding-card"),
    document.querySelector(".video-guide-banner"),
    ...document.querySelectorAll(".rule-card"),
    document.querySelector(".donate-box"),
    document.querySelector(".main-footer")
  ].filter(Boolean);

  revealElements.forEach(el => {
    el.classList.add("reveal-on-scroll");
  });

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -100px 0px",
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;

        // Dynamic staggered delay based on grid indexing
        if (target.classList.contains("onboarding-card")) {
          const cards = Array.from(document.querySelectorAll(".onboarding-card"));
          const index = cards.indexOf(target);
          target.style.transitionDelay = `${index * 0.15}s`;
        } else if (target.classList.contains("rule-card")) {
          const cards = Array.from(document.querySelectorAll(".rule-card"));
          const index = cards.indexOf(target);
          target.style.transitionDelay = `${(index % 2) * 0.15}s`;
        }

        target.classList.add("revealed");
        obs.unobserve(target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => scrollObserver.observe(el));
});

