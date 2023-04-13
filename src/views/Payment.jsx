import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import {
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
  Button
} from 'reactstrap'

import Header from '../components/Headers/Header'
import { SERVER_URL } from '../config/constants'
import { getRestaurantProfile } from '../apollo'
import Badge from 'reactstrap/lib/Badge'
import { useRestaurantContext } from '../context/Restaurant'
const RESTAURANT = gql`
  ${getRestaurantProfile}
`
const Payment = () => {
  const { id: restaurantId } = useRestaurantContext()
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    RESTAURANT,
    {
      variables: { id: restaurantId }
    }
  )
  const submitStripeDetails = () => {
    fetch(SERVER_URL + '/stripe/account', {
      method: 'POST',
      body: JSON.stringify({ restaurantId }),
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        window.location = data.url
      })
      .catch(error => {
        console.log('error', error)
      })
  }
  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row className="mt-5">
          <Card className="shadow col-12">
            <CardHeader>Payment</CardHeader>
            <CardBody>
              <Row lg="12" offset="4">
                {loadingQuery && null}
                {errorQuery && <span>{errorQuery.message}</span>}
                {data && data.restaurant.stripeDetailsSubmitted && (
                  <Col>
                    <Badge color="primary">Stripe details attached</Badge>
                  </Col>
                )}
                <Col>
                  <Button onClick={submitStripeDetails}>
                    {data && data.restaurant.stripeDetailsSubmitted
                      ? 'Edit Stripe details'
                      : 'Submit Stripe Details'}
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Row>
      </Container>
    </>
  )
}
export default withTranslation()(Payment)
