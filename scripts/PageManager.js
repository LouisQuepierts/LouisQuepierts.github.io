import {ACTIONS} from "./templates.js";

export class PageManager {
    duration = 0.5;

    _pages = [];

    _container;
    _currentPage = 0;
    _isAnimating = false;

    _lastPage;
    _callback;

    constructor(container, duration = 0.5) {
        this._container = container;
        document.addEventListener("scroll", (e) => {
            console.log("scroll", e);
            e.preventDefault();
        })
        this.duration = duration;
        Object.freeze(this._container);

        const pages = Array.from(container.children).filter(child => child.classList.contains("section"));

        if (!pages || pages.length < 1) {
            throw "No pages found";
        }

        this._lastPage = pages.length - 1;
        Object.freeze(this._lastPage);

        pages.forEach((page, index) => {
            page.addEventListener("wheel", (e) => {
                if (this._isAnimating) {
                    return;
                }

                const atTop = page.scrollTop === 0;
                const atBottom = Math.abs((page.scrollHeight - page.scrollTop) - page.clientHeight) <= 1;

                console.log(index, page.scrollTop, page.scrollHeight, page.clientHeight, page.scrollHeight - page.scrollTop, atTop, atBottom)

                if (atTop && e.deltaY < 0 && index > 0) {
                    this.goto(index - 1)
                    e.preventDefault();
                } else if (atBottom && e.deltaY > 0 && index < this._lastPage) {
                    this.goto(index + 1)
                    e.preventDefault();
                }
            }, { passive: false })

            this._pages.push({
                element: page,
                index: index,
                name: page.id,
            })
        })
    }

    get page() {
        return this._currentPage;
    }

    set page(pageID) {
        this.goto(pageID, 0.5);
    }

    set onchange(callback) {
        this._callback = callback;
    }

    goto(pageID, speed = 0.5) {

        if (pageID === this._currentPage) {
            return;
        }

        if (pageID < 0 || pageID > this._lastPage) {
            return;
        }

        const targetId = this._pages[pageID].name;
        const action = ACTIONS.get(targetId);
        if (action) {
            action(speed);
        }

        this._currentPage = pageID;

        this._isAnimating = true;
        this._container.style.transform = `translateY(-${pageID * 100}vh)`;
        this._container.style.transition = `transform ${this.duration}s ease-in-out`;
        this._container.addEventListener("transitionend", () => {
            this._isAnimating = false;
        }, { once: true })

        if (this._callback) {
            this._callback(pageID, this.duration);
        }
    }
}