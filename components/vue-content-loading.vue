<template>
  <div :style="style">
    <svg :viewBox="viewbox" preserveAspectRatio="xMidYMid meet">
      <defs :key="uid">
        <clipPath :id="clipPathId" :key="clipPathId">
          <slot>
            <rect x="0" y="0" rx="5" ry="5" width="70" height="70" />
            <rect x="80" y="17" rx="4" ry="4" width="300" height="13" />
            <rect x="80" y="40" rx="3" ry="3" width="250" height="10" />
            <rect x="0" y="80" rx="3" ry="3" width="350" height="10" />
            <rect x="0" y="100" rx="3" ry="3" width="400" height="10" />
            <rect x="0" y="120" rx="3" ry="3" width="360" height="10" />
          </slot>
        </clipPath>
      </defs>
    </svg>
  </div>
</template>

<script>
const validateColor = (color) =>
  /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color)

export default {
  name: 'VueContentLoading',
  props: {
    rtl: {
      default: false,
      type: Boolean
    },
    speed: {
      default: 2,
      type: Number
    },
    width: {
      default: 400,
      type: Number
    },
    height: {
      default: 130,
      type: Number
    },
    primary: {
      type: String,
      default: '#F0F0F0',
      validator: validateColor
    },
    secondary: {
      type: String,
      default: '#E0E0E0',
      validator: validateColor
    },
    uid: {
      type: String,
      required: true
    }
  },
  computed: {
    viewbox() {
      return `0 0 ${this.width} ${this.height}`
    },
    formatedSpeed() {
      return `${this.speed}s`
    },
    clipPathId() {
      return `clipPath-${this.uid || this._uid}`
    },
    style() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        backgroundSize: '200%',
        backgroundImage: `linear-gradient(-90deg, ${this.primary} 0, ${this.secondary} 20%, ${this.primary} 50%,  ${this.secondary} 75%,  ${this.primary})`,
        clipPath: 'url(#' + this.clipPathId + ')',
        animation: `backgroundAnimation ${this.formatedSpeed} infinite linear`,
        transform: this.rtl ? 'rotateY(180deg)' : 'none'
      }
    }
  }
}
</script>

<style lang="scss">
@keyframes backgroundAnimation {
  0% {
    background-position-x: 100%;
  }

  50% {
    background-position-x: 0;
  }

  100% {
    background-position-x: -100%;
  }
}
</style>
