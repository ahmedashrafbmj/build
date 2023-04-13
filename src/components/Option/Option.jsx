import React, { useState } from 'react'
import {
  Alert,
  Card,
  CardHeader,
  CardBody,
  Form,
  Row,
  Col,
  FormGroup,
  Input,
  Button
} from 'reactstrap'
import { withTranslation } from 'react-i18next'
import { useMutation, gql } from '@apollo/client'
import { createOptions, editOption } from '../../apollo'
import { validateFunc } from '../../constraints/constraints'
import { useRestaurantContext } from '../../context/Restaurant'

const CREATE_OPTIONS = gql`
  ${createOptions}
`

const EDIT_OPTION = gql`
  ${editOption}
`

function Option(props) {
  const [option, optionSetter] = useState(
    props.option
      ? [{ ...props.option, titleError: false, priceError: false }]
      : [
        {
          title: '',
          description: '',
          price: 0,
          titleError: false,
          priceError: false
        }
      ]
  )
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const mutation = props.option ? EDIT_OPTION : CREATE_OPTIONS
  const onCompleted = ({ createOptions, editOption }) => {
    if (createOptions) {
      optionSetter([
        {
          title: '',
          description: '',
          price: 0,
          titleError: false,
          priceError: false
        }
      ])
      successSetter('Saved')
      mainErrorSetter('')
    }
    if (editOption) {
      successSetter('Saved')
      mainErrorSetter('')
    }
  }
  const onError = error => {
    mainErrorSetter(`An error occured while saving. Try again ${error}`)
    successSetter('')
  }
  const [mutate, { loading }] = useMutation(mutation, { onError, onCompleted })

  const onBlur = (index, state) => {
    const options = option
    if (state === 'title') {
      options[index].titleError = !!validateFunc(
        { optionTitle: options[index][state] },
        'optionTitle'
      )
    }
    if (state === 'price') {
      options[index].priceError = !!validateFunc(
        { optionPrice: options[index][state] },
        'optionPrice'
      )
    }
    optionSetter([...options])
  }
  const onAdd = index => {
    const options = option
    if (index === options.length - 1) {
      options.push({ title: '', description: '', price: 0 })
    } else {
      options.splice(index + 1, 0, { title: '', description: '', price: 0 })
    }
    optionSetter([...options])
  }
  const onRemove = index => {
    if (option.length === 1 && index === 0) {
      return
    }
    const options = option
    options.splice(index, 1)
    optionSetter([...options])
  }
  const onChange = (event, index, state) => {
    const options = option
    options[index][state] = event.target.value
    optionSetter([...options])
  }
  const validate = () => {
    const options = option
    options.map((option, index) => {
      onBlur(index, 'title')
      onBlur(index, 'description')
      onBlur(index, 'price')
      return option
    })
    const error = options.filter(
      option => option.titleError || option.priceError
    )
    if (!error.length) return true
    return false
  }

  const onDismiss = () => {
    successSetter('')
    mainErrorSetter('')
  }
  const { t } = props
  const { id: restaurantId } = useRestaurantContext()

  return (
    <Card>
      <CardHeader>Option</CardHeader>
      <CardBody>
        <Form>
          <div>
            <Row>
              <Col lg="3">
                <label className="form-control-label" htmlFor="input-title">
                  {t('Title')}
                </label>
                <br />
                &nbsp;
              </Col>
              <Col lg="3">
                <label
                  className="form-control-label"
                  htmlFor="input-description">
                  {t('Description')}
                </label>
                <br />
                &nbsp;
              </Col>
              <Col lg="3">
                <label className="form-control-label" htmlFor="input-price">
                  {t('Price')}
                </label>
                <br />
                <small>{'Must be a number'}</small>
              </Col>
              {!props.option && (
                <Col lg="3">
                  <label className="form-control-label" htmlFor="input-price">
                    {t('Add/Remove')}
                  </label>
                </Col>
              )}
            </Row>
            {option.map((optionItem, index) => (
              <Row key={index}>
                <Col lg="3">
                  <FormGroup
                    className={
                      optionItem.titleError === true ? 'has-danger' : ''
                    }>
                    <Input
                      className="form-control-alternative"
                      id="input-title"
                      placeholder="e.g Pepsi"
                      type="text"
                      value={optionItem.title}
                      onChange={event => {
                        onChange(event, index, 'title')
                      }}
                      onBlur={event => {
                        onBlur(index, 'title')
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col lg="3">
                  <FormGroup>
                    <Input
                      className="form-control-alternative"
                      id="input-description"
                      placeholder="e.g Optional"
                      type="text"
                      value={optionItem.description}
                      onChange={event => {
                        onChange(event, index, 'description')
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col lg="3">
                  <FormGroup
                    className={
                      optionItem.priceError === true ? 'has-danger' : ''
                    }>
                    <Input
                      className="form-control-alternative"
                      id="input-price"
                      placeholder="e.g 90.25"
                      type="number"
                      value={optionItem.price}
                      onChange={event => {
                        onChange(event, index, 'price')
                      }}
                      onBlur={event => {
                        onBlur(index, 'price')
                      }}
                    />
                  </FormGroup>
                </Col>
                {!props.option && (
                  <Col lg="3">
                    <Button
                      color="danger"
                      onClick={() => {
                        onRemove(index)
                      }}>
                      -
                    </Button>{' '}
                    <Button
                      onClick={() => {
                        onAdd(index)
                      }}
                      color="primary">
                      +
                    </Button>
                  </Col>
                )}
              </Row>
            ))}
            <Row>
              <Col lg="4">
                {loading && (
                  <Button disabled color="primary">
                    Saving
                  </Button>
                )}
                <Button
                  color="primary"
                  onClick={() => {
                    if (validate()) {
                      props.option
                        ? mutate({
                          variables: {
                            optionInput: {
                              options: {
                                _id: props.option._id,
                                title: option[0].title,
                                description: option[0].description,
                                price: +option[0].price
                              },
                              restaurant: restaurantId
                            }
                          }
                        })
                        : mutate({
                          variables: {
                            optionInput: {
                              options: option.map(
                                ({ title, description, price }) => ({
                                  title,
                                  description,
                                  price: +price
                                })
                              ),
                              restaurant: restaurantId
                            }
                          }
                        })
                    }
                  }}>
                  {' '}
                  {'Save'}
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
      </CardBody>
    </Card>
  )
}
export default withTranslation()(Option)
