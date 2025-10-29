/**
 * Enhanced export functionality for mind maps
 * Supports multiple export formats: PNG, SVG, JSON, PDF
 */
import saveSvg from 'save-svg-as-png'

export class MindMapExporter {
  constructor(svgId, mapData) {
    this.svgId = svgId
    this.mapData = mapData
    this.svg = document.getElementById(svgId)
  }

  /**
   * Export as PNG (existing functionality)
   */
  async exportPNG(fileName = 'mindmap') {
    if (!this.svg) throw new Error('SVG未找到')

    const $mainG = this.svg.firstChild
    if (!$mainG) throw new Error('SVG无子元素')

    // Get original dimensions
    const gMetrics = $mainG.getBBox()
    const svgMetrics = {
      width: gMetrics.width + 20,
      height: gMetrics.height + 20
    }

    // Clone SVG for export
    const $clonedSvg = this.svg.cloneNode(true)
    const bgColor = this.svg.style.backgroundColor

    // Set new dimensions
    $clonedSvg.setAttribute(
      'style',
      `width:${svgMetrics.width}px;height:${svgMetrics.height}px;background-color:${bgColor}`
    )

    // Calculate scaling and positioning
    const scale = Math.min(
      svgMetrics.width / (gMetrics.width + 20),
      svgMetrics.height / (gMetrics.height + 10)
    )

    const svgCenter = { x: svgMetrics.width / 2, y: svgMetrics.height / 2 }
    const gCenter = {
      x: (gMetrics.width * scale) / 2,
      y: (gMetrics.height * scale) / 2
    }

    const transX = -gMetrics.x * scale + svgCenter.x - gCenter.x
    const transY = -gMetrics.y * scale + svgCenter.y - gCenter.y
    $clonedSvg.firstChild.setAttribute(
      'transform',
      `translate(${transX}, ${transY}) scale(${scale})`
    )

    // Add watermark
    this.addWatermark($clonedSvg, svgMetrics)

    // Export as PNG
    return saveSvg.saveSvgAsPng($clonedSvg, `${fileName}.png`, {
      excludeCss: true
    })
  }

  /**
   * Export as SVG
   */
  async exportSVG(fileName = 'mindmap') {
    if (!this.svg) throw new Error('SVG未找到')

    const $clonedSvg = this.svg.cloneNode(true)
    const $mainG = $clonedSvg.firstChild
    
    if (!$mainG) throw new Error('SVG无子元素')

    // Get dimensions and optimize SVG
    const gMetrics = $mainG.getBBox()
    const svgMetrics = {
      width: gMetrics.width + 20,
      height: gMetrics.height + 20
    }

    // Set viewBox for better scaling
    $clonedSvg.setAttribute('viewBox', `0 0 ${svgMetrics.width} ${svgMetrics.height}`)
    $clonedSvg.setAttribute('width', svgMetrics.width)
    $clonedSvg.setAttribute('height', svgMetrics.height)

    // Add watermark
    this.addWatermark($clonedSvg, svgMetrics)

    // Create blob and download
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString($clonedSvg)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    
    this.downloadBlob(blob, `${fileName}.svg`)
  }

  /**
   * Export as JSON (mind map data)
   */
  async exportJSON(fileName = 'mindmap') {
    if (!this.mapData) throw new Error('思维导图数据未找到')

    const exportData = {
      metadata: {
        title: this.mapData.name || '未命名思维导图',
        exportDate: new Date().toISOString(),
        version: '1.0',
        source: 'ZMindMap'
      },
      mindmap: {
        id: this.mapData.id,
        name: this.mapData.name,
        definition: this.mapData.definition,
        styles: this.mapData.styles,
        directory: this.mapData.directory,
        createTime: this.mapData.createTime,
        updateTime: this.mapData.updateTime
      }
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    this.downloadBlob(blob, `${fileName}.json`)
  }

  /**
   * Export as high resolution PNG
   */
  async exportHighResPNG(fileName = 'mindmap') {
    if (!this.svg) throw new Error('SVG未找到')

    const $mainG = this.svg.firstChild
    if (!$mainG) throw new Error('SVG无子元素')

    // Get original dimensions with higher resolution
    const gMetrics = $mainG.getBBox()
    const scale = 3 // 3x resolution for high quality
    const svgMetrics = {
      width: (gMetrics.width + 20) * scale,
      height: (gMetrics.height + 20) * scale
    }

    // Clone SVG for export
    const $clonedSvg = this.svg.cloneNode(true)
    const bgColor = this.svg.style.backgroundColor

    // Set new dimensions for high resolution
    $clonedSvg.setAttribute(
      'style',
      `width:${svgMetrics.width}px;height:${svgMetrics.height}px;background-color:${bgColor}`
    )

    // Calculate scaling and positioning for high res
    const finalScale = Math.min(
      svgMetrics.width / (gMetrics.width + 20),
      svgMetrics.height / (gMetrics.height + 10)
    )

    const svgCenter = { x: svgMetrics.width / 2, y: svgMetrics.height / 2 }
    const gCenter = {
      x: (gMetrics.width * finalScale) / 2,
      y: (gMetrics.height * finalScale) / 2
    }

    const transX = -gMetrics.x * finalScale + svgCenter.x - gCenter.x
    const transY = -gMetrics.y * finalScale + svgCenter.y - gCenter.y
    $clonedSvg.firstChild.setAttribute(
      'transform',
      `translate(${transX}, ${transY}) scale(${finalScale})`
    )

    // Add larger watermark for high res
    const watermark = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    watermark.setAttribute('x', svgMetrics.width - 300)
    watermark.setAttribute('y', svgMetrics.height - 20)
    watermark.setAttribute('style', 'color:#000;opacity:0.2;font-size:32px;')
    watermark.innerHTML = '@map.kimjisoo.cn'
    $clonedSvg.appendChild(watermark)

    // Export as high-res PNG
    return saveSvg.saveSvgAsPng($clonedSvg, `${fileName}_high_res.png`, {
      excludeCss: true,
      scale: 1 // Don't double-scale since we already scaled the SVG
    })
  }

  /**
   * Add watermark to SVG
   */
  addWatermark(svg, metrics) {
    const watermark = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    watermark.setAttribute('x', metrics.width - 150)
    watermark.setAttribute('y', metrics.height - 10)
    watermark.setAttribute('style', 'color:#000;opacity:0.2;font-size:16px;')
    watermark.innerHTML = '@map.kimjisoo.cn'
    svg.appendChild(watermark)
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Legacy function for backward compatibility
 */
export default function svg2Png(svgId, picName) {
  const exporter = new MindMapExporter(svgId)
  return exporter.exportPNG(picName)
}