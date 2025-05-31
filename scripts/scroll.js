import { smoothstep } from "./math.js"

class ScrollListenerManager {
    constructor() {
        this.listeners = [];
        this.thresholds = [];
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;

            for (const listener of this.listeners) {
                const top = listener.top;
                const bottom = listener.bottom;


                if (scrollY < top || scrollY > bottom) {
                    continue;
                }

                const progress = smoothstep(top, bottom, scrollY);

                listener.callback(progress);
            }

             for (const threshold of this.thresholds) {
                 const passes = threshold.check(scrollY);
                 if (passes !== threshold.passes) {
                     threshold.passes = passes;
                     threshold.callback(passes);
                 }
            }
        });
    }

    addListener(top, bottom, callback) {
        this.listeners.push({ top, bottom, callback });
    }

    addThreshold(check, callback) {
        this.thresholds.push({ check, callback });
    }
}

const scrolls = new ScrollListenerManager();
export { scrolls, ScrollListenerManager };