import React, { useRef, useState } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Row,
  Col,
  Card,
  CardHeader,
  FormGroup,
  Input,
  Button
} from 'reactstrap'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../../constraints/constraints'
import { saveEmailConfiguration } from '../../../apollo'

const SAVE_EMAIL_CONFIGURATION = gql`
  ${saveEmailConfiguration}
`

function Email(props) {
  const formRef = useRef()
  const email = props.email || ''
  const password = props.password || ''
  const emailName = props.emailName || ''
  const enableEmail = !!props.enabled
  const [emailError, emailErrorSetter] = useState(null)
  const [passwordError, passwordErrorSetter] = useState(null)
  const [emailNameError, emailNameErrorSetter] = useState(null)
  const [mutate, { error, loading }] = useMutation(SAVE_EMAIL_CONFIGURATION)

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const validateInput = () => {
    let emailResult = true
    let passwordResult = true
    let emailNameResult = true
    emailResult = !validateFunc(
      { email: formRef.current['input-email'].value },
      'email'
    )
    emailNameResult = !validateFunc(
      { email: formRef.current['input-emailName'].value },
      'emailName'
    )
    passwordResult = !validateFunc(
      { password: formRef.current['input-password'].value },
      'password'
    )
    emailErrorSetter(emailResult)
    passwordErrorSetter(passwordResult)
    emailNameErrorSetter(emailNameResult)
    return emailResult && passwordResult && emailNameResult
  }
  const { t } = props
  return (
    <Row className="mt-3">
      <div className="col">
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">{t('Email')}</h3>
          </CardHeader>
          <form ref={formRef}>
            <div className="pl-lg-4">
              <Row>
                <Col md="8">
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
                      disabled
                      className="form-control-alternative"
                      id="input-email"
                      name="input-email"
                      placeholder="e.g something@email.com"
                      type="password"
                      defaultValue={email}
                      onBlur={event =>
                        onBlur(emailErrorSetter, 'email', event.target.value)
                      }></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <label
                    className="form-control-label"
                    htmlFor="input-emailName">
                    {t('Email Name')}
                  </label>
                  <FormGroup
                    className={
                      emailNameError === null
                        ? ''
                        : emailNameError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-emailName"
                      name="input-emailName"
                      placeholder="e.g Enatega"
                      type="password"
                      defaultValue={emailName}
                      onBlur={event =>
                        onBlur(
                          emailNameErrorSetter,
                          'emailName',
                          event.target.value
                        )
                      }></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <label
                    className="form-control-label"
                    htmlFor="input-password">
                    {t('Password')}
                  </label>
                  <FormGroup
                    className={
                      passwordError === null
                        ? ''
                        : passwordError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-password"
                      name="input-password"
                      placeholder="e.g FOOD-"
                      type="password"
                      defaultValue={password}
                      onBlur={event =>
                        onBlur(
                          passwordErrorSetter,
                          'password',
                          event.target.value
                        )
                      }></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <label className="form-control-label" htmlFor="input-enable">
                    {t('Enable/Disable')}
                  </label>
                  <FormGroup>
                    <label className="custom-toggle">
                      <input
                        disabled
                        name="input-enable"
                        defaultChecked={enableEmail}
                        type="checkbox"
                      />
                      <span className="custom-toggle-slider rounded-circle" />
                    </label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="4">
                  {loading ? t('Saving') : null}
                  {error ? t('Error') : null}
                  <Button
                    disabled
                    className="btn-block mb-2"
                    type="button"
                    color="primary"
                    onClick={e => {
                      e.preventDefault()
                      if (validateInput() && !loading) {
                        mutate({
                          variables: {
                            configurationInput: {
                              email: formRef.current['input-email'].value,
                              emailName:
                                formRef.current['input-emailName'].value,
                              password: formRef.current['input-password'].value,
                              enableEmail:
                                formRef.current['input-enable'].checked
                            }
                          }
                        })
                      }
                    }}
                    size="lg">
                    {t('Save')}
                  </Button>
                </Col>
              </Row>
            </div>
          </form>
        </Card>
      </div>
    </Row>
  )
}
export default withTranslation()(Email)
