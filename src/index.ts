import * as $ from 'jquery';
import 'jquery-knob';

interface Coordinates {
    x: number;
    y: number;
}

type Param = 'inhale' | 'exhale' | 'holdIn' | 'holdOut';

$(() => {

    class BreathingRoom {
        private width: number;
        private height: number;
        private top: number;
        private bottom: number;
        private canvas = $('#canvas')[0] as HTMLCanvasElement;
        private direction = 'up';
        private ctx: CanvasRenderingContext2D;
        private position: number;
        private center: Coordinates;
        private radius: number;
        private fps = 0;
        private countFrames = false;
        private rate: number;
        private pause: boolean = false;

        private colors = {
            blue: '#2a385b',
            yellow: '#8b7f47',
            lightBlue: '#9c9eb5',
            offWhite: '#faf3eb'
        };

        private params = {
            inhale: 3,
            exhale: 4,
            holdIn: 0,
            holdOut: 0
        };

        constructor() {

            const fgColor = this.colors.blue;
            const bgColor = this.colors.offWhite;

            Object.keys(this.params).forEach((key: Param) => {
                const selector = `#${key}Control`;

                $(selector).knob({
                    fgColor,
                    bgColor,
                    min: 0,
                    max: 10,
                    angleArc: 180,
                    angleOffset: -90,
                    release: (value: number) => {
                        this.params[key] = value;
                    }
                });

                this.params[key] = parseInt($(selector).val() as string);
            });

            $(window).on('resize', () => {
                this.prepareCanvas(false);
            });

            this.ctx = this.canvas.getContext('2d');

            this.prepareCanvas();
        }

        private async prepareCanvas(draw: boolean = true) {
            this.width = $('#canvas').width();
            this.height = $('#canvas').height();

            this.center = {
                x: this.width / 2,
                y: this.height / 2
            }

            this.radius = Math.max(this.height * 0.01, 30);
            this.top = this.radius * 1.9;
            this.bottom = (this.height - this.radius) * 0.9;

            this.canvas.width = this.width;
            this.canvas.height = this.height;

            this.position = this.center.y;

            await this.setFps();

            this.rate = (this.height - this.radius) / this.fps;
            if (draw) {
                this.draw();
            }
        }

        private draw() {
            if (!this.isRunning()) {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.drawLines();
                this.drawCircle();
                window.requestAnimationFrame(() => this.draw());
                return;
            }

            this.setPosition();

            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawLines();
            this.drawCircle();

            window.requestAnimationFrame(() => this.draw());
        }

        private setPosition() {
            if (this.pause) { return; }

            if (this.direction === 'down') {
                this.position += this.rate / this.params.exhale;
            } else {
                this.position -= this.rate / this.params.inhale;
            }

            if (this.position >= this.bottom) {
                this.direction = 'up';
                if (this.params.holdOut) {
                    this.pause = true;
                    setTimeout(() => {
                        this.pause = false;
                    }, this.params.holdOut * 1000);
                }
            }

            if (this.position <= this.top) {
                this.direction = 'down';
                if (this.params.holdIn) {
                    this.pause = true;
                    setTimeout(() => {
                        this.pause = false;
                    }, this.params.holdIn * 1000);
                }
            }
        }

        private drawCircle() {
            this.ctx.beginPath();
            this.ctx.arc(this.center.x, this.position, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.colors.blue;
            this.ctx.fill();
        }

        private drawLines() {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.top - this.radius);
            this.ctx.lineTo(this.width, this.top - this.radius);
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.moveTo(0, this.bottom + this.radius);
            this.ctx.lineTo(this.width, this.bottom + this.radius);
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.textAlign = 'center';
            this.ctx.font = '16px serif';
            this.ctx.fillText('Inhale', this.center.x, 15);
            this.ctx.fillText('Exhale', this.center.x, this.bottom + this.radius + 15);

            return;

            this.ctx.lineTo(this.center.x, this.position);
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.moveTo(this.center.x, this.position);
            this.ctx.lineTo(this.width, this.height);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        private isRunning() {
            return this.params.inhale && this.params.exhale;
        }

        private frameCheck() {
            if (!this.countFrames) { return; }

            this.fps++;
            window.requestAnimationFrame(() => this.frameCheck());
        }

        private setFps(): Promise<number> {
            return new Promise((resolve, reject) => {
                if (this.fps) {
                    resolve(this.fps);
                    return;
                };

                this.ctx.textAlign = 'center';
                this.ctx.font = '24px serif';
                this.ctx.fillText('Contemplating Spacetime...', this.center.x, this.center.y);
                this.countFrames = true;
                this.frameCheck();

                setTimeout(() => {
                    this.countFrames = false;
                    resolve(this.fps);
                }, 1000);
            });
        }
    }

    new BreathingRoom();
});


