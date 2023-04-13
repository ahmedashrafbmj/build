import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Row,
  Col,
  Card,
  CardHeader,
  FormGroup,
  Form,
  Button,
  Input
} from 'reactstrap'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../../constraints/constraints'
import { saveDeliveryRateConfiguration } from '../../../apollo'
import Loader from 'react-loader-spinner'

const SAVE_DELIVERY_RATE_CONFIGURATION = gql`
  ${saveDeliveryRateConfiguration}
`

function Currency(props) {
  const [deliveryRate, setDeliveryRate] = useState(props.deliveryRate || 0)

  const [deliveryRateError, setDeliveryRateError] = useState(null)
  const [mutate, { error, loading }] = useMutation(
    SAVE_DELIVERY_RATE_CONFIGURATION
  )

  const validateInput = () => {
    const deliveryRateErrors = !validateFunc(
      { deliveryRate: deliveryRate },
      'deliveryRate'
    )

    setDeliveryRateError(deliveryRateErrors)
    return deliveryRateErrors
  }
  const onBlur = (setter, value, field) => {
    setter(!validateFunc({ [field]: value }, field))
  }
  const { t } = props

  return (
    <Row className="mt-3">
      <div className="col">
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">{t('Delivery')}</h3>
          </CardHeader>
          <Form>
            <div className="pl-lg-4">
              <Row>
                <Col md="8">
                  <label className="form-control-label" htmlFor="input-orderid">
                    {t('Delivery Rate')}
                  </label>
                  <FormGroup
                    className={
                      deliveryRateError === null
                        ? ''
                        : deliveryRateError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Input
                      disabled
                      className="form-control-alternative"
                      id="input-delivery"
                      name="input-delivery"
                      placeholder="e.g 5"
                      type="text"
                      defaultValue={deliveryRate}
                      onChange={e => {
                        setDeliveryRate(e.target.value)
                      }}
                      onBlur={event =>
                        onBlur(
                          setDeliveryRateError,
                          'deliveryRate',
                          event.target.value
                        )
                      }></Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="4">
                  {loading ? (
                    <Button
                      className="btn-block mb-2"
                      color="primary"
                      onClick={() => null}>
                      <Loader
                        type="TailSpin"
                        color="#FFF"
                        height={25}
                        width={30}
                        visible={loading}
                      />
                    </Button>
                  ) : null}
                  {error ? 'Error :(' : null}
                  <Button
                    className="btn-block mb-2"
                    type="button"
                    disabled
                    color="primary"
                    onClick={e => {
                      e.preventDefault()
                      if (validateInput()) {
                        mutate({
                          variables: {
                            deliveryRate: Number(deliveryRate)
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
          </Form>
        </Card>
      </div>
    </Row>
  )
}

export default withTranslation()(Currency)
