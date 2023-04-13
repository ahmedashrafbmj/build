import React, { useState } from 'react'
import Restaurants from '../components/Restaurant/Card'
import { Link } from 'react-router-dom'
import { Container, Row, Button, Modal } from 'reactstrap'
import Header from '../components/Headers/Header'
import { useQuery, gql } from '@apollo/client'
import { restaurantByOwner } from '../apollo'
import CreateRestaurant from '../components/Restaurant/CreateRestaurant'
import { useRestaurantContext } from '../context/Restaurant'

const RESTAURANT_BY_OWNER = gql`
  ${restaurantByOwner}
`
const Restaurant = props => {
  const { setId, setName, setImage } = useRestaurantContext()
  const [owner, setOwner] = useState()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const id = props.location.state ? props.location.state.id : ''
  const toggleModal = () => {
    setIsModalVisible(prevState => !prevState)
  }
  const loggedInUser = localStorage.getItem('user-enatega')
  const { userType } = loggedInUser ? JSON.parse(loggedInUser) : {}

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    RESTAURANT_BY_OWNER,
    {
      variables: { id: id }
    }
  )
  const links =
    data &&
    data.restaurantByOwner.restaurants.map((rest, index) => {
      return (
        <Link
          key={rest._id}
          onClick={() => {
            setId(rest._id)
            setName(rest.name)
            setImage(rest.image)
          }}
          to={`/admin/dashboard/${rest.slug}`}>
          <Restaurants key={rest._id} rest={rest} />
        </Link>
      )
    })
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          {loadingQuery ? <div>loading</div> : null}
          {errorQuery ? <span>`${errorQuery.message}`</span> : null}${links}
          {userType === 'ADMIN' && (
            <div
              style={{
                padding: '5%',
                width: '220px',
                marginRight: '20px'
              }}>
              <Button
                className="btn-icon btn-3"
                color="primary"
                type="button"
                onClick={() => {
                  setOwner(data.restaurantByOwner._id)
                  toggleModal()
                }}>
                <span className="btn-inner--icon">
                  <i className="ni ni-bag-17" />
                </span>
                <span className="btn-inner--text">Add new restaurant</span>
              </Button>
            </div>
          )}
        </Row>
        <Modal
          className="modal-dialog-centered"
          size="lg"
          isOpen={isModalVisible}
          toggle={toggleModal}>
          <CreateRestaurant owner={owner} />
        </Modal>
      </Container>
    </>
  )
}
export default Restaurant
