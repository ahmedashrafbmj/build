/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { transformToNewline } from '../../utils/stringManipulations'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import CustomLoader from '../Loader/CustomLoader'
import { subscribePlaceOrder, orderCount } from '../../apollo'
import { Media, InputGroup, Input, InputGroupAddon, Button } from 'reactstrap'
import { useQuery, gql } from '@apollo/client'
import { useRestaurantContext } from '../../context/Restaurant'

const ORDERCOUNT = gql`
  ${orderCount}
`
const ORDER_PLACED = gql`
  ${subscribePlaceOrder}
`

const OrdersData = props => {
  const { t, selected, updateSelected } = props
  const [search, setSearch] = useState('')
  const getItems = items => {
    return items
      .map(
        item =>
          `${item.quantity}x${item.title}${
            item.variation.title ? `(${item.variation.title})` : ''
          }`
      )
      .join('\n')
  }
  const { id: restaurantId } = useRestaurantContext()

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    ORDERCOUNT,
    {
      variables: { restaurant: restaurantId }
    }
  )

  const propExists = (obj, path) => {
    return path.split('.').reduce((obj, prop) => {
      return obj && obj[prop] ? obj[prop] : ''
    }, obj)
  }

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (field && isNaN(propExists(row, field))) {
        return propExists(row, field).toLowerCase()
      }

      return row[field]
    }

    return orderBy(rows, handleField, direction)
  }

  const clearSearch = () => {
    props.search('')
    setSearch('')
  }
  const subHeaderComponent = () => {
    return (
      <div>
        <InputGroup>
          <Input
            placeholder="Filter By Order Id"
            value={search}
            onChange={event => {
              props.search(event.target.value)
              setSearch(event.target.value)
            }}
          />
          <InputGroupAddon addonType="append">
            <Button onClick={() => clearSearch()} color="primary">
              X
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  const handlePerRowsChange = (perPage, page) => {
    props.page(page)
    props.rows(perPage)
  }

  const handlePageChange = async page => {
    props.page(page)
  }

  const columns = [
    {
      name: 'OrderID',
      sortable: true,
      selector: 'orderId',
      cell: row => (
        <Media>
          <span className="mb-0 text-sm">{row.orderId}</span>
        </Media>
      )
    },
    {
      name: 'Items',
      cell: row => <>{getItems(row.items)}</>
    },
    {
      name: 'Payment',
      selector: 'paymentMethod',
      sortable: true
    },
    {
      name: 'Status',
      selector: 'orderStatus',
      sortable: true
    },
    {
      name: 'Datetime',
      cell: row => (
        <>{new Date(row.createdAt).toLocaleString().replace(/ /g, '\n')}</>
      )
    },
    {
      name: 'Address',
      cell: row => (
        <>{transformToNewline(row.deliveryAddress.deliveryAddress, 3)}</>
      )
    }
  ]

  const conditionalRowStyles = [
    {
      when: row =>
        row.orderStatus !== 'DELIVERED' && row.orderStatus !== 'CANCELLED',
      style: {
        backgroundColor: 'rgba(240, 173, 78,0.2)'
      }
    }
  ]
  useEffect(() => {
    props.subscribeToMore({
      document: ORDER_PLACED,
      variables: { id: restaurantId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        if (subscriptionData.data.subscribePlaceOrder.origin === 'new') {
          return {
            ordersByRestId: [
              subscriptionData.data.subscribePlaceOrder.order,
              ...prev.ordersByRestId
            ]
          }
        } else {
          const orderIndex = prev.ordersByRestId.findIndex(
            o => subscriptionData.data.subscribePlaceOrder.order._id === o._id
          )
          prev.ordersByRestId[orderIndex] =
            subscriptionData.data.subscribePlaceOrder.order
          return { ordersByRestId: [...prev.ordersByRestId] }
        }
      },
      onError: error => {
        console.log('onError', error)
      }
    })
  }, [])
  useEffect(() => {
    if (selected) {
      const order = props.orders.find(o => o._id === selected._id)
      updateSelected(order)
    }
  }, [props.orders])
  return (
    <>
      {errorQuery && (
        <tr>
          <td>
            `${'Error'}! ${errorQuery.message}`
          </td>
        </tr>
      )}
      <DataTable
        title={t('Orders')}
        columns={columns}
        data={props.orders}
        onRowClicked={props.toggleModal}
        progressPending={props.loading || loadingQuery}
        pointerOnHover
        progressComponent={<CustomLoader />}
        sortFunction={customSort}
        subHeader
        subHeaderComponent={subHeaderComponent()}
        pagination
        paginationServer
        paginationTotalRows={data && data.orderCount}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        conditionalRowStyles={conditionalRowStyles}
      />
    </>
  )
}
export default withTranslation()(OrdersData)
