import React, { useState, useRef } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'

// reactstrap components
import {
  Button,
  Label,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  Row,
  Col,
  UncontrolledAlert
} from 'reactstrap'

import {
  editSection,
  restaurantList,
  createSection,
  getSections
} from '../../apollo'

const CREATE_SECTION = gql`
  ${createSection}
`
const EDIT_SECTION = gql`
  ${editSection}
`
const GET_SECTIONS = gql`
  ${getSections}
`
const GET_RESTAURANT = gql`
  ${restaurantList}
`

function Section(props) {
  const formRef = useRef()
  const name = props.section ? props.section.name : ''
  const mutation = props.section ? EDIT_SECTION : CREATE_SECTION
  const enabled = props.section ? props.section.enabled : false
  const [restaurant, restaurantSetter] = useState(
    props.section ? props.section.restaurants.map(r => r._id) : []
  )
  const [error, errorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [nameError, nameErrorSetter] = useState(null)

  const onCompleted = data => {
    const message = props.section
      ? 'Section updated successfully'
      : 'Section added successfully'
    successSetter(message)
    errorSetter('')
    if (!props.section) clearFields()
  }
  function onError(error) {
    const message = `Action failed. Please Try again ${error}`
    successSetter('')
    errorSetter(message)
  }
  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_SECTIONS }, onCompleted]
  })

  const {
    data,
    error: errorQuery,
    loading: loadingQuery
  } = useQuery(GET_RESTAURANT, { onError })

  const onChange = event => {
    // added this keep default checked on editing
    const value = event.target.value
    const ids = restaurant
    if (event.target.checked) {
      ids.push(value)
    } else {
      const index = ids.indexOf(value)
      if (index > -1) ids.splice(index, 1)
    }
    restaurantSetter([...ids])
  }

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const onSubmitValidaiton = () => {
    const nameErrors = !validateFunc(
      { name: formRef.current['input-name'].value },
      'name'
    )
    nameErrorSetter(nameErrors)
    return nameErrors
  }
  const clearFields = () => {
    formRef.current.reset()
    nameErrorSetter(null)
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
                  {props.section ? 'Edit Section' : 'Add Section'}
                </h3>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <form ref={formRef}>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6">
                    <label className="form-control-label" htmlFor="input-name">
                      {t('Name')}
                    </label>
                    <FormGroup
                      className={
                        nameError === null
                          ? ''
                          : nameError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-name"
                        name="input-name"
                        placeholder="e.g New Year"
                        type="text"
                        defaultValue={name}
                        onBlur={event => {
                          onBlur(nameErrorSetter, 'name', event.target.value)
                        }}
                      />
                    </FormGroup>
                  </Col>
                  {!props.coupon && (
                    <Col lg="6">
                      <label
                        className="form-control-label"
                        htmlFor="input-enabled">
                        {t('Enabled/Disabled')}
                      </label>
                      <FormGroup>
                        <label className="custom-toggle">
                          <input
                            defaultChecked={enabled}
                            type="checkbox"
                            name="input-enabled"
                          />
                          <span className="custom-toggle-slider rounded-circle" />
                        </label>
                      </FormGroup>
                    </Col>
                  )}
                </Row>
                <Row style={{ maxHeight: '67vh', overflowY: 'scroll' }}>
                  {loadingQuery ? <div>Loading ...</div> : null}
                  {errorQuery ? (
                    <div>Error ... {JSON.stringify(error)}</div>
                  ) : null}
                  {data &&
                    data.restaurantList.map(
                      (restaurantItem, indexRestaurant) => (
                        <Col key={indexRestaurant} lg="6">
                          <FormGroup check className="mb-2">
                            <Label check>
                              <Input
                                value={restaurantItem._id}
                                type="checkbox"
                                checked={restaurant.includes(
                                  restaurantItem._id
                                )}
                                onChange={onChange}
                              />
                              {`${restaurantItem.name} (${restaurantItem.address})`}
                            </Label>
                          </FormGroup>
                        </Col>
                      )
                    )}
                </Row>

                <Row>
                  {loading ? t('Loading') : null}
                  <Col className="text-right" xs="12">
                    <Button
                      disabled={loading}
                      color="primary"
                      onClick={async e => {
                        e.preventDefault()
                        if (onSubmitValidaiton() && !loading) {
                          mutate({
                            variables: {
                              section: {
                                _id: props.section ? props.section._id : '',
                                name: formRef.current['input-name'].value,
                                enabled:
                                  formRef.current['input-enabled'].checked,
                                restaurants: restaurant
                              }
                            }
                          })
                        }
                      }}
                      size="md">
                      {props.section ? 'Update' : t('Save')}
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    {success && (
                      <UncontrolledAlert color="success" fade={true}>
                        <span className="alert-inner--icon">
                          <i className="ni ni-like-2" />
                        </span>{' '}
                        <span className="alert-inner--text">
                          <strong>{t('Success')}!</strong> {success}
                        </span>
                      </UncontrolledAlert>
                    )}
                    {error && (
                      <UncontrolledAlert color="danger" fade={true}>
                        <span className="alert-inner--icon">
                          <i className="ni ni-like-2" />
                        </span>{' '}
                        <span className="alert-inner--text">
                          <strong>{t('Danger')}!</strong> {error}
                        </span>
                      </UncontrolledAlert>
                    )}
                  </Col>
                </Row>
              </div>
            </form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default withTranslation()(Section)
