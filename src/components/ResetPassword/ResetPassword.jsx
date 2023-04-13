import React, { useState, useRef } from 'react'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
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
import { vendorResetPassword } from '../../apollo'

const CHANGE_PASSWORD = gql`
  ${vendorResetPassword}
`

function ResetPassword(props) {
  const formRef = useRef()
  const [passError, passErrorSetter] = useState(null)
  const [confirmPassError, confirmPassErrorSetter] = useState(null)
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }

  const onSubmitValidaiton = () => {
    const oldPassword = !validateFunc(
      { password: formRef.current['input-oldPassword'].value },
      'password'
    )
    const newPassword = !validateFunc(
      { password: formRef.current['input-newPassword'].value },
      'password'
    )
    passErrorSetter(oldPassword)
    confirmPassErrorSetter(newPassword)

    return oldPassword && newPassword
  }
  const onCompleted = data => {
    const message = 'Password Changed successfully'
    mainErrorSetter('')
    successSetter(message)
    setTimeout(hideAlert, 5000)
  }
  const onError = ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      mainErrorSetter(graphQLErrors[0].message)
    }
    if (networkError) {
      mainErrorSetter(networkError.result.errors[0].message)
    }
    successSetter('')
    setTimeout(hideAlert, 5000)
  }
  const hideAlert = () => {
    mainErrorSetter('')
    successSetter('')
  }
  const [mutate, { loading }] = useMutation(CHANGE_PASSWORD, {
    onError,
    onCompleted
  })

  const { t } = props
  return (
    <>
      <Row>
        <Col className="order-xl-1">
          <Card className="bg-secondary shadow">
            <CardHeader className="bg-white border-0">
              <Row className="align-items-center">
                <Col xs="8">
                  <h3 className="mb-0">Reset Password</h3>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {loading && t('Loading')}
              <form ref={formRef}>
                <div className="pl-lg-4">
                  <Row>
                    <Col md="12">
                      <label
                        className="form-control-label"
                        htmlFor="input-oldPassword">
                        {t('Old Password')}
                      </label>
                      <br />
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
                          id="input-oldPassword"
                          name="input-oldPassword"
                          placeholder="e.g password"
                          maxLength="30"
                          type="password"
                          defaultValue=""
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
                  </Row>
                  <Row>
                    <Col md="12">
                      <label
                        className="form-control-label"
                        htmlFor="input-newPassword">
                        {t('New Password')}
                      </label>
                      <br />
                      <FormGroup
                        className={
                          confirmPassError === null
                            ? ''
                            : confirmPassError
                              ? 'has-success'
                              : 'has-danger'
                        }>
                        <Input
                          className="form-control-alternative"
                          id="input-newPassword"
                          name="input-newPassword"
                          placeholder="e.g password"
                          maxLength="30"
                          type="password"
                          defaultValue=""
                          onBlur={event => {
                            onBlur(
                              confirmPassErrorSetter,
                              'password',
                              event.target.value
                            )
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg="4" />
                    <Col lg="4">
                      <Button
                        color="primary"
                        onClick={async e => {
                          e.preventDefault()
                          if (onSubmitValidaiton()) {
                            mutate({
                              variables: {
                                oldPassword:
                                  formRef.current['input-oldPassword'].value,
                                newPassword:
                                  formRef.current['input-newPassword'].value
                              }
                            })
                          }
                        }}
                        size="md">
                        {t('Change Password')}
                      </Button>
                    </Col>
                  </Row>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg="3" />
        <Col lg="6">
          {mainError && (
            <UncontrolledAlert color="danger" fade={true}>
              <span className="alert-inner--icon">
                <i className="ni ni-like-2" />
              </span>{' '}
              <span className="alert-inner--text">
                <strong>{t('Danger')}!</strong> {mainError}
              </span>
            </UncontrolledAlert>
          )}
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
        </Col>
      </Row>
    </>
  )
}

export default withTranslation()(ResetPassword)
