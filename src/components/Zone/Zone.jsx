import React, { useState, useRef, useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'

// reactstrap components
import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col
} from 'reactstrap'
import { GoogleMap, Polygon } from '@react-google-maps/api'

// core components
import { createZone, editZone, getZones } from '../../apollo'
import { transformPath, transformPolygon } from '../../utils/coordinates'
const CREATE_ZONE = gql`
  ${createZone}
`
const EDIT_ZONE = gql`
  ${editZone}
`
const GET_ZONE = gql`
  ${getZones}
`

const Zone = props => {
  const [path, setPath] = useState(
    props.zone ? transformPolygon(props.zone.location.coordinates[0]) : []
  )
  const [mutation] = useState(props.zone ? EDIT_ZONE : CREATE_ZONE)
  const [title, setTitle] = useState(props.zone ? props.zone.title : '')
  const [description, setDescription] = useState(
    props.zone ? props.zone.description : ''
  )
  const listenersRef = useRef([])
  const [errors, setErrors] = useState('')
  const [succes, setSuccess] = useState('')
  const [titleError, setTitleError] = useState(null)
  const [descriptionError, setDescriptionError] = useState(null)
  const onCompleted = data => {
    if (!props.zone) clearFields()
    const message = props.zone
      ? 'Zones updated successfully'
      : 'Zone added successfully'
    setErrors('')
    setSuccess(message)
  }

  const onError = error => {
    setErrors(error.message)
    setSuccess('')
  }
  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_ZONE }, onError, onCompleted]
  })
  const [center] = useState(
    props.zone
      ? setCenter(props.zone.location.coordinates[0])
      : { lat: 33.684422, lng: 73.047882 }
  )
  const polygonRef = useRef()

  const onClick = e => {
    setPath([...path, { lat: e.latLng.lat(), lng: e.latLng.lng() }])
  }

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

  function setCenter(coordinates) {
    return { lat: coordinates[0][1], lng: coordinates[0][0] }
  }

  const onSubmitValidaiton = () => {
    setErrors('')
    const titleErrors = !validateFunc({ title: title }, 'title')
    const descriptionErrors = !validateFunc(
      { description: description },
      'description'
    )
    let zoneErrors = true
    if (path.length < 3) {
      zoneErrors = false
      setErrors('Set Zone on Map')
      return false
    }

    setTitleError(titleErrors)
    setDescriptionError(descriptionErrors)
    return titleErrors && descriptionErrors && zoneErrors
  }
  const clearFields = () => {
    setTitle('')
    setDescription('')
    setTitleError(null)
    setDescriptionError(null)
    setPath([])
  }

  const hideAlert = () => {
    setErrors('')
    setSuccess('')
  }
  const { t } = props
  return (
    <Row>
      <Col className="order-xl-1">
        <Card className="bg-secondary shadow">
          <CardHeader className="bg-white border-0">
            <Row className="align-items-center">
              <Col xs="8">
                <h3 className="mb-0">
                  {props.zone ? t('Edit Zone') : t('Add Zone')}
                </h3>
                <p style={{ color: 'red' }}>
                  This feature is available with Rider app.
                  <a
                    href="https://ninjascode.com/#contact"
                    rel="noreferrer"
                    target="_blank">
                    &nbsp;Contact us&nbsp;
                  </a>
                  if you want this feature
                </p>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Form>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6">
                    <label className="form-control-label" htmlFor="input-title">
                      {t('Title')}
                    </label>
                    <br />
                    <FormGroup
                      className={
                        titleError === null
                          ? ''
                          : titleError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-title"
                        placeholder="e.g Title"
                        type="title"
                        value={title}
                        onChange={event => {
                          setTitle(event.target.value)
                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="6">
                    <label
                      className="form-control-label"
                      htmlFor="input-description">
                      {t('Description')}
                    </label>
                    <br />
                    <FormGroup
                      className={
                        descriptionError === null
                          ? ''
                          : descriptionError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-description"
                        placeholder="e.g Description"
                        type="text"
                        value={description}
                        onChange={event => {
                          setDescription(event.target.value)
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    <h3 className="mb-0">{t('Coordinates')}</h3>
                    <br />
                  </Col>
                </Row>

                <Row>
                  <GoogleMap
                    mapContainerStyle={{
                      height: '500px',
                      width: '100%'
                    }}
                    id="example-map"
                    zoom={14}
                    center={center}
                    onClick={onClick}>
                    <Polygon
                      // Make the Polygon editable / draggable
                      editable
                      draggable
                      path={path}
                      // Event used when manipulating and adding points
                      onMouseUp={onEdit}
                      // Event used when dragging the whole Polygon
                      onDragEnd={onEdit}
                      onLoad={onLoadPolygon}
                      onUnmount={onUnmount}
                    />
                  </GoogleMap>
                </Row>

                <Row className="pt-5">
                  <Col className="text-right" lg="6">
                    <Button
                      disabled={loading}
                      color="primary"
                      onClick={async e => {
                        e.preventDefault()
                        if (onSubmitValidaiton()) {
                          mutate({
                            variables: {
                              zone: {
                                _id: props.zone ? props.zone._id : '',
                                title,
                                description,
                                coordinates: transformPath(path)
                              }
                            }
                          })
                        }
                      }}
                      size="md">
                      {props.zone ? 'Update' : t('Save')}
                    </Button>
                  </Col>
                </Row>

                <Row>
                  <Col lg="6">
                    <Alert color="success" isOpen={!!succes} toggle={hideAlert}>
                      <span className="alert-inner--icon">
                        <i className="ni ni-like-2" />
                      </span>{' '}
                      <span className="alert-inner--text">
                        <strong>{t('Success')}!</strong> {succes}
                      </span>
                    </Alert>
                    <Alert color="danger" isOpen={!!errors} toggle={hideAlert}>
                      <span className="alert-inner--icon">
                        <i className="ni ni-like-2" />
                      </span>{' '}
                      <span className="alert-inner--text">
                        <strong>{t('Danger')}!</strong> {errors}
                      </span>
                    </Alert>
                  </Col>
                </Row>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default withTranslation()(Zone)
