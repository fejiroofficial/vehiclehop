<template>
  <div class="filter">
    <div class="header-section">
      <img
        src="@/assets/close-icon.svg"
        alt="filter icon"
        role="button"
        class="close-filter"
        @click="$emit('close')"
      />
      <div class="title">
        <h4>Filter</h4>
      </div>
    </div>
    <hr />
    <div class="body-section">
      <h4 class="sub-title">Model</h4>
      <div v-for="(model, index) in models" :key="index" class="check-input">
        <input type="checkbox" :value="model" v-model="checkedModels" />
        <label for="scales">{{ model }}</label>
      </div>
      <hr />
      <h4 class="sub-title">Fuel</h4>
      <input
        type="range"
        name="fuel"
        min="0"
        max="1"
        step="0.1"
        v-model="fuelLevel"
      />
      <input type="text" readonly v-model="fuelLevel" />
      <div class="btn-group">
        <button @click="clearFilter()" class="btn btn-tertiary">
          CLEAR
        </button>
        <button
          @click="$emit('applyFilter', fuelLevel, checkedModels)"
          class="btn btn-primary"
        >
          APPLY
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    models: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  data() {
    return {
      fuelLevel: 0,
      checkedModels: [] as string[]
    };
  },
  methods: {
    clearFilter() {
      this.checkedModels = [];
      this.fuelLevel = 0;
      this.$emit("clearFilter");
    }
  }
});
</script>

<style lang="scss" src="../assets/css/filter.scss" scoped></style>
