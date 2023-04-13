import React from 'react'
import { withTranslation } from 'react-i18next'
import { Container } from 'reactstrap'
import { useQuery, gql } from '@apollo/client'
import Header from '../components/Headers/Header'
import { getConfiguration } from '../apollo'
import EmailConfiguration from '../components/Configuration/Email/Email'
import DeliveryRateConfiguration from '../components/Configuration/DeliveryRate/DeliveryRate'
import PaypalConfiguration from '../components/Configuration/Paypal/Paypal'
import StripeConfiguration from '../components/Configuration/Stripe/Stripe'
import CurrencyConfiguration from '../components/Configuration/Currency/Currency'

const GET_CONFIGURATION = gql`
  ${getConfiguration}
`
const Configuration = props => {
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_CONFIGURATION
  )
  const { t } = props
  return (
    <>
      <Header />
      {errorQuery && t('Error :(')}
      {loadingQuery ? (
        t('Loading')
      ) : (
        <Container className="mt--7" fluid>
          <EmailConfiguration
            emailName={data && data.configuration.emailName}
            email={data && data.configuration.email}
            password={data && data.configuration.password}
            enabled={data && data.configuration.enableEmail}
          />
          <DeliveryRateConfiguration
            deliveryRate={data && data.configuration.deliveryRate}
          />
          <PaypalConfiguration
            clientId={data && data.configuration.clientId}
            clientSecret={data && data.configuration.clientSecret}
            sandbox={data && data.configuration.sandbox}
          />
          <StripeConfiguration
            publishableKey={data && data.configuration.publishableKey}
            secretKey={data && data.configuration.secretKey}
          />
          <CurrencyConfiguration
            currencyCode={data && data.configuration.currency}
            currencySymbol={data && data.configuration.currencySymbol}
          />
        </Container>
      )}
    </>
  )
}

export default withTranslation()(Configuration)
