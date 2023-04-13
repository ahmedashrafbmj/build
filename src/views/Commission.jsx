import React from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  Row
} from 'reactstrap'
import { useQuery, useMutation, gql } from '@apollo/client'
import Header from '../components/Headers/Header'
import { restaurants, updateCommission } from '../apollo'
import CustomLoader from '../components/Loader/CustomLoader'

const GET_RESTAURANTS = gql`
  ${restaurants}
`
const UPDATE_COMMISSION = gql`
  ${updateCommission}
`
const Commission = () => {
  const getValues = id => {
    const commissionRate = document.getElementById(id).value
    return { id, commissionRate: +commissionRate }
  }
  const [mutate, { error }] = useMutation(UPDATE_COMMISSION)

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_RESTAURANTS
  )
  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Card>
          <CardHeader>Commission rates</CardHeader>
          <CardBody>
            {errorQuery ? <span>error {errorQuery.message}</span> : null}
            {loadingQuery ? (
              <CustomLoader />
            ) : (
              data &&
              data.restaurants.map(restaurant => (
                <Row className="mt-2" key={restaurant._id}>
                  <Col sm="4">{restaurant.name}</Col>
                  <Col sm="4">
                    <InputGroup>
                      <Input
                        id={restaurant._id}
                        placeholder="commission percent"
                        min={0}
                        max={100}
                        type="number"
                        step="1"
                        defaultValue={restaurant.commissionRate}
                      />
                      <InputGroupAddon addonType="append">%</InputGroupAddon>
                    </InputGroup>
                  </Col>
                  <Col sm="4">
                    <Button
                      onClick={() => {
                        const result = getValues(restaurant._id)
                        mutate({ variables: result })
                      }}>
                      Save
                    </Button>
                    {error && <span>{error.message}</span>}
                  </Col>
                </Row>
              ))
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  )
}
export default Commission
