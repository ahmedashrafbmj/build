import React, { useCallback, useRef, useState } from 'react'
import { GoogleMap, Marker, Polygon } from '@react-google-maps/api'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  CardBody,
  CardFooter,
  Spinner
} from 'reactstrap'
import { useMutation, useQuery, gql } from '@apollo/client'
import Header from '../components/Headers/Header'
import { transformPolygon, transformPath } from '../utils/coordinates'
import {
  updateDeliveryBoundsAndLocation,
  getRestaurantProfile
} from '../apollo'
import { useRestaurantContext } from '../context/Restaurant'

const UPDATE_DELIVERY_BOUNDS_AND_LOCATION = gql`
  ${updateDeliveryBoundsAndLocation}
`
const GET_RESTAURANT_PROFILE = gql`
  ${getRestaurantProfile}
`

export default function DeliveryBoundsAndLocation() {
  const { id } = useRestaurantContext()
  const [drawBoundsOrMarker, setDrawBoundsOrMarker] = useState('marker') // polygon
  const [errorMessage, setErrorMessage] = useState(null)
  const [center, setCenter] = useState({ lat: 33.684422, lng: 73.047882 })
  const [marker, setMarker] = useState({ lat: 33.684422, lng: 73.047882 })
  const [path, setPath] = useState([
    {
      lat: 33.6981335731709,
      lng: 73.036895671875
    },
    {
      lat: 33.684779099960515,
      lng: 73.04650870898438
    },
    {
      lat: 33.693206228391965,
      lng: 73.06461898425293
    },
    {
      lat: 33.706880699271096,
      lng: 73.05410472491455
    }
  ])
  const polygonRef = useRef()
  const listenersRef = useRef([])
  const { error: errorQuery, loading: loadingQuery } = useQuery(
    GET_RESTAURANT_PROFILE,
    {
      variables: { id },
      fetchPolicy: 'network-only',
      onCompleted,
      onError
    }
  )
  const [mutate, { error, loading }] = useMutation(
    UPDATE_DELIVERY_BOUNDS_AND_LOCATION,
    {
      update: updateCache,
      onError,
      onCompleted
    }
  )
  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map(latLng => {
          return { lat: latLng.lat(), lng: latLng.lng() }
        })
      setPath(nextPath)
    }
  }, [setPath])

  const onLoadPolygon = useCallback(
    polygon => {
      polygonRef.current = polygon
      const path = polygon.getPath()
      listenersRef.current.push(
        path.addListener('set_at', onEdit),
        path.addListener('insert_at', onEdit),
        path.addListener('remove_at', onEdit)
      )
    },
    [onEdit]
  )

  const onUnmount = useCallback(() => {
    listenersRef.current.forEach(lis => lis.remove())
    polygonRef.current = null
  }, [])

  const onClick = e => {
    if (drawBoundsOrMarker === 'marker') {
      setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    } else {
      setPath([...path, { lat: e.latLng.lat(), lng: e.latLng.lng() }])
    }
  }

  const removePolygon = () => {
    setPath([])
  }
  const removeMarker = () => {
    setMarker(null)
  }
  const toggleDrawingMode = mode => {
    setDrawBoundsOrMarker(mode)
  }

  function updateCache(cache, { data: { result } }) {
    const { restaurant } = cache.readQuery({
      query: GET_RESTAURANT_PROFILE,
      variables: { id }
    })
    cache.writeQuery({
      query: GET_RESTAURANT_PROFILE,
      variables: { id },
      data: {
        restaurant: {
          ...restaurant,
          ...result
        }
      }
    })
  }
  function onCompleted({ restaurant }) {
    if (restaurant) {
      setCenter({
        lat: +restaurant.location.coordinates[1],
        lng: +restaurant.location.coordinates[0]
      })
      setMarker({
        lat: +restaurant.location.coordinates[1],
        lng: +restaurant.location.coordinates[0]
      })
      setPath(
        restaurant.deliveryBounds
          ? transformPolygon(restaurant.deliveryBounds.coordinates[0])
          : path
      )
    }
  }
  function onError({ networkError, graphqlErrors }) {}

  const validate = () => {
    if (!marker) {
      setErrorMessage('location marker is required')
      return false
    }
    if (path.length < 3) {
      setErrorMessage('delivery area is required')
      return false
    }
    setErrorMessage(null)
    return true
  }
  const onDragEnd = mapMouseEvent => {
    setMarker({
      lat: mapMouseEvent.latLng.lat(),
      lng: mapMouseEvent.latLng.lng()
    })
  }
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Card>
          {loadingQuery && <Spinner />}
          {errorQuery && <p className="text-danger">{errorQuery.message}</p>}
          <CardBody>
            <Row className="mt-2 mb-2 ml-2">
              <Col>
                <Button
                  color="primary"
                  onClick={() => toggleDrawingMode('polygon')}>
                  Draw Delivery Bounds
                </Button>
              </Col>
              <Col>
                <Button
                  color="primary"
                  onClick={() => toggleDrawingMode('marker')}>
                  Set Restaurant Location
                </Button>
              </Col>
            </Row>
            <Row className="mt-2 mb-2 ml-2">
              <Col>
                <Button color="danger" onClick={removePolygon}>
                  Remove Delivery Bounds
                </Button>
              </Col>
              <Col>
                <Button color="danger" onClick={removeMarker}>
                  Remove Restaurant Location
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <GoogleMap
                  mapContainerStyle={{
                    height: '500px',
                    width: '100%'
                  }}
                  id="google-map"
                  zoom={14}
                  center={center}
                  onClick={onClick}>
                  {
                    <Polygon
                      editable
                      draggable
                      onMouseUp={onEdit}
                      onDragEnd={onEdit}
                      onLoad={onLoadPolygon}
                      onUnmount={onUnmount}
                      onRightClick={removePolygon}
                      paths={path}
                    />
                  }
                  {marker && (
                    <Marker
                      position={marker}
                      draggable
                      onRightClick={removeMarker}
                      onDragEnd={onDragEnd}
                    />
                  )}
                </GoogleMap>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="text-danger">{errorMessage}</p>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <Row>
              <Col xs={{ offset: 5 }}>
                <Button
                  disabled={loading}
                  color="success"
                  onClick={() => {
                    const result = validate()
                    if (result) {
                      const location = {
                        latitude: marker.lat,
                        longitude: marker.lng
                      }
                      const bounds = transformPath(path)
                      mutate({ variables: { id, location, bounds } })
                    }
                  }}>
                  Save
                </Button>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col xs={{ offset: 5 }}>
                <p className={error ? 'text-danger' : 'text-success'}>
                  {error ? error.message : ''}
                </p>
              </Col>
            </Row>
          </CardFooter>
        </Card>
      </Container>
    </>
  )
}
