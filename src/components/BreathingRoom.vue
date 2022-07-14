<template>
  <div id="breathingRoom">
    <div class="controls">
      <div class="control">
        <h5>Inhale:</h5>
        <Knob v-model="params.inhale" :max="10" />
      </div>
      <div class="control">
        <h5>Hold in:</h5>
        <Knob v-model="params.holdIn" :max="20" />
      </div>
    </div>
    <div class="controls">
      <div class="control">
        <h5>Exhale:</h5>
        <Knob v-model="params.exhale" :max="10" />
      </div>
      <div class="control">
        <h5>Hold out:</h5>
        <Knob v-model="params.holdOut" :max="20" />
      </div>
    </div>
    <div class="controls">
      <ToggleButton
        v-model="isRunning"
        onIcon="pi pi-pause"
        offIcon="pi pi-play"
      />
    </div>
    <canvas ref="room" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ToggleButton from "primevue/togglebutton";
import Knob from "primevue/knob";

const components = { ToggleButton, Knob };

interface Data {
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  fps: number;
  countFrames: boolean;
  isRunning: boolean;
  pause: boolean;
  position: number;
  colors: {
    blue: string;
    yellow: string;
    lightBlue: string;
    offWhite: string;
  };
  direction: "up" | "down";
  params: {
    inhale: number;
    exhale: number;
    holdIn: number;
    holdOut: number;
  };
}

export default defineComponent({
  data(): Data {
    return {
      fps: 0,
      isRunning: false,
      pause: false,
      countFrames: false,
      position: 0,
      colors: {
        blue: "#2a385b",
        yellow: "#8b7f47",
        lightBlue: "#9c9eb5",
        offWhite: "#faf3eb",
      },
      direction: "up",
      params: {
        inhale: 3,
        exhale: 4,
        holdIn: 0,
        holdOut: 0,
      },
    };
  },
  async mounted() {
    this.canvas = this.$refs.room as unknown as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    await this.prepareCanvas();
  },
  computed: {
    center() {
      return {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
      };
    },
    radius() {
      return Math.max(this.canvas.height * 0.01, 30);
    },
    rate() {
      return (this.canvas.height - this.radius) / this.fps;
    },
    top() {
      return this.radius * 1.9;
    },
    bottom() {
      return (this.canvas.height - this.radius) * 0.9;
    },
  },
  methods: {
    async prepareCanvas(draw: boolean = true) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.position = this.center.y;
      await this.setFps();
      if (draw) {
        this.draw();
      }
    },
    async draw() {
      if (this.fps < 10) {
        this.fps = 0;
        await this.setFps();
      }

      if (!this.isRunning) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawLines();
        this.drawCircle();
        window.requestAnimationFrame(() => this.draw());
        return;
      }

      this.setPosition();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawLines();
      this.drawCircle();

      window.requestAnimationFrame(() => this.draw());
    },
    drawCircle() {
      this.ctx.beginPath();
      this.ctx.arc(
        this.center.x,
        this.position,
        this.radius,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.fillStyle = this.colors.blue;
      this.ctx.fill();
    },
    drawLines() {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.top - this.radius);
      this.ctx.lineTo(this.canvas.width, this.top - this.radius);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.moveTo(0, this.bottom + this.radius);
      this.ctx.lineTo(this.canvas.width, this.bottom + this.radius);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.textAlign = "center";
      this.ctx.font = "16px serif";
      this.ctx.fillText("Inhale", this.center.x, 15);
      this.ctx.fillText(
        "Exhale",
        this.center.x,
        this.bottom + this.radius + 15
      );
    },
    setPosition() {
      if (this.pause) {
        return;
      }

      if (this.direction === "down") {
        this.position += this.rate / this.params.exhale;
      } else {
        this.position -= this.rate / this.params.inhale;
      }

      if (this.position >= this.bottom) {
        this.direction = "up";

        if (this.params.holdOut) {
          this.pause = true;
          setTimeout(() => {
            this.pause = false;
          }, this.params.holdOut * 1000);
        }
      }

      if (this.position <= this.top) {
        this.direction = "down";
        if (this.params.holdIn) {
          this.pause = true;
          setTimeout(() => {
            this.pause = false;
          }, this.params.holdIn * 1000);
        }
      }
    },
    frameCheck() {
      if (!this.countFrames) {
        return;
      }

      this.fps++;
      window.requestAnimationFrame(() => this.frameCheck());
    },
    setFps() {
      return new Promise(async (resolve, reject) => {
        if (this.fps) {
          resolve(this.fps);
          return;
        }

        this.ctx.textAlign = "center";
        this.ctx.font = "24px serif";
        this.ctx.fillText(
          "Contemplating Spacetime...",
          this.center.x,
          this.center.y
        );
        this.countFrames = true;
        this.frameCheck();

        setTimeout(() => {
          this.countFrames = false;
          resolve(this.fps);
        }, 1000);
      });
    },
  },
  components,
});
</script>

