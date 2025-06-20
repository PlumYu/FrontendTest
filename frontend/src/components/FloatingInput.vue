<template>
  <div class="wave-group" :style="containerStyle">
    <input
      class="input"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      required=""
    />
    <span class="bar"></span>
    <label class="label">
      <span
        v-for="(char, index) in labelText"
        :key="index"
        :style="{ '--index': index }"
        class="label-char"
        >{{ char }}</span
      >
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'FloatingInput',
  props: {
    label: {
      type: String,
      default: 'Input Label',
    },
    modelValue: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    width: {
      type: [String, Number], // 可以是 '200px', '100%', 200 (会被转为px)
      default: '200px', // 默认宽度，如果你的表单是固定宽度，可以设置一个默认值
    },
  },
  emits: ['update:modelValue'],
  setup(props) {
    const labelText = computed(() => props.label.split(''))

    const containerStyle = computed(() => {
      const widthValue = typeof props.width === 'number' ? `${props.width}px` : props.width
      return {
        width: widthValue,
      }
    })

    return {
      labelText,
      containerStyle,
    }
  },
})
</script>

<style scoped>
.wave-group {
  position: relative;
}

.wave-group .input {
  font-size: 16px;
  /* 调整了内边距，特别是 top 和 bottom，让文字区域更紧凑 */
  padding: 12px 5px 6px 5px;
  display: block;
  width: 100%;
  border: none;
  border-bottom: 1px solid #a0a0a0; /* 边框颜色稍微调浅一点 */
  background: transparent;
  box-sizing: border-box;
  transition: border-color 0.2s ease; /* 为边框颜色添加过渡 */
}

.wave-group .input:focus {
  outline: none;
}

.wave-group .label {
  color: #999;
  font-size: 16px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 12px;

  /* --- 以下是核心修改 --- */
  display: flex; /* 1. 将 label 自身变为 Flex 容器 */
  align-items: center; /* 2. 让它内部的所有字符（.label-char）垂直居中对齐 */
  height: 22px; /* 3. 给一个明确的高度，以便更好地控制对齐 */
  /* --- 修改结束 --- */

  transition: 0.2s ease all;
}

.wave-group .label-char {
  transition: 0.2s ease all;
  transition-delay: calc(var(--index) * 0.05s);
}

/* --- 这里是核心修改 --- */
.wave-group .input:focus ~ label .label-char,
.wave-group .input:valid ~ label .label-char {
  /* 关键修改：减小向上移动的距离，让它离输入框更近 */
  transform: translateY(-20px);
  /* 关键修改：稍微减小浮动后的字号 */
  font-size: 13px;
  color: #5264ae;
}

.wave-group .bar {
  position: relative;
  display: block;
  width: 100%;
}

.wave-group .bar:before,
.wave-group .bar:after {
  content: '';
  height: 2px;
  width: 0;
  bottom: 0px; /* 修改为 0px，让动画线紧贴边框 */
  position: absolute;
  background: #5264ae;
  transition: 0.2s ease all;
}

.wave-group .bar:before {
  left: 50%;
}

.wave-group .bar:after {
  right: 50%;
}

.wave-group .input:focus ~ .bar:before,
.wave-group .input:focus ~ .bar:after {
  width: 50%;
}
</style>
