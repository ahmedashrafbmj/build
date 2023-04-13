import React, { useRef, useState } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
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
import { editTipping, getTipping, createTipping } from '../../apollo'

const GET_TIPPING = gql`
  ${getTipping}
`
const EDIT_TIPPING = gql`
  ${editTipping}
`

const CREATE_TIPPING = gql`
  ${createTipping}
`

function Tipping(props) {
  const formRef = useRef()
  // const mutation = props.coupon ? EDIT_COUPON : CREATE_COUPON
  const [tip1Error, setTip1Error] = useState(null)
  const [tip2Error, setTip2Error] = useState(null)
  const [tip3Error, setTip3Error] = useState(null)
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const onCompleted = data => {
    const message = 'Tipping updated'
    successSetter(message)
    setTip1Error(null)
    setTip2Error(null)
    setTip3Error(null)
    mainErrorSetter('')
    clearFields()
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
  const onSubmitValidaiton = () => {
    const form = formRef.current
    const tip1 = form.tip1.value
    const tip2 = form.tip2.value
    const tip3 = form.tip3.value

    const tip1Errors = !validateFunc({ tip: tip1 }, 'tip')
    const tip2Errors = !validateFunc({ tip: tip2 }, 'tip')
    const tip3Errors = !validateFunc({ tip: tip3 }, 'tip')

    setTip1Error(tip1Errors)
    setTip2Error(tip2Errors)
    setTip3Error(tip3Errors)

    if (!(tip1Errors && tip2Errors && tip3Errors)) {
      mainErrorSetter('Fields Required')
    }
    return tip1Errors && tip2Errors && tip3Errors
  }
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_TIPPING,
    onError,
    onCompleted
  )
  const mutation = data && data.tips._id ? EDIT_TIPPING : CREATE_TIPPING

  const [mutate, { error, loading }] = useMutation(mutation)

  const clearFields = () => {
    formRef.current.reset()
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
                  {props.coupon ? t('Edit Tipping') : t('Add Tipping')}
                </h3>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            {errorQuery ? <span>{error.message}</span> : null}
            {loadingQuery ? (
              <span>{t('Loading...')}</span>
            ) : (
              <form ref={formRef}>
                <div className="pl-lg-4">
                  <Row>
                    <Col md="12">
                      <FormGroup tag="fieldset">
                        <label className="form-control-label">
                          Tipping Options (%)
                        </label>
                        <Row>
                          <Col lg="4">
                            <FormGroup
                              className={
                                tip1Error === false
                                  ? 'has-danger'
                                  : tip1Error === true
                                    ? 'has-success'
                                    : ''
                              }>
                              <Input
                                name="tip1"
                                className="form-control-alternative"
                                id="input-type-tip1"
                                placeholder="e.g 10"
                                type="number"
                                defaultValue={
                                  data && data.tips.tipVariations
                                    ? data.tips.tipVariations[0]
                                    : ''
                                }
                                autoComplete="off"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="4">
                            <FormGroup
                              className={
                                tip2Error === false
                                  ? 'has-danger'
                                  : tip2Error === true
                                    ? 'has-success'
                                    : ''
                              }>
                              <Input
                                name="tip2"
                                className="form-control-alternative"
                                id="input-type-tip2"
                                placeholder="e.g 12"
                                type="number"
                                defaultValue={
                                  data && data.tips.tipVariations
                                    ? data.tips.tipVariations[1]
                                    : ''
                                }
                                autoComplete="off"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="4">
                            <FormGroup
                              className={
                                tip3Error === false
                                  ? 'has-danger'
                                  : tip3Error === true
                                    ? 'has-success'
                                    : ''
                              }>
                              <Input
                                name="tip3"
                                className="form-control-alternative"
                                id="input-type-tip3"
                                placeholder="e.g 15"
                                type="number"
                                defaultValue={
                                  data && data.tips.tipVariations
                                    ? data.tips.tipVariations[2]
                                    : ''
                                }
                                autoComplete="off"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                  </Row>
                  <hr />
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

                    <Col xs="6">
                      <Button
                        color="primary"
                        disabled={loading}
                        className="btn-block"
                        onClick={async e => {
                          e.preventDefault()
                          if (onSubmitValidaiton()) {
                            const form = formRef.current
                            const tipArray = []
                            tipArray.push(Number(form.tip1.value))
                            tipArray.push(Number(form.tip2.value))
                            tipArray.push(Number(form.tip3.value))
                            mutate({
                              variables: {
                                tippingInput: {
                                  _id: data.tips._id,
                                  tipVariations: tipArray,
                                  enabled: true
                                }
                              }
                            })
                          }
                        }}
                        size="lg">
                        {loading ? t('Saving...') : t('Save')}
                      </Button>
                    </Col>
                  </Row>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default withTranslation()(Tipping)
