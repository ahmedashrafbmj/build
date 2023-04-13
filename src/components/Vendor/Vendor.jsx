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
// core components
import { createVendor, editVendor, getVendors } from '../../apollo'

const CREATE_VENDOR = gql`
  ${createVendor}
`
const EDIT_VENDOR = gql`
  ${editVendor}
`
const GET_VENDORS = gql`
  ${getVendors}
`

function Vendor(props) {
  const formRef = useRef()
  const mutation = props.vendor ? EDIT_VENDOR : CREATE_VENDOR
  const email = props.vendor ? props.vendor.email : ''
  const [error, errorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [emailError, emailErrorSetter] = useState(null)
  const [passError, passErrorSetter] = useState(null)
  const { t } = props
  const onCompleted = data => {
    if (!props.vendor) clearFields()
    const message = props.vendor
      ? 'Vendor updated successfully'
      : 'Vendor added successfully'
    errorSetter('')
    successSetter(message)
    setTimeout(hideAlert, 5000)
  }

  const onError = ({ graphQLErrors, networkError }) => {
    successSetter('')
    if (graphQLErrors) errorSetter(graphQLErrors[0].message)
    else if (networkError) errorSetter(networkError.result.errors[0].message)
    else errorSetter('Something went wrong!')
    setTimeout(hideAlert, 5000)
  }
  const [mutate, { loading: mutateLoading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_VENDORS }],
    onError,
    onCompleted
  })

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }

  const onSubmitValidaiton = () => {
    const emailError = !validateFunc(
      { email: formRef.current['input-email'].value },
      'email'
    )
    const passwordError = props.vendor
      ? true
      : !validateFunc(
        { password: formRef.current['input-password'].value },
        'password'
      )

    emailErrorSetter(emailError)
    passErrorSetter(passwordError)
    return emailError && passwordError
  }
  const clearFields = () => {
    formRef.current.reset()
    emailErrorSetter('')
    passErrorSetter('')
  }

  const hideAlert = () => {
    errorSetter('')
    successSetter('')
  }

  return (
    <Row>
      <Col className="order-xl-1">
        <Card className="bg-secondary shadow">
          <CardHeader className="bg-white border-0">
            <Row className="align-items-center">
              <Col xs="8">
                <h3 className="mb-0">
                  {props.vendor ? t('Edit Vendor') : t('Add Vendor')}
                </h3>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <form ref={formRef}>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6">
                    <label className="form-control-label" htmlFor="input-email">
                      {t('Email')}
                    </label>
                    <FormGroup
                      className={
                        emailError === null
                          ? ''
                          : emailError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative text-lowercase"
                        id="input-email"
                        name="input-email"
                        placeholder="e.g vendor@gmail.com"
                        type="email"
                        defaultValue={email}
                        onBlur={event =>
                          onBlur(emailErrorSetter, 'email', event.target.value)
                        }
                      />
                    </FormGroup>
                  </Col>
                  {!props.vendor && (
                    <Col lg="6">
                      <label
                        className="form-control-label"
                        htmlFor="input-password">
                        {t('Password')}
                      </label>
                      <FormGroup
                        className={
                          passError === null
                            ? ''
                            : passError
                              ? 'has-success'
                              : 'has-danger'
                        }>
                        <Input
                          className="form-control-alternative"
                          id="input-password"
                          name="input-password"
                          placeholder="e.g 132"
                          type="text"
                          onBlur={event => {
                            onBlur(
                              passErrorSetter,
                              'password',
                              event.target.value
                            )
                          }}
                        />
                      </FormGroup>
                    </Col>
                  )}
                </Row>

                <Row>
                  <Col className="text-right" lg="6">
                    <Button
                      disabled={mutateLoading}
                      color="primary"
                      onClick={async e => {
                        e.preventDefault()
                        if (onSubmitValidaiton() && !mutateLoading) {
                          mutate({
                            variables: {
                              vendorInput: {
                                _id: props.vendor ? props.vendor._id : '',
                                email: formRef.current[
                                  'input-email'
                                ].value.toLowerCase(),
                                password: formRef.current['input-password']
                                  ? formRef.current['input-password'].value
                                  : ''
                              }
                            }
                          })
                        }
                      }}
                      size="md">
                      {props.vendor ? 'Update' : t('Save')}
                    </Button>
                  </Col>
                </Row>
              </div>
            </form>
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
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}
export default withTranslation()(Vendor)
