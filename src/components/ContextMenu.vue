<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="context-menu-item"
        :class="{ disabled: item.disabled, divider: item.divider }"
        @click="handleItemClick(item)"
      >
        <div v-if="!item.divider" class="item-content">
          <svg-icon v-if="item.icon" :icon="item.icon" class="item-icon" />
          <span class="item-text">{{ item.label }}</span>
          <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { defineComponent, ref, nextTick, onMounted, onUnmounted } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'

export default defineComponent({
  name: 'ContextMenu',
  components: {
    SvgIcon
  },
  props: {
    menuItems: {
      type: Array,
      required: true
    }
  },
  emits: ['item-click', 'hide'],
  setup(props, { emit }) {
    const visible = ref(false)
    const position = ref({ x: 0, y: 0 })

    const show = (event) => {
      event.preventDefault()
      event.stopPropagation()
      
      // Calculate position to keep menu within viewport
      const x = Math.min(event.clientX, window.innerWidth - 200)
      const y = Math.min(event.clientY, window.innerHeight - props.menuItems.length * 36)
      
      position.value = { x, y }
      visible.value = true
      
      nextTick(() => {
        document.addEventListener('click', hide)
        document.addEventListener('contextmenu', hide)
        document.addEventListener('scroll', hide)
      })
    }

    const hide = () => {
      visible.value = false
      document.removeEventListener('click', hide)
      document.removeEventListener('contextmenu', hide)
      document.removeEventListener('scroll', hide)
      emit('hide')
    }

    const handleItemClick = (item) => {
      if (item.disabled || item.divider) return
      emit('item-click', item)
      hide()
    }

    onUnmounted(() => {
      document.removeEventListener('click', hide)
      document.removeEventListener('contextmenu', hide)
      document.removeEventListener('scroll', hide)
    })

    return {
      visible,
      position,
      show,
      hide,
      handleItemClick
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/css/handler';

.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  padding: 4px 0;
  @include background_color(bc_popover);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  font-size: 14px;
  user-select: none;

  .context-menu-item {
    position: relative;
    padding: 0 16px;
    margin: 0 4px;
    line-height: 32px;
    border-radius: 4px;
    cursor: pointer;
    @include font_color(fc_nickname);

    &:hover:not(.disabled):not(.divider) {
      @include background_color(bc_pop_hover);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.divider {
      height: 1px;
      margin: 4px 0;
      padding: 0;
      background-color: #e4e7ed;
      cursor: default;
    }

    .item-content {
      display: flex;
      align-items: center;
      width: 100%;

      .item-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        @include fill_color(fc_nickname);
      }

      .item-text {
        flex: 1;
      }

      .item-shortcut {
        font-size: 12px;
        opacity: 0.6;
        margin-left: 16px;
      }
    }
  }
}
</style>