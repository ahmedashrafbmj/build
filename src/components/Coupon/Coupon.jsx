import React, { useRef, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  Row,
  Col,
  UncontrolledAlert
} from 'reactstrap'
import { editCoupon, createCoupon, getCoupons } from '../../apollo'

const CREATE_COUPON = gql`
  ${createCoupon}
`
const EDIT_COUPON = gql`
  ${editCoupon}
`
const GET_COUPONS = gql`
  ${getCoupons}
`

function Category(props) {
  const formRef = useRef()
  const title = props.coupon ? props.coupon.title : ''
  const discount = props.coupon ? props.coupon.discount : ''
  const enabled = props.coupon ? props.coupon.enabled : false
  const mutation = props.coupon ? EDIT_COUPON : CREATE_COUPON
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [titleError, titleErrorSetter] = useState(null)
  const [discountError, discountErrorSetter] = useState(null)
  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const onCompleted = data => {
    const message = props.coupon ? 'Coupon updated' : 'Coupon added'
    successSetter(message)
    mainErrorSetter('')
    if (!props.coupon) clearFields()
  }
  const onError = error => {
    let message = ''
    try {
      message = error.graphQLErrors[0].message
    } catch (err) {
      message = 'Action failed. Please Try again'
    }
    successSetter('')
    mainErrorSetter(message)
  }
  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_COUPONS }],
    onError,
    onCompleted
  })

  const onSubmitValidaiton = () => {
    const titleError = !validateFunc(
      { title: formRef.current['input-code'].value },
      'title'
    )
    const discountError = !validateFunc(
      { discount: formRef.current['input-discount'].value },
      'discount'
    )
    titleErrorSetter(titleError)
    discountErrorSetter(discountError)
    return titleError && discountError
  }
  const clearFields = () => {
    formRef.current.reset()
    titleErrorSetter(null)
    discountErrorSetter(null)
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
                  {props.coupon ? t('Edit Coupon') : t('Add Coupon')}
                </h3>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <form ref={formRef}>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6">
                    <label className="form-control-label" htmlFor="input-code">
                      {t('Title')}
                    </label>
                    <br />
                    <small>&nbsp;</small>
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
                        id="input-code"
                        name="input-code"
                        placeholder="e.g SALE50"
                        type="text"
                        defaultValue={title}
                        onBlur={event =>
                          onBlur(titleErrorSetter, 'title', event.target.value)
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="6">
                    <label
                      className="form-control-label"
                      htmlFor="input-discount">
                      {t('Discount Percent')}
                    </label>
                    <br />
                    <small>Between 1 and 100</small>
                    <FormGroup
                      className={
                        discountError === null
                          ? ''
                          : discountError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-discount"
                        name="input-discount"
                        placeholder="1-99"
                        type="number"
                        defaultValue={discount}
                        onBlur={event => {
                          onBlur(
                            discountErrorSetter,
                            'discount',
                            event.target.value
                          )
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                {!props.coupon && (
                  <Row>
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
                            name="input-checkbox"
                          />
                          <span className="custom-toggle-slider rounded-circle" />
                        </label>
                      </FormGroup>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col lg="6">
                    {success && (
                      <UncontrolledAlert color="success" fade={true}>
                        <span className="alert-inner--text">{success}</span>
                      </UncontrolledAlert>
                    )}
                    {mainError && (
                      <UncontrolledAlert color="danger" fade={true}>
                        <span className="alert-inner--text">{mainError}</span>
                      </UncontrolledAlert>
                    )}
                  </Col>
                  {loading ? t('Loading') : null}
                  <Col className="text-right" lg="6">
                    <Button
                      disabled={loading}
                      color="primary"
                      onClick={async e => {
                        e.preventDefault()
                        if (onSubmitValidaiton() && !loading) {
                          mutate({
                            variables: {
                              couponInput: {
                                _id: props.coupon ? props.coupon._id : '',
                                title: formRef.current['input-code'].value,
                                discount: +formRef.current['input-discount']
                                  .value,
                                enabled: props.coupon
                                  ? enabled
                                  : formRef.current['input-checkbox'].checked
                              }
                            }
                          })
                        }
                      }}
                      size="md">
                      {t('Save')}
                    </Button>
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

export default withTranslation()(Category)
