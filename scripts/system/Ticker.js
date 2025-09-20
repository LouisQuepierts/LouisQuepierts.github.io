
class Ticker {
    timer = 0.0;
    deltaTimer = 0.0;
    speed = 0.01;

    stopped = false;

    tps = 60.0;
    lastTime = 0.0;

    operations = [];

    run() {
        if (this.stopped) {
            return;
        }

        this.timer += this.speed;
        this.deltaTimer += this.speed;

        const time = performance.now();
        const delta = time - this.lastTime;
        if (delta >= 1000.0 / this.tps) {
            this.lastTime = time;

            for (let operation of this.operations) {
                operation(this.deltaTimer);
            }

            this.deltaTimer = 0.0;
        }

        requestAnimationFrame(() => this.run());
    }

    addOperation(operation) {
        this.operations.push(operation);
    }

    terminate() {
        this.stopped = true;
    }

    isTerminated() {
        return this.stopped;
    }

    getTimer() {
        return this.timer;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    getSpeed() {
        return this.speed;
    }

}

export default new Ticker();