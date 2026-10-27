// =============================================
// TELESTACK VIDEO DOWNLOADER
// STACK / LIFO IMPLEMENTATION
// =============================================

let downloadStack = [];
let activeDownloads = {};
let completedDownloads = [];

const TOP_DOWNLOAD_TIME = 15000;
let lastUpdateTime = Date.now();

// PUSH: Add a video to the top of the stack.
function startDownload(id, name, size) {
    id = String(id);

    if (activeDownloads[id]) {
        alert("This video is already in the download stack.");
        return;
    }

    if (completedDownloads.some(video => String(video.id) === id)) {
        alert("This video has already been downloaded.");
        return;
    }

    const video = {
        id,
        name,
        size,
        progress: 0
    };

    activeDownloads[id] = video;

    // Last In, First Out: the newest item becomes the top.
    downloadStack.push(id);

    lastUpdateTime = Date.now();
    render();
}

// Update only the top video.
// Videos below the top remain paused.
function updateDownloads() {
    const now = Date.now();
    const elapsed = Math.max(0, now - lastUpdateTime);

    lastUpdateTime = now;

    if (downloadStack.length === 0) {
        return;
    }

    // The last array element is the top of the stack.
    const topId = downloadStack[downloadStack.length - 1];
    const video = activeDownloads[topId];

    if (!video) {
        downloadStack.pop();
        render();
        return;
    }

    // Progress advances only for the top video.
    video.progress = Math.min(
        1,
        video.progress + elapsed / TOP_DOWNLOAD_TIME
    );

    if (video.progress >= 1) {
        completeDownload(topId);
    } else {
        render();
    }
}

// POP: Complete and remove the top video.
function completeDownload(id) {
    id = String(id);

    const topId = downloadStack[downloadStack.length - 1];

    // Only the top item can finish.
    if (topId !== id) {
        return;
    }

    const video = activeDownloads[id];

    if (!video) {
        downloadStack.pop();
        render();
        return;
    }

    video.progress = 1;

    // Remove the top item using POP.
    downloadStack.pop();

    completedDownloads.unshift(video);

    delete activeDownloads[id];

    render();
}

// Render the entire interface.
function render() {
    renderStack();
    renderCompleted();
    updateCounters();
}

// Display the stack from TOP to BOTTOM.
function renderStack() {
    const container = document.getElementById("stackDisplay");

    if (!container) {
        console.error('Missing HTML element with id="stackDisplay".');
        return;
    }

    container.innerHTML = "";

    if (downloadStack.length === 0) {
        container.innerHTML = `
            <div class="empty">
                No active downloads
            </div>
        `;
        return;
    }

    for (let index = downloadStack.length - 1; index >= 0; index--) {
        const id = downloadStack[index];
        const video = activeDownloads[id];

        if (!video) {
            continue;
        }

        const isTop = index === downloadStack.length - 1;
        const position = downloadStack.length - index;
        const percentage = Math.floor(video.progress * 100);

        let priority;

        if (isTop) {
            priority = "⚡ DOWNLOADING";
        } else if (position === 2) {
            priority = "NEXT";
        } else {
            priority = "WAITING";
        }

        const item = document.createElement("div");
        item.className = "stack-item";

        if (isTop) {
            item.classList.add("top");
        }

        const topLabel = isTop
            ? `<div class="top-label">TOP OF STACK</div>`
            : "";

        item.innerHTML = `
            ${topLabel}

            <div class="stack-name">
                ${position}. ${escapeHTML(video.name)}
            </div>

            <div class="progress-background">
                <div
                    class="progress-bar"
                    style="width: ${percentage}%;">
                </div>
            </div>

            <div class="stack-details">
                <span>${percentage}% • ${escapeHTML(video.size)} MB</span>
                <span class="priority">${priority}</span>
            </div>
        `;

        container.appendChild(item);
    }
}

// Display completed downloads.
function renderCompleted() {
    const container = document.getElementById("completedDisplay");

    if (!container) {
        console.error('Missing HTML element with id="completedDisplay".');
        return;
    }

    container.innerHTML = "";

    if (completedDownloads.length === 0) {
        container.innerHTML = `
            <div class="empty">
                Nothing completed yet
            </div>
        `;
        return;
    }

    completedDownloads.forEach(video => {
        const item = document.createElement("div");
        item.className = "completed-item";

        item.innerHTML = `
            <div class="completed-icon" aria-label="Completed">✓</div>

            <div>
                <div class="completed-name">
                    ${escapeHTML(video.name)}
                </div>

                <div class="completed-size">
                    ${escapeHTML(video.size)} MB • Downloaded
                </div>
            </div>
        `;

        container.appendChild(item);
    });
}

// Update stack counters.
function updateCounters() {
    const stackCounter = document.getElementById("stackCounter");
    const downloadCount = document.getElementById("downloadCount");

    if (stackCounter) {
        stackCounter.textContent = downloadStack.length;
    }

    if (downloadCount) {
        downloadCount.textContent = downloadStack.length;
    }
}

// Escape text before placing it in HTML.
function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

// Update the simulated download every 100 milliseconds.
setInterval(updateDownloads, 100);

// Show the initial interface.
document.addEventListener("DOMContentLoaded", render);

// Also render immediately if the script runs after the page has loaded.
if (document.readyState !== "loading") {
    render();
}