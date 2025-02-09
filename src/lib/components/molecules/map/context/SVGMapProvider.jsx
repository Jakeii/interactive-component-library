import { useMemo, useRef, useCallback } from 'preact/hooks'
import { geoPath } from 'd3-geo'
import { bboxFeature } from '../helpers/bboxFeature'
import { MapContext } from './MapContext'
import { calculateScale } from '../helpers/geoMath'

export function SVGMapProvider({ id, mapRef, width, height, padding, config, zoom, selectedFeature, children }) {
  const contentSize = useMemo(
    () => ({
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom,
    }),
    [width, height, padding],
  )

  const projection = useMemo(() => {
    return config.projection.fitSize([contentSize.width, contentSize.height], bboxFeature(config.bounds))
  }, [contentSize, config])

  const path = geoPath().projection(projection)

  const layerSet = useRef(new Set())
  const layers = useRef([])

  const updateLayers = useCallback((layerSet) => {
    const _layers = Array.from(layerSet.current)
    // sort layers in reverse order (top layer first)
    _layers.sort((a, b) => {
      return b.zIndex - a.zIndex
    })
    layers.current = _layers
  }, [])

  const registerLayer = useCallback(
    (layer) => {
      layerSet.current.add(layer)
      updateLayers(layerSet)
    },
    [updateLayers],
  )

  const unregisterLayer = useCallback(
    (layer) => {
      layerSet.current.delete(layer)
      updateLayers(layerSet)
    },
    [updateLayers],
  )

  const findFeatureAtPoint = useCallback(
    ({ x, y }) => {
      const adjustedPoint = [x - padding.left, y - padding.top]

      for (const layer of layers.current) {
        if (typeof layer.findFeatureAtPoint === 'function') {
          const feature = layer.findFeatureAtPoint(adjustedPoint)
          if (feature) return feature
        }
      }
      return null
    },
    [padding],
  )

  const getVisibleBounds = useCallback(() => {
    const projectedSW = projection.invert([padding.left, contentSize.height])
    const projectedNE = projection.invert([padding.left + contentSize.width, padding.top])
    return [projectedSW, projectedNE]
  }, [projection, contentSize, padding])

  const getZoomScale = useCallback(() => {
    return calculateScale(getVisibleBounds(), contentSize.width, contentSize.height)
  }, [getVisibleBounds, contentSize])

  const context = {
    id,
    projection,
    config,
    path,
    size: { width, height },
    contentSize,
    padding,
    zoom,
    extent: [
      [0, 0],
      [width, height],
    ],
    selectedFeature,
    getZoomScale,
    registerLayer,
    unregisterLayer,
    findFeatureAtPoint,
  }

  mapRef.current = context

  return <MapContext.Provider value={context}>{children}</MapContext.Provider>
}
