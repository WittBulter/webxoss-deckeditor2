<script>
import AppHeader from 'components/AppHeader'
import CardImage from 'components/CardImage'
import Localize from 'js/Localize'
import { $get } from 'js/ImageFileCache'

export default {
  components: {
    AppHeader,
    CardImage,
  },
  data: () => ({
    loading: true,
    src: '',
  }),
  computed: {
    pid() {
      // Return <大器晚成>(pid: 23) if invalid
      let pid = +this.$route.query.pid
      return CardInfo[pid] ? pid : 23
    },
    alt() {
      return Localize.cardName(CardInfo[this.pid])
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
  },
  mounted() {
    let url = `./images/${('0000' + this.pid).slice(-4)}.jpg`
    $get(url, 'blob', xhr => {
      this.src = window.URL.createObjectURL(xhr.response)
      // this.loading = false
    })
  },
}
</script>

<template>
  <div :class="$style.page">
    <app-header title="Gallery"></app-header>
    <div :class="$style.body" @click="goBack">
      <div v-if="loading" :class="$style.wrapper">
        <card-image :class="$style.image" :pid="pid"/>
        <div :class="$style.loader"></div>
      </div>
      <img v-else :class="$style.image" :src="src" :alt="alt"/>
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #333;
  justify-content: center;
}
.body {
  display: table-cell;
  overflow-y: auto;
}
.image {
  width: 100%;
}
.wrapper {
  position: relative;
}
.loader {
  display: block;
  width: 3rem;
  height: 3rem;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translateX(-50%) translateY(-50%);
  &::before {
    position: absolute;
    content: '';
    top: 0;
    left: 50%;
    width: 3rem;
    margin: 0 0 0 -1.5rem;
    height: 100%;
    border-radius: 500rem;
    border: .3em solid rgba(0,0,0,.1);
    border-color: rgba(255,255,255,.15);
  }
  &::after {
    position: absolute;
    content: '';
    top: 0;
    left: 50%;
    width: 3rem;
    margin: 0 0 0 -1.5rem;
    height: 100%;
    animation: loader .6s linear;
    animation-iteration-count: infinite;
    border-radius: 500rem;
    border-color: #767676 transparent transparent;
    border-style: solid;
    border-width: .3em;
    box-shadow: 0 0 0 1px transparent;
  }
}
@keyframes loader {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
