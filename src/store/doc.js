/* eslint-disable no-param-reassign */
/**
 * 文档相关状态
 */
import { defineStore } from 'pinia'
import { dateFormatter } from '@/hooks/utils'
import { docApi } from '@/hooks/http'

const useDocStore = defineStore({
  id: 'doc',
  state: () => ({
    originAllDocs: undefined,
    allTreeDocs: undefined,
    quickAccessIds: [] // Store IDs of documents/folders in quick access
  }),
  getters: {
    getAllDocuments: state => id => {
      if (!state.originAllDocs) return []
      if (!id) return state.allTreeDocs
      const { folders, documents } = state.originAllDocs
      
      // Handle special virtual folders
      if (id === 'quick') {
        // Return documents/folders that are in quick access
        return [...folders, ...documents].filter(doc => 
          state.quickAccessIds.includes(doc.id)
        )
      }
      
      if (id === 'latest') {
        // Return latest edited documents, sorted by updateTime
        return [...folders, ...documents]
          .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
          .slice(0, 20) // Show latest 20 items
      }
      
      // Regular folder handling
      return [...folders, ...documents].filter(doc => doc.folderId === id)
    },
    getNavigationLists: state => curFolderId => {
      const paths = []
      const folderList = state.originAllDocs?.folders
      if (!folderList || !folderList.length) return []
      
      // Handle special virtual folders
      if (curFolderId === 'quick') {
        return [{ name: '我的文件', id: '0' }, { name: '快速访问', id: 'quick' }]
      }
      
      if (curFolderId === 'latest') {
        return [{ name: '我的文件', id: '0' }, { name: '最近编辑', id: 'latest' }]
      }
      
      const curFolder = folderList.find(f => f.id === curFolderId)
      if (curFolder) {
        paths.unshift(curFolder)
        let prevFolderId = curFolder.folderId
        while (prevFolderId !== '0') {
          // eslint-disable-next-line no-loop-func
          const prevFolder = folderList.find(f => f.id === prevFolderId)
          if (!prevFolder) break
          paths.unshift(prevFolder)
          prevFolderId = prevFolder.folderId
        }
      }
      paths.unshift({ name: '我的文件', id: '0' })
      return paths
    }
  },
  actions: {
    setDoc(data) {
      if (!data) return
      this.originAllDocs = data
      this.allTreeDocs = processTreeData(data)
    },
    async fetchAllDocuments() {
      const data = await docApi.fetchAllDocuments()
      this.setDoc(data)
    },
    async postSetFolder(data) {
      const res = await docApi.postSetFolder(data)
      this.setDoc(res)
    },
    async postSetDoc(data) {
      const res = await docApi.postSetDoc(data)
      this.setDoc(res)
    },
    async postRemove(data) {
      const res = await docApi.postRemove(data)
      this.setDoc(res)
    },
    addToQuickAccess(id) {
      if (!this.quickAccessIds.includes(id)) {
        this.quickAccessIds.push(id)
      }
    },
    removeFromQuickAccess(id) {
      this.quickAccessIds = this.quickAccessIds.filter(qId => qId !== id)
    },
    isInQuickAccess(id) {
      return this.quickAccessIds.includes(id)
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'zmindmap_docs',
        storage: localStorage
      }
    ]
  }
})

function processTreeData(data) {
  if (!data) return null
  const docs = [...data.folders, ...data.documents]
  const treeData = docs.filter(item => {
    item.formatedUpdateTime = dateFormatter(item.updateTime)
    item.formatedCreateTime = dateFormatter(item.createTime)
    item.children = docs.filter(e => {
      return item.id === e.folderId
    })
    return item.folderId === '0'
  })
  return treeData
}

export default useDocStore
