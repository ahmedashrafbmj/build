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
import { savePaypalConfiguration } from '../../../apollo'

const SAVE_PAYPAL_CONFIGURATION = gql`
  ${savePaypalConfiguration}
`

function Paypal(props) {
  const formRef = useRef()
  const clientId = props.clientId || ''
  const clientSecret = props.clientSecret || ''
  const sandbox = !!props.sandbox
  const [clientIdError, clientIdErrorSetter] = useState(null)
  const [clientSecretError, clientSecretErrorSetter] = useState(null)
  const [mutate, { error, loading }] = useMutation(SAVE_PAYPAL_CONFIGURATION)

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const validateInput = () => {
    let clientIdResult = true
    let clientSecretResult = true
    clientIdResult = !!formRef.current['input-clientid'].value
    clientSecretResult = !!formRef.current['input-clientsecret'].value
    clientIdErrorSetter(clientIdResult)
    clientIdErrorSetter(clientSecretResult)
    return clientIdResult && clientSecretResult
  }
  const { t } = props
  return (
    <Row className="mt-3">
      <div className="col">
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">{t('Paypal')}</h3>
          </CardHeader>
          <form ref={formRef}>
            <div className="pl-lg-4">
              <Row>
                <Col md="8">
                  <label
                    className="form-control-label"
                    htmlFor="input-clientid">
                    {t('Client ID')}
                  </label>
                  <FormGroup
                    className={
                      clientIdError === null
                        ? ''
                        : clientIdError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-clientid"
                      name="input-clientid"
                      placeholder="e.g AeGIgSX--JEVwoQgLjGOb8gh1DUJG0MFVgLc2mBIe6_V5NefV0LM3L78m01fLLI6U2FFB-qJr4ErrtL1"
                      type="password"
                      defaultValue={clientId}
                      onBlur={event =>
                        onBlur(
                          clientIdErrorSetter,
                          'clientId',
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
                    htmlFor="input-clientsecret">
                    {t('Client Secret')}
                  </label>
                  <FormGroup
                    className={
                      clientSecretError === null
                        ? ''
                        : clientSecretError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-clientsecret"
                      name="input-clientsecret"
                      placeholder="e.g EHAP6CSZt3kwzcpdxrpw16PqHEspw5wtJCVVux_95e2Qcwbeh6mQp9GncEbxnVFkEbJu4z1i-GuDDthf"
                      type="password"
                      defaultValue={clientSecret}
                      onBlur={event => {
                        onBlur(
                          clientSecretErrorSetter,
                          'clientSecret',
                          event.target.value
                        )
                      }}></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <label className="form-control-label" htmlFor="input-enable">
                    {t('Sandbox')}
                  </label>
                  <FormGroup>
                    <label className="custom-toggle">
                      <input
                        disabled
                        name="input-sandbox"
                        defaultChecked={sandbox}
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
                              clientId: formRef.current['input-clientid'].value,
                              clientSecret:
                                formRef.current['input-clientsecret'].value,
                              sandbox: formRef.current['input-sandbox'].checked
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

export default withTranslation()(Paypal)
