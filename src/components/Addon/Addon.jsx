import React, { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
  Label,
  Modal,
  Alert
} from 'reactstrap'
import { withTranslation } from 'react-i18next'
import { useQuery, useMutation, gql } from '@apollo/client'
import { getRestaurantDetail, createAddons, editAddon } from '../../apollo'
import OptionsComponent from '../Option/Option'
import { validateFunc } from '../../constraints/constraints'
import { useRestaurantContext } from '../../context/Restaurant'

const GET_OPTIONS = gql`
  ${getRestaurantDetail}
`
const CREATE_ADDONS = gql`
  ${createAddons}
`
const EDIT_ADDON = gql`
  ${editAddon}
`

function Addon(props) {
  const { id: restaurantId } = useRestaurantContext()
  const onCompleted = ({ createAddons, editAddon }) => {
    if (createAddons) {
      addonSetter([
        {
          title: '',
          description: '',
          quantityMinimum: 0,
          quantityMaximum: 1,
          options: [],
          titleError: false,
          optionsError: false,
          quantityMinimumError: false,
          quantityMaximumError: false
        }
      ])
      successSetter('Saved')
      mainErrorSetter('')
    }
    if (editAddon) {
      successSetter('Saved')
      mainErrorSetter('')
    }
  }
  const onError = error => {
    mainErrorSetter(`An error occured while saving,Try again ${error}`)
    successSetter('')
  }
  const [addon, addonSetter] = useState(
    props.addon
      ? [
        {
          ...props.addon,
          options: props.addon.options,
          titleError: false,
          optionsError: false,
          quantityMinimumError: false,
          quantityMaximumError: false
        }
      ]
      : [
        {
          title: '',
          description: '',
          quantityMinimum: 0,
          quantityMaximum: 1,
          options: [],
          titleError: false,
          optionsError: false,
          quantityMinimumError: false,
          quantityMaximumError: false
        }
      ]
  )
  const [modal, modalSetter] = useState(false)
  const [addonIndex, addonIndexSetter] = useState(0)
  const [success, successSetter] = useState('')
  const [mainError, mainErrorSetter] = useState('')

  const onChange = (event, index, state) => {
    const addons = addon
    addons[index][state] = event.target.value
    addonSetter([...addons])
  }
  const mutation = props.addon ? EDIT_ADDON : CREATE_ADDONS

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_OPTIONS,
    {
      variables: { id: restaurantId }
    }
  )
  const [mutate, { loading }] = useMutation(mutation, { onError, onCompleted })
  const onBlur = (index, state) => {
    const addons = addon
    if (state === 'title') {
      addons[index].titleError = !!validateFunc(
        { addonTitle: addons[index][state] },
        'addonTitle'
      )
    }
    if (state === 'quantityMinimum') {
      addons[index].quantityMinimumError = !!validateFunc(
        { addonQuantityMinimum: addons[index][state] },
        'addonQuantityMinimum'
      )
      addons[index].quantityMinimumError =
        addons[index].quantityMinimumError ||
        addons[index].quantityMinimum > addons[index].quantityMaximum
      addons[index].quantityMinimumError =
        addons[index].options.length < addons[index][state]
    }
    if (state === 'quantityMaximum') {
      addons[index].quantityMaximumError = !!validateFunc(
        { addonQuantityMaximum: addons[index][state] },
        'addonQuantityMaximum'
      )
      addons[index].quantityMaximumError =
        addons[index].quantityMaximumError ||
        addons[index].quantityMaximum < addons[index].quantityMinimum
    }
    if (state === 'options') {
      addons[index].optionsError = addons[index].options.length === 0
    }
    addonSetter([...addons])
  }
  const onSelectOption = (index, id) => {
    const addons = addon
    const option = addons[index].options.indexOf(id)
    if (option < 0) addons[index].options.push(id)
    else addons[index].options.splice(option, 1)
    addonSetter([...addons])
  }
  const updateOptions = ids => {
    const addons = addon
    addons[addonIndex].options = addons[addonIndex].options.concat(ids)
    addonSetter([...addons])
  }
  const onAdd = index => {
    const addons = addon
    if (index === addons.length - 1) {
      addons.push({
        title: '',
        description: '',
        quantityMinimum: 0,
        quantityMaximum: 1,
        options: []
      })
    } else {
      addons.splice(index + 1, 0, {
        title: '',
        description: '',
        quantityMinimum: 0,
        quantityMaximum: 1,
        options: []
      })
    }
    addonSetter([...addons])
  }
  const onRemove = index => {
    if (addon.length === 1 && index === 0) {
      return
    }
    const addons = addon
    addons.splice(index, 1)
    addonSetter([...addons])
  }
  const toggleModal = index => {
    modalSetter(prev => !prev)
    addonIndexSetter(index)
  }
  const validate = () => {
    const addons = addon
    addons.map((addon, index) => {
      onBlur(index, 'title')
      onBlur(index, 'description')
      onBlur(index, 'quantityMinimum')
      onBlur(index, 'quantityMaximum')
      onBlur(index, 'options')
      return addon
    })
    const error = addons.filter(
      addon =>
        addon.titleError ||
        addon.quantityMinimumError ||
        addon.quantityMaximumError ||
        addon.optionsError
    )
    if (!error.length) return true
    return false
  }

  const onDismiss = () => {
    mainErrorSetter('')
    successSetter('')
  }
  const { t } = props
  return (
    <Card>
      <CardHeader>Addons</CardHeader>
      <CardBody>
        <Form>
          <div>
            {addon.map((addonItem, index) => (
              <div key={index}>
                <Row>
                  <Col lg="6">
                    <Row>
                      <Col lg="12">
                        <label
                          className="form-control-label"
                          htmlFor="input-title">
                          {() => t('Title')}
                        </label>
                        <FormGroup
                          className={
                            addonItem.titleError === true ? 'has-danger' : ''
                          }>
                          <Input
                            className="form-control-alternative"
                            id="input-title"
                            placeholder="e.g Pepsi"
                            type="text"
                            value={addonItem.title}
                            onChange={event => {
                              onChange(event, index, 'title')
                            }}
                            onBlur={event => {
                              onBlur(index, 'title')
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="12">
                        <label
                          className="form-control-label"
                          htmlFor="input-description">
                          {() => t('Description')}
                        </label>
                        <FormGroup>
                          <Input
                            className="form-control-alternative"
                            id="input-description"
                            placeholder="e.g Optional"
                            type="text"
                            value={addonItem.description || ''}
                            onChange={event => {
                              onChange(event, index, 'description')
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="12">
                        <label
                          className="form-control-label"
                          htmlFor="input-minimum">
                          {() => t('Quantity Minimum')}
                        </label>
                        <br />
                        <small>
                          {() => t('Must be a less than or equal to Maximum')}
                        </small>
                        <FormGroup
                          className={
                            addonItem.quantityMinimumError === true
                              ? 'has-danger'
                              : ''
                          }>
                          <Input
                            className="form-control-alternative"
                            id="input-minimum"
                            placeholder="e.g 90.25"
                            type="number"
                            value={addonItem.quantityMinimum}
                            onChange={event => {
                              onChange(event, index, 'quantityMinimum')
                            }}
                            onBlur={event => {
                              onBlur(index, 'quantityMinimum')
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="12">
                        <label
                          className="form-control-label"
                          htmlFor="input-maximum">
                          {() => t('Quantity Maximum')}
                        </label>
                        <br />
                        <small>
                          {() =>
                            t('Must be a greater than or equal to Minimum')
                          }
                        </small>
                        <FormGroup
                          className={
                            addonItem.quantityMaximumError === true
                              ? 'has-danger'
                              : ''
                          }>
                          <Input
                            className="form-control-alternative"
                            id="input-maximum"
                            placeholder="e.g 90.25"
                            type="number"
                            value={addonItem.quantityMaximum}
                            onChange={event => {
                              onChange(event, index, 'quantityMaximum')
                            }}
                            onBlur={event => {
                              onBlur(index, 'quantityMaximum')
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                  <Col lg="6">
                    <Row className="mb-2">
                      <Col>
                        <label className="form-control-label">
                          {() => t('Options')}
                        </label>
                        <br />
                        {!addon[index].options.length && (
                          <small className="text-red">
                            {() => t('Select atleast one Option')}
                          </small>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Button
                            color="warning"
                            onClick={() => toggleModal(index)}>
                            New
                          </Button>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row style={{ maxHeight: '67vh', overflowY: 'scroll' }}>
                      <Col>
                        {loadingQuery && 'Loading ...'}
                        {errorQuery && 'Error ...'}
                        {data &&
                          data.restaurant.options.map(option => (
                            <FormGroup
                              key={option._id}
                              check
                              style={{ width: '100%', marginTop: '10px' }}>
                              <Label check>
                                <Input
                                  checked={addon[index].options.includes(
                                    option._id
                                  )}
                                  value={option._id}
                                  type="checkbox"
                                  onClick={() =>
                                    onSelectOption(index, option._id)
                                  }
                                />
                                {`${option.title} (Description: ${option.description})(Price: ${option.price})`}
                              </Label>
                            </FormGroup>
                          ))}
                      </Col>
                    </Row>
                    {!props.addon && (
                      <Row className="mt-2">
                        <Col>
                          <label className="form-control-label">
                            {() => t('Add/Remove Addons')}
                          </label>
                          <FormGroup>
                            <Button
                              color="danger"
                              onClick={() => {
                                onRemove(index)
                              }}>
                              -
                            </Button>
                            <Button
                              onClick={() => {
                                onAdd(index)
                              }}
                              color="primary">
                              +
                            </Button>
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                  </Col>
                </Row>
                <hr />
              </div>
            ))}
            <Row>
              <Col lg={{ offset: 4, size: 4 }}>
                {loading && (
                  <Button disabled color="success" size="lg" block>
                    Saving
                  </Button>
                )}
                <Button
                  color="primary"
                  size="lg"
                  block
                  onClick={() => {
                    if (validate()) {
                      props.addon
                        ? mutate({
                          variables: {
                            addonInput: {
                              addons: {
                                _id: props.addon._id,
                                title: addon[0].title,
                                description: addon[0].description,
                                options: addon[0].options,
                                quantityMinimum: +addon[0].quantityMinimum,
                                quantityMaximum: +addon[0].quantityMaximum
                              },
                              restaurant: restaurantId
                            }
                          }
                        })
                        : mutate({
                          variables: {
                            addonInput: {
                              addons: addon.map(
                                ({
                                  title,
                                  description,
                                  options,
                                  quantityMinimum,
                                  quantityMaximum
                                }) => ({
                                  title,
                                  description,
                                  options,
                                  quantityMinimum: +quantityMinimum,
                                  quantityMaximum: +quantityMaximum
                                })
                              ),
                              restaurant: restaurantId
                            }
                          }
                        })
                    }
                  }}>
                  {' '}
                  Save
                </Button>
              </Col>
              <Alert color="success" isOpen={!!success} toggle={onDismiss}>
                {success}
              </Alert>
              <Alert color="danger" isOpen={!!mainError} toggle={onDismiss}>
                {mainError}
              </Alert>
            </Row>
          </div>
        </Form>
        {/* <OptionsList /> */}
      </CardBody>
      <Modal
        className="modal-dialog-centered"
        size="lg"
        isOpen={modal}
        toggle={() => {
          toggleModal()
        }}>
        <OptionsComponent updateOptions={updateOptions} />
      </Modal>
    </Card>
  )
}
export default withTranslation()(Addon)
