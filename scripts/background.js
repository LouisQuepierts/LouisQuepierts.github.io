const background = document.getElementById("background");

const debug_bg = document.getElementById("debug-bg");

document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth / 2 - e.x) / 25;
    const y = (window.innerHeight / 2 - e.y) / 25;

    background.style.transform = `translate(${x}px, ${y}px)`;

    if (debug_bg) {
        debug_bg.innerText = `x: ${x}px, y: ${y}px`;
    }
})