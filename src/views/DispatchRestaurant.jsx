/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Container,
  Row,
  Card,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import DataTable from 'react-data-table-component'
import { getActiveOrders, subscriptionOrder, updateStatus } from '../apollo'
import Header from '../components/Headers/Header'
import CustomLoader from '../components/Loader/CustomLoader'
import { transformToNewline } from '../utils/stringManipulations'
import SearchBar from '../components/TableHeader/SearchBar'
import { useParams } from 'react-router-dom'
import { useRestaurantContext } from '../context/Restaurant'

const SUBSCRIPTION_ORDER = gql`
  ${subscriptionOrder}
`
const UPDATE_STATUS = gql`
  ${updateStatus}
`
const GET_ACTIVE_ORDERS = gql`
  ${getActiveOrders}
`

const DispatchRestaurant = props => {
  const params = useParams()
  console.log('params', params)
  const { id } = useRestaurantContext()
  const [restaurantId, seteRestaurantId] = useState(null)
  useEffect(() => {
    if (params.id) seteRestaurantId(params.id)
    else if (id) seteRestaurantId(id)
  }, [])
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutateUpdate] = useMutation(UPDATE_STATUS)

  const {
    data: dataOrders,
    error: errorOrders,
    loading: loadingOrders,
    refetch: refetchOrders
  } = useQuery(GET_ACTIVE_ORDERS, {
    variables: { restaurantId },
    pollInterval: 3000,
    skip: restaurantId === null
  })

  const statusFunc = row => {
    return (
      <div style={{ overflow: 'visible' }}>
        <UncontrolledDropdown size="sm" style={{ overflow: 'visible' }}>
          <DropdownToggle caret>Select</DropdownToggle>
          <DropdownMenu>
            {row.orderStatus === 'PENDING' && (
              <DropdownItem
                onClick={() => {
                  mutateUpdate({
                    variables: {
                      id: row._id,
                      orderStatus: 'ACCEPTED'
                    }
                  })
                }}>
                Accept
              </DropdownItem>
            )}
            {['PENDING', 'ACCEPTED', 'PICKED', 'ASSIGNED'].includes(
              row.orderStatus
            ) && (
              <DropdownItem
                onClick={() => {
                  mutateUpdate({
                    variables: {
                      id: row._id,
                      orderStatus: 'CANCELLED'
                    }
                  })
                }}>
                Reject
              </DropdownItem>
            )}
            {['PENDING', 'ACCEPTED', 'PICKED', 'ASSIGNED'].includes(
              row.orderStatus
            ) && (
              <DropdownItem
                onClick={() => {
                  mutateUpdate({
                    variables: {
                      id: row._id,
                      orderStatus: 'DELIVERED'
                    }
                  })
                }}>
                Delivered
              </DropdownItem>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
  const subscribeFunc = row => {
    const { data: dataSubscription } = useSubscription(SUBSCRIPTION_ORDER, {
      variables: { id: row._id }
    })
    console.log(dataSubscription)
    return (
      <div style={{ overflow: 'visible', whiteSpace: 'pre' }}>
        {row.orderId}
        <br />
        {transformToNewline(row.deliveryAddress.deliveryAddress, 3)}
      </div>
    )
  }
  const columns = [
    {
      name: 'Order Information',
      sortable: true,
      selector: 'orderId',
      cell: row => subscribeFunc(row)
    },
    {
      name: 'Restaurant',
      selector: 'restaurant.name'
    },
    {
      name: 'Payment',
      selector: 'paymentMethod'
    },
    {
      name: 'Status',
      selector: 'orderStatus',
      cell: row => (
        <div style={{ overflow: 'visible' }}>
          {row.orderStatus}
          {!['CANCELLED', 'DELIVERED'].includes(row.orderStatus) &&
            statusFunc(row)}
        </div>
      )
    },
    {
      name: 'Order time',
      cell: row => (
        <>{new Date(row.createdAt).toLocaleString().replace(/ /g, '\n')}</>
      )
    }
  ]

  const conditionalRowStyles = [
    {
      when: row => ['DELIVERED', 'CANCELLED'].includes(row.orderStatus),
      style: {
        backgroundColor: '#FDEFDD'
      }
    }
  ]
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? dataOrders && dataOrders.getActiveOrders
      : dataOrders &&
        dataOrders.getActiveOrders.filter(order => {
          return (
            order.restaurant.name.toLowerCase().search(regex) > -1 ||
            order.orderId.toLowerCase().search(regex) > -1 ||
            order.deliveryAddress.deliveryAddress.toLowerCase().search(regex) >
              -1 ||
            order.orderId.toLowerCase().search(regex) > -1 ||
            order.paymentMethod.toLowerCase().search(regex) > -1 ||
            order.orderStatus.toLowerCase().search(regex) > -1 ||
            (order.rider !== null
              ? order.rider.name.toLowerCase().search(regex) > -1
              : false)
          )
        })

  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              {errorOrders ? (
                <tr>
                  <td>
                    `${'Error'}! ${errorOrders.message}`
                  </td>
                </tr>
              ) : null}
              {loadingOrders ? (
                <CustomLoader />
              ) : (
                <DataTable
                  subHeader={true}
                  subHeaderComponent={
                    <SearchBar
                      value={searchQuery}
                      onChange={onChangeSearch}
                      onClick={() => refetchOrders()}
                    />
                  }
                  title={t('Dispatch')}
                  columns={columns}
                  data={filtered}
                  progressPending={loadingOrders}
                  pointerOnHover
                  progressComponent={<CustomLoader />}
                  pagination
                  conditionalRowStyles={conditionalRowStyles}
                />
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  )
}
export default withTranslation()(DispatchRestaurant)
