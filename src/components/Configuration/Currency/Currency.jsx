import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
import { Row, Col, Card, CardHeader, FormGroup, Form, Button } from 'reactstrap'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../../constraints/constraints'
import { Typeahead } from 'react-bootstrap-typeahead'
import { stripeCurrencies } from '../../../config/currencies'
import { saveCurrencyConfiguration } from '../../../apollo'
import Loader from 'react-loader-spinner'

const SAVE_CURRENCY_CONFIGURATION = gql`
  ${saveCurrencyConfiguration}
`

function Currency(props) {
  const [currencyCode, currencyCodeSetter] = useState(props.currencyCode || '')
  const [currencySymbol, currencySymbolSetter] = useState(
    props.currencySymbol || ''
  )
  const onCompleted = data => {
    console.log(data)
  }
  const onError = error => {
    console.log(error)
  }
  const [currencyCodeError, currencyCodeErrorSetter] = useState(null)
  const [currencySymbolError, currencySymbolErrorSetter] = useState(null)
  const [mutate, { error, loading }] = useMutation(
    SAVE_CURRENCY_CONFIGURATION,
    { onError, onCompleted }
  )

  const validateInput = () => {
    const currencyCodeError = !validateFunc(
      { currencyCode: currencyCode },
      'currencyCode'
    )
    const currencySymbolError = !validateFunc(
      { currencySymbol: currencySymbol },
      'currencySymbol'
    )
    currencyCodeErrorSetter(currencyCodeError)
    currencySymbolErrorSetter(currencySymbolError)
    return currencyCodeError && currencySymbolError
  }

  const onBlur = (setter, value, field) => {
    setter(!validateFunc({ [field]: value }, field))
  }
  const { t } = props
  var currencyCodesT = stripeCurrencies.map(val => val.currency)
  const currencyCodes = [...new Set(currencyCodesT)]
  var currencySymbolsT = stripeCurrencies.map(val => val.currencySymbol)
  const currencySymbols = [...new Set(currencySymbolsT)]
  return (
    <Row className="mt-3">
      <div className="col">
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">{t('Currency')}</h3>
          </CardHeader>
          <Form>
            <div className="pl-lg-4">
              <Row>
                <Col md="6">
                  <label className="form-control-label" htmlFor="input-orderid">
                    {t('Currency Code')}
                  </label>
                  <FormGroup
                    className={
                      currencyCodeError === null
                        ? ''
                        : currencyCodeError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Typeahead
                      defaultSelected={[currencyCode || '']}
                      onInputChange={value => {
                        currencyCodeSetter(value)
                      }}
                      labelKey="currencyCode"
                      options={currencyCodes}
                      placeholder={t('Currency Code')}
                      id="CurrencyCode"
                      onBlur={() => {
                        onBlur(
                          currencyCodeErrorSetter,
                          'currencyCode',
                          currencyCode
                        )
                      }}
                      onChange={values => {
                        currencyCodeSetter(values[0])
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col md="5">
                  <label className="form-control-label" htmlFor="input-orderid">
                    {t('Currency Symbol')}
                  </label>
                  <FormGroup
                    className={
                      currencySymbolError === null
                        ? ''
                        : currencySymbolError
                          ? 'has-success'
                          : 'has-danger'
                    }>
                    <Typeahead
                      defaultSelected={[currencySymbol || '']}
                      onInputChange={value => {
                        currencySymbolSetter(value)
                      }}
                      labelKey="currencySymbol"
                      options={currencySymbols}
                      placeholder={t('Currency Symbol')}
                      id="CurrencySymbol"
                      onBlur={() => {
                        onBlur(
                          currencySymbolErrorSetter,
                          'currencySymbol',
                          currencySymbol
                        )
                      }}
                      onChange={values => {
                        currencySymbolSetter(values[0])
                      }}
                    />
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
                            configurationInput: {
                              currency: currencyCode,
                              currencySymbol: currencySymbol
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
          </Form>
        </Card>
      </div>
    </Row>
  )
}

export default withTranslation()(Currency)
