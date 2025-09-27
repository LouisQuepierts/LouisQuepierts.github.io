import {clamp} from "./math.js";
import {ACTIONS} from "./templates.js";

const transitionStyle = 'top 0.3s ease, transform 0.3s ease, background-color 0.3s ease'

let id = 0;

export class Timeline {
    _dots;
    _timeline;
    _pointer;
    _manager;

    _pressed = false;
    _id = id++;

    constructor(timeline, manager) {
        this._dots = Array.from(timeline.children).filter(dot => dot.classList.contains('dot'));
        const pointer = document.createElement('div');
        pointer.classList.add('nav-pointer');
        document.body.appendChild(pointer);

        this._pointer = pointer;
        this._timeline = timeline;
        this._manager = manager;
        this._manager.onchange = (pageID, duration) => this._move(pageID, duration);

        let mMinY = Infinity;
        let mMaxY = -1;
        this._dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this._goto(index, true);
            });

            const rect = dot.getBoundingClientRect();
            mMinY = Math.min(mMinY, rect.top);
            mMaxY = Math.max(mMaxY, rect.top);
        });

        timeline.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        })

        pointer.addEventListener('mouseenter', (e) => {
            this._timeline.classList.add('hover');
        })

        pointer.addEventListener('mouseleave', (e) => {
            this._timeline.classList.remove('hover');
        })

        pointer.addEventListener('mousedown', (e) => {
            this._pressed = true;
            this._pointer.style.transition = '';
            this._pointer.classList.add('pressed')
            this._timeline.classList.add('pressed');
        })

        window.addEventListener('mouseup', (e) => {
            if (!this._pressed) {
                return;
            }

            this._pressed = false;

            const pRect = this._pointer.getBoundingClientRect();
            const pointerY = pRect.top;
            const pointerCenter = pointerY + pRect.height / 2;

            this._pointer.style.transition = transitionStyle;
            this._pointer.classList.remove('pressed')
            this._timeline.classList.remove('pressed');

            // find nearest dot
            let delta = Infinity;
            let nearest = -1;

            for (let i = 0; i < this._dots.length; i++) {
                const dot = this._dots[i];
                const dRect = dot.getBoundingClientRect();
                const dRectCenter = dRect.top + dRect.height / 2;
                const abs = Math.abs(dRectCenter - pointerCenter);

                if (abs < delta) {
                    delta = abs;
                    nearest = i;
                }
            }

            if (nearest > -1) {
                this._goto(nearest);
            }
        })

        window.addEventListener('mousemove', (e) => {
            if (!this._pressed) {
                return;
            }

            const y = clamp(e.clientY, mMinY, mMaxY);
            this._pointer.style.top = `${y}px`;
        })

        window.addEventListener('dragstart', (e) => {
            e.preventDefault();
        })

        window.addEventListener('resize', (e) => {
            this._setup();
        })
        this._setup();
    }

    _goto(pageID) {
        this._manager.page = pageID;
        this._move(pageID, 0.3);
    }

    _move(pageID, duration) {
        const pointer = this._pointer;
        const rect = pointer.getBoundingClientRect();
        const targetRect = this._dots[pageID].getBoundingClientRect();

        // check distance
        const distance = Math.abs(rect.top - targetRect.top);
        if (distance < 1) {
            return;
        }

        pointer.classList.add('moving');
        setTimeout(() => {
            pointer.style.transition = makeTransitionStyle(duration);
            pointer.style.top = `${targetRect.top}px`;

            setTimeout(() => {
                pointer.classList.remove('moving');
            }, duration * 1000)
        }, 300);
    }

    _setup() {
        const current = this._dots[this._manager.page];
        const rect = current.getBoundingClientRect();
        this._pointer.style.top = `${rect.top}px`;
        this._pointer.style.left = `${rect.left}px`;
    }
}

function makeTransitionStyle(duration) {
    return `top 0.3s ease, transform ${duration}s ease, background-color 0.3s ease`
}