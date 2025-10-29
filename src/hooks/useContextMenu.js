/**
 * Context menu composable
 * Provides consistent context menu functionality across components
 */
import { ref, nextTick } from 'vue'

export function useContextMenu() {
  const contextMenuRef = ref(null)
  const contextMenuVisible = ref(false)
  const contextMenuItems = ref([])
  const contextTarget = ref(null)

  /**
   * Show context menu at event position
   * @param {Event} event - Mouse event
   * @param {Array} items - Menu items
   * @param {any} target - Target data
   */
  const showContextMenu = (event, items, target = null) => {
    event.preventDefault()
    event.stopPropagation()
    
    contextMenuItems.value = items
    contextTarget.value = target
    
    nextTick(() => {
      if (contextMenuRef.value) {
        contextMenuRef.value.show(event)
      }
    })
  }

  /**
   * Hide context menu
   */
  const hideContextMenu = () => {
    if (contextMenuRef.value) {
      contextMenuRef.value.hide()
    }
  }

  /**
   * Handle context menu item click
   * @param {Object} item - Menu item
   */
  const handleContextMenuClick = (item) => {
    if (item.handler && typeof item.handler === 'function') {
      item.handler(contextTarget.value, item)
    }
  }

  /**
   * Create standard file/folder context menu items
   * @param {Object} data - File/folder data
   * @param {Object} handlers - Event handlers
   */
  const createFileContextMenu = (data, handlers) => {
    const isFolder = 'folderType' in data
    const items = []

    if (isFolder) {
      items.push(
        {
          label: '新建文件夹',
          icon: 'folder',
          handler: handlers.addFolder
        },
        {
          label: '新建文件',
          icon: 'file-small',
          handler: handlers.addFile
        },
        { divider: true }
      )
    }

    items.push(
      {
        label: '打开',
        icon: 'open',
        handler: handlers.open,
        shortcut: 'Enter'
      },
      { divider: true },
      {
        label: '重命名',
        icon: 'rename',
        handler: handlers.rename,
        shortcut: 'F2'
      },
      {
        label: '添加到快速访问',
        icon: 'add-quick',
        handler: handlers.addQuick
      },
      { divider: true },
      {
        label: '删除',
        icon: 'delete',
        handler: handlers.delete,
        shortcut: 'Del'
      }
    )

    return items
  }

  /**
   * Create mind map node context menu items
   * @param {Object} node - Node data
   * @param {Object} handlers - Event handlers
   */
  const createNodeContextMenu = (node, handlers) => {
    const items = [
      {
        label: '添加子节点',
        icon: 'add-child',
        handler: handlers.addChild,
        shortcut: 'Tab'
      },
      {
        label: '添加同级节点',
        icon: 'add-sibling',
        handler: handlers.addSibling,
        shortcut: 'Enter'
      },
      { divider: true },
      {
        label: '复制',
        icon: 'copy',
        handler: handlers.copy,
        shortcut: 'Ctrl+C'
      },
      {
        label: '粘贴',
        icon: 'paste',
        handler: handlers.paste,
        shortcut: 'Ctrl+V',
        disabled: !handlers.canPaste?.()
      },
      { divider: true },
      {
        label: node._children?.length ? '展开' : '收起',
        icon: node._children?.length ? 'expand' : 'collapse',
        handler: handlers.toggleCollapse
      },
      { divider: true },
      {
        label: '删除节点',
        icon: 'delete',
        handler: handlers.deleteNode,
        shortcut: 'Del'
      }
    ]

    return items
  }

  return {
    contextMenuRef,
    contextMenuVisible,
    contextMenuItems,
    contextTarget,
    showContextMenu,
    hideContextMenu,
    handleContextMenuClick,
    createFileContextMenu,
    createNodeContextMenu
  }
}

export default useContextMenu