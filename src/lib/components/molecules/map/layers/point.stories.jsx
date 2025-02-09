import { Map, MapConfiguration } from '../'
import { Point as Layer } from './Point'
import { Polygon } from './Polygon'
import { feature } from 'topojson-client'
import englandLocalAuthoritiesTopo from '../sample-data/England-local-authories-2023-topo.json'
import englandCentroids from '../sample-data/England-centroids-LE-2023.json'

const localAuthorities = feature(englandLocalAuthoritiesTopo, englandLocalAuthoritiesTopo.objects['local-authorities'])

const meta = {
  title: 'Molecules/Map/Layers',
  component: Layer,
  argTypes: {
    fill: {
      control: 'color',
    },
    stroke: {
      control: 'color',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '500px' }}>
        <Map config={MapConfiguration.England}>
          <Polygon features={localAuthorities.features} fill="none" stroke="#dcdcdc" strokeWidth={1} />
          <Story />
        </Map>
      </div>
    ),
  ],
}

export default meta

export const Point = {
  args: {
    features: [englandCentroids.features[0], englandCentroids.features[8], englandCentroids.features[16]],
    fill: '#fff4f2',
    stroke: '#FF0000',
    strokeWidth: 1,
    radius: 5,
  },
}
