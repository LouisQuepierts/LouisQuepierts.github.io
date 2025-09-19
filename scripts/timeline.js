import {clamp} from "./math.js";

let pointerInit = false;
let pressed;
let beginY;
let minY  = Infinity;
let maxY = -1;

let pointerTarget;
let moveTarget;
let currentEntry;

const transitionStyle = 'top 0.3s ease, transform 0.3s ease, background-color 0.3s ease'

document.addEventListener('DOMContentLoaded', function() {
    const dots = document.querySelectorAll('.dot');
    const sections = document.querySelectorAll('section');

    const timeline = document.getElementById('timeline-nav');
    const pointer = document.getElementById('timeline-pointer');

    const entries = [];

    // Handle dot clicks
    dots.forEach(dot => {
        const targetId = dot.getAttribute('data-target');
        let entry;
        // find matched section, and push into entries
        for (let section of sections) {
            if (section.id === targetId) {
                entry = {
                    section: section,
                    dot: dot
                };
                entries.push(entry);
                break;
            }
        }

        if (!entry) {
            throw new Error(`No section found with id ${targetId}`);
        }


        dot.addEventListener('click', () => {
            goto(entry, true);
        });

        const rect = dot.getBoundingClientRect();
        minY = Math.min(minY, rect.top);
        maxY = Math.max(maxY, rect.top);
    });

    initPointer();

    timeline.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    })

    pointer.addEventListener('mouseenter', (e) => {
        timeline.classList.add('hover');
    })

    pointer.addEventListener('mouseleave', (e) => {
        timeline.classList.remove('hover');
    })

    pointer.addEventListener('mousedown', (e) => {
        pressed = true;
        pointer.style.transition = '';
        pointer.classList.add('pressed')
        timeline.classList.add('pressed');
        beginY = e.clientY;
    })

    window.addEventListener('mouseup', (e) => {
        if (!pressed) {
            return;
        }

        pressed = false;

        const pRect = pointer.getBoundingClientRect();
        const pointerY = pRect.top;
        if (pointerY === beginY) {
            return;
        }

        pointer.style.transition = transitionStyle;
        pointer.classList.remove('pressed')
        timeline.classList.remove('pressed');

        // find nearest dot
        let delta = Infinity;
        let nearestEntry;

        for (let entry of entries) {
            const dot = entry.dot;
            const dRect = dot.getBoundingClientRect();
            const abs = Math.abs(dRect.top - pointerY);

            if (abs < delta) {
                delta = abs;
                nearestEntry = entry;
            }
        }

        if (nearestEntry) {
            goto(nearestEntry, true);
        }
    })

    window.addEventListener('mousemove', (e) => {
        if (!pressed) {
            return;
        }

        const y = clamp(e.clientY, minY, maxY);
        pointer.style.top = `${y}px`;
    })

    // Highlight active dot based on scroll position
    window.addEventListener('scroll', () => {
        if (moveTarget) {

            const section = moveTarget.section;
            const sectionTop = section.offsetTop;

            const distance = Math.abs(scrollY - sectionTop);

            if (distance < 10) {
                moveTarget = null;
            }

            return;
        }
        movePointerToSection();
    });

    window.addEventListener('scrollend', (e) => {
        moveTarget = null;
        movePointerToSection();
    })

    window.addEventListener('dragstart', (e) => {
        e.preventDefault();
    })

    window.addEventListener('resize', (e) => {
        initPointer();
    })

    pointer.addEventListener('transitionrun', (e) => {
        if (pointerTarget) {
            const targetRect = pointerTarget.getBoundingClientRect();
            const rect = pointer.getBoundingClientRect();

            const distance = Math.abs(rect.top - targetRect.top);
            console.log(distance);
            if (distance < 5) {
                pointer.classList.remove('moving');
                pointerTarget = null;
            }
        }
    })

    pointer.addEventListener('transitionend', (e) => {
        if (pointerTarget) {
            const targetRect = pointerTarget.getBoundingClientRect();
            const rect = pointer.getBoundingClientRect();

            const distance = Math.abs(rect.top - targetRect.top);
            if (distance < 5) {
                pointer.classList.remove('moving');
                pointerTarget = null;
            }
        }
    })

    function movePointerToSection() {
        let current;

        entries.forEach(entry => {
            const section = entry.section;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = entry;
            }
        })

        if (current && current !== currentEntry) {
            currentEntry = current;
            movePointer(current.dot);
        }
    }

    function goto(entry, direct = false) {
        const dot = entry.dot;
        const targetId = dot.getAttribute('data-target');

        if (direct) {
            moveTarget = entry;
        }

        movePointer(dot, direct);
        document.getElementById(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    }

    function initPointer() {

        let current;

        entries.forEach(entry => {
            const section = entry.section;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = entry;
            }
        })

        if (current) {
            const rect = current.dot.getBoundingClientRect();
            pointer.style.top = `${rect.top}px`;
            pointer.style.left = `${rect.left}px`;
            currentEntry = current;
        }
    }

    function movePointer(target) {
        const rect = pointer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        // check distance
        const distance = Math.abs(rect.top - targetRect.top);
        if (distance < 1) {
            return;
        }

        if (!pointerInit) {
            pointer.style.transition = transitionStyle;
            pointerInit = true;

            pointer.style.top = `${targetRect.top}px`;
        } else {
            pointerTarget = target;
            pointer.classList.add('moving');

            setTimeout(() => {
                pointer.style.top = `${targetRect.top}px`;
            }, 300)
        }
    }
});