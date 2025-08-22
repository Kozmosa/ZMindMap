<template>
  <el-popover
    placement="bottom"
    trigger="hover"
    :show-arrow="false"
    popper-class="map-op-popper"
  >
    <template #reference>
      <div class="map-op-more">
        <svg-icon icon="more" />
      </div>
    </template>
    <div class="pop-item" @click="showExportMenu = !showExportMenu">
      <svg-icon icon="download" />
      <span>导出</span>
      <svg-icon icon="triangle" :class="{ 'icon-rotate': showExportMenu }" class="expand-icon" />
    </div>
    
    <!-- Export submenu -->
    <div v-if="showExportMenu" class="submenu">
      <div class="pop-item submenu-item" @click="downloadAs('png')">
        <svg-icon icon="image" />
        <span>导出为 PNG</span>
      </div>
      <div class="pop-item submenu-item" @click="downloadAs('svg')">
        <svg-icon icon="vector" />
        <span>导出为 SVG</span>
      </div>
      <div class="pop-item submenu-item" @click="downloadAs('json')">
        <svg-icon icon="code" />
        <span>导出为 JSON</span>
      </div>
      <div class="pop-item submenu-item" @click="downloadAs('pdf')">
        <svg-icon icon="file" />
        <span>导出为高清图片</span>
      </div>
    </div>
  </el-popover>
</template>

<script>
import { defineComponent, computed, onUnmounted, ref } from 'vue'
import useMapStore from '@/store/map'
import SvgIcon from '@/components/SvgIcon.vue'
import { ErrorTip } from '@/hooks/utils'
import { MindMapExporter } from '@/hooks/exportMindMap'
import { ElLoading, ElMessage } from 'element-plus'

export default defineComponent({
  name: 'MapOpPopover',
  components: {
    SvgIcon
  },
  props: {
    isMap: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const store = useMapStore()
    const mapData = computed(() => store.mapData)
    const showExportMenu = ref(false)
    let loading

    const downloadAs = async (format) => {
      if (!props.isMap) {
        ErrorTip('请切换到导图再试')
        return
      }

      loading = ElLoading.service({
        lock: true,
        text: `正在导出为 ${format.toUpperCase()}...`,
        background: 'rgba(0, 0, 0, 0.5)'
      })

      try {
        const exporter = new MindMapExporter('mainSvg', mapData.value)
        const fileName = mapData.value?.name || '思维导图'

        switch (format) {
          case 'png':
            await exporter.exportPNG(fileName)
            break
          case 'svg':
            await exporter.exportSVG(fileName)
            break
          case 'json':
            await exporter.exportJSON(fileName)
            break
          case 'pdf':
            await exporter.exportHighResPNG(fileName)
            break
          default:
            throw new Error(`不支持的导出格式: ${format}`)
        }

        ElMessage.success(`导出成功`)
        showExportMenu.value = false
      } catch (error) {
        console.error('Export failed:', error)
        ElMessage.error(`导出失败: ${error.message}`)
      } finally {
        loading.close()
      }
    }

    // Legacy function for backward compatibility
    const download = () => downloadAs('png')

    onUnmounted(() => {
      loading && loading.close()
    })

    return {
      showExportMenu,
      download,
      downloadAs
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/css/handler';
.map-op-more {
  @include centerFlex;
  height: 26px;
  padding: 0 6px;
  margin-right: 10px;
  cursor: pointer;
  border-radius: 6px;
  &:hover {
    background: #0000000d;
  }
  & > svg {
    @include fill_color(fc_nickname);
    width: 20px;
    height: 20px;
  }
}
.map-op-popper {
  padding: 7px 0 !important;
  @include background_color(bc_popover);
  border: none !important;
  .pop-item {
    @include horiFlex;
    @include font_color(fc_nickname);
    position: relative;
    box-sizing: border-box;
    align-items: center;
    width: 100%;
    height: 32px;
    padding: 0 10px;
    font-size: 14px;
    line-height: 32px;
    cursor: pointer;
    &:hover {
      @include background_color(bc_pop_hover);
    }
    svg {
      width: 20px;
      height: 20px;
      @include fill_color(fc_nickname);
    }
    span {
      margin-left: 12px;
      flex: 1;
    }
    
    .expand-icon {
      margin-left: auto;
      margin-right: 0;
      transition: transform 0.3s ease;
      &.icon-rotate {
        transform: rotate(90deg);
      }
    }
  }
  
  .submenu {
    margin-left: 20px;
    border-left: 1px solid #e4e7ed;
    
    .submenu-item {
      padding-left: 20px;
      font-size: 13px;
      height: 28px;
      line-height: 28px;
      
      &:hover {
        @include background_color(bc_pop_hover);
      }
    }
  }
}
.el-overlay {
  background-color: rgba(0, 0, 0, 0.2) !important;
}
</style>
