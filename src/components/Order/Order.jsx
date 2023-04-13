import React, { useState } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  Col,
  Alert,
  ListGroup,
  ListGroupItem,
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Media
} from 'reactstrap'
import { validateFunc } from '../../constraints/constraints'
import { updateOrderStatus, getConfiguration } from '../../apollo'
import Loader from 'react-loader-spinner'

// constants
const UPDATE_STATUS = gql`
  ${updateOrderStatus}
`

const GET_CONFIGURATION = gql`
  ${getConfiguration}
`

function Order(props) {
  const { order } = props
  const [reason, reasonSetter] = useState('')
  const [reasonError, reasonErrorSetter] = useState(null)
  const [error, errorSetter] = useState('')
  const [success, successSetter] = useState('')

  const onCompleted = ({ updateOrderStatus }) => {
    if (updateOrderStatus) {
      successSetter('Order status updated')
    }
  }
  const onError = error => {
    errorSetter(error.message)
  }
  const { data, loading: loadingQuery } = useQuery(GET_CONFIGURATION)
  const [mutate, { loading }] = useMutation(UPDATE_STATUS, {
    onError,
    onCompleted
  })

  const validateReason = () => {
    const reasonError = !validateFunc({ reason }, 'reason')
    reasonErrorSetter(reasonError)
    return reasonError
  }

  const onDismiss = () => {
    errorSetter('')
    successSetter('')
  }

  const { t } = props
  if (!props.order) return null
  return (
    <Card className="bg-secondary shadow">
      <CardHeader className="bg-white border-0">
        <Row className="align-items-center">
          <Col xs="8">
            <h3 className="mb-0">
              {t('Order')}#{order.orderId}
            </h3>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <Form>
          <div className="pl-lg-4">
            {(error || success) && (
              <Row>
                <Col lg="12">
                  <Alert
                    color="success"
                    isOpen={!!success}
                    fade={true}
                    toggle={onDismiss}>
                    <span className="alert-inner--text">{success}</span>
                  </Alert>
                  <Alert
                    color="danger"
                    isOpen={!!error}
                    fade={true}
                    toggle={onDismiss}>
                    <span className="alert-inner--text">{error}</span>
                  </Alert>
                </Col>
              </Row>
            )}
            {order.orderStatus !== 'CANCELLED' &&
              order.orderStatus !== 'DELIVERED' && (
              <Row className="mb-2">
                <Col lg="12">
                  <div>
                    {loading && (
                      <Loader
                        className="text-center"
                        type="TailSpin"
                        color="#fb6340"
                        height={40}
                        width={40}
                        visible={loading}
                      />
                    )}
                    <FormGroup
                      className={
                        reasonError === null
                          ? ''
                          : reasonError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <Button
                            disabled={
                              order.orderStatus !== 'CANCELLED' &&
                                order.orderStatus !== 'PENDING'
                            }
                            color="success"
                            onClick={() => {
                              mutate({
                                variables: {
                                  id: order._id,
                                  status: 'ACCEPTED',
                                  reason: ''
                                }
                              })
                            }}>
                            {order && order.status === true
                              ? 'Accepted'
                              : 'Accept'}
                          </Button>
                        </InputGroupAddon>
                        <Input
                          style={{ marginLeft: '5px' }}
                          placeholder="Reason if rejected..."
                          value={(order && order.reason) || reason}
                          // readOnly={status === false}
                          onChange={event => {
                            reasonSetter(event.target.value)
                          }}
                          maxLength={20}
                        />
                        <InputGroupAddon addonType="append">
                          <Button
                            disabled={order.orderStatus === 'CANCELLED'}
                            color="danger"
                            onClick={() => {
                              if (validateReason()) {
                                mutate({
                                  variables: {
                                    id: order._id,
                                    status: 'CANCELLED',
                                    reason: order.reason
                                  }
                                })
                              }
                            }}>
                            {order.status === false ? 'Cancelled' : 'Cancel'}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                  </div>
                </Col>
              </Row>
            )}
            {loadingQuery && null}
            <Row>
              <Col lg="6">
                <label className="form-control-label" htmlFor="input-items">
                  {t('Items')}
                </label>

                {order &&
                  order.items.map(item => {
                    return (
                      <Col key={item._id}>
                        <Row>
                          <ListGroupItem className="justify-content-between">
                            <Badge
                              style={{
                                fontSize: '12px',
                                backgroundColor: 'grey',
                                marginRight: '10px'
                              }}
                              pill>
                              {item.quantity}
                            </Badge>
                            {`${item.title}${
                              item.variation.title
                                ? `(${item.variation.title})`
                                : ''
                            }`}
                            <Badge
                              style={{
                                fontSize: '12px',
                                backgroundColor: 'black',
                                float: 'right'
                              }}
                              pill>
                              {data && data.configuration.currencySymbol}{' '}
                              {(item.variation.price * item.quantity).toFixed(
                                2
                              )}
                            </Badge>
                          </ListGroupItem>
                        </Row>
                        {item.specialInstructions.length > 0 && (
                          <Row>
                            <Col>
                              <Media>
                                <Media body>
                                  <Media heading>Special Instructions</Media>
                                  {item.specialInstructions}
                                </Media>
                              </Media>
                            </Col>
                          </Row>
                        )}
                        {!!item.addons.length && (
                          <Row>
                            <Col>
                              <UncontrolledDropdown>
                                <DropdownToggle caret>Addons</DropdownToggle>
                                <DropdownMenu>
                                  {item &&
                                    item.addons.map(addon => {
                                      return addon.options.map(
                                        (option, index) => (
                                          <DropdownItem key={index}>
                                            {addon.title}: - {option.title}{' '}
                                            <Badge
                                              style={{
                                                fontSize: '12px',
                                                backgroundColor: 'black',
                                                float: 'right'
                                              }}
                                              pill>
                                              {data &&
                                                data.configuration
                                                  .currencySymbol}{' '}
                                              {option.price}
                                            </Badge>
                                          </DropdownItem>
                                        )
                                      )
                                    })}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </Col>
                          </Row>
                        )}
                      </Col>
                    )
                  })}
              </Col>
              <Col lg="6">
                <Row>
                  <Col md="12">
                    <label className="form-control-label" htmlFor="input-price">
                      {t('Charges')}
                    </label>
                    <FormGroup>
                      <ListGroup id="input-price">
                        <ListGroupItem className="justify-content-between">
                          Subtotal
                          <Badge
                            style={{
                              fontSize: '12px',
                              color: 'black',
                              float: 'right'
                            }}
                            pill>
                            {data && data.configuration.currencySymbol}{' '}
                            {(
                              order.orderAmount -
                              order.deliveryCharges -
                              order.tipping -
                              order.taxationAmount
                            ).toFixed(2)}
                          </Badge>
                        </ListGroupItem>
                        <ListGroupItem className="justify-content-between">
                          Delivery Charges
                          <Badge
                            style={{
                              fontSize: '12px',
                              float: 'right',
                              color: 'black'
                            }}>
                            {data && data.configuration.currencySymbol}{' '}
                            {order && order.deliveryCharges.toFixed(2)}
                          </Badge>
                        </ListGroupItem>
                        <ListGroupItem className="justify-content-between">
                          Taxation Charges
                          <Badge
                            style={{
                              fontSize: '12px',
                              float: 'right',
                              color: 'black'
                            }}>
                            {data && data.configuration.currencySymbol}{' '}
                            {order && order.taxationAmount.toFixed(2)}
                          </Badge>
                        </ListGroupItem>
                        <ListGroupItem className="justify-content-between">
                          Tip
                          <Badge
                            style={{
                              fontSize: '12px',
                              float: 'right',
                              color: 'black'
                            }}>
                            {data && data.configuration.currencySymbol}{' '}
                            {order && order.tipping.toFixed(2)}
                          </Badge>
                        </ListGroupItem>
                        <ListGroupItem className="justify-content-between">
                          Total
                          <Badge
                            style={{
                              fontSize: '12px',
                              color: 'black',
                              float: 'right'
                            }}
                            pill>
                            {data && data.configuration.currencySymbol}{' '}
                            {order && order.orderAmount.toFixed(2)}
                          </Badge>
                        </ListGroupItem>
                      </ListGroup>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <label
                      className="form-control-label"
                      htmlFor="input-payment">
                      {t('Payment')}
                    </label>
                    <FormGroup>
                      <ListGroup id="input-payment">
                        <ListGroupItem className="justify-content-between">
                          Payment Method
                          <Badge
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'green',
                              float: 'right'
                            }}
                            pill>
                            {order.paymentMethod}
                          </Badge>
                        </ListGroupItem>
                        <ListGroupItem className="justify-content-between">
                          Paid Amount
                          <Badge
                            style={{
                              fontSize: '12px',
                              float: 'right',
                              color: 'black'
                            }}>
                            {data && data.configuration.currencySymbol}{' '}
                            {order && order.paidAmount
                              ? order.paidAmount.toFixed(2)
                              : 0}
                          </Badge>
                        </ListGroupItem>
                      </ListGroup>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}
export default withTranslation()(Order)
