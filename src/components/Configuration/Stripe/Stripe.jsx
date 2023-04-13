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
import { saveStripeConfiguration } from '../../../apollo'

const SAVE_STRIPE_CONFIGURATION = gql`
  ${saveStripeConfiguration}
`

function Stripe(props) {
  const formRef = useRef()
  const publishableKey = props.publishableKey || ''
  const secretKey = props.secretKey || ''
  const [publishError, publishErrorSetter] = useState(null)
  const [secretError, secretErrorSetter] = useState(null)

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const [mutate, { error, loading }] = useMutation(SAVE_STRIPE_CONFIGURATION)

  const validateInput = () => {
    let publishableKeyResult = true
    let secretKeyResult = true
    publishableKeyResult = !!formRef.current['input-publishablekey'].value
    secretKeyResult = !!formRef.current['input-secretkey'].value
    publishErrorSetter(publishableKeyResult)
    secretErrorSetter(secretKeyResult)
    return publishableKeyResult && secretKeyResult
  }

  const { t } = props
  return (
    <Row className="mt-3">
      <div className="col">
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">Stripe</h3>
          </CardHeader>
          <form ref={formRef}>
            <div className="pl-lg-4">
              <Row>
                <Col md="8">
                  <label
                    className="form-control-label"
                    htmlFor="input-publishablekey">
                    {t('Publishable Key')}
                  </label>
                  <FormGroup
                    className={
                      publishError === null
                        ? ''
                        : publishError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-publishablekey"
                      name="input-publishablekey"
                      placeholder="e.g pk_test_lEaBbVGnTkzja2FyFiNlbqtw"
                      type="password"
                      defaultValue={publishableKey}
                      onBlur={event => {
                        onBlur(
                          publishErrorSetter,
                          'publishableKey',
                          event.target.value.trim()
                        )
                      }}></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <label
                    className="form-control-label"
                    htmlFor="input-secretkey">
                    {t('Secret Key')}
                  </label>
                  <FormGroup
                    className={
                      secretError === null
                        ? ''
                        : secretError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-secretkey"
                      placeholder="e.g sk_test_rKNqVc2tSkdgZHNO3XnPCLn4"
                      type="password"
                      defaultValue={secretKey}
                      onBlur={event =>
                        onBlur(
                          secretErrorSetter,
                          'secretKey',
                          event.target.value.trim()
                        )
                      }></Input>
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
                              publishableKey:
                                formRef.current['input-publishablekey'].value,
                              secretKey:
                                formRef.current['input-secretkey'].value
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
export default withTranslation()(Stripe)
