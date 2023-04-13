/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import CustomLoader from '../components/Loader/CustomLoader'
// reactstrap components
import { Badge, Card, Container, Row } from 'reactstrap'
// core components
import Header from '../components/Headers/Header'
import { restaurants, deleteRestaurant } from '../apollo'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'
import { useRestaurantContext } from '../context/Restaurant'

const GET_RESTAURANTS = gql`
  ${restaurants}
`
const DELETE_RESTAURANT = gql`
  ${deleteRestaurant}
`

const Restaurants = props => {
  const { setName, setImage, setId } = useRestaurantContext()
  const [searchQuery, setSearchQuery] = useState('') /// //for searchbar
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutate, { error, loading }] = useMutation(DELETE_RESTAURANT)
  const {
    data,
    error: errorQuery,
    loading: loadingQuery,
    refetch,
    networkStatus
  } = useQuery(GET_RESTAURANTS, { fetchPolicy: 'network-only' })
  const onClickRefetch = cb => {
    cb()
  }
  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field]) {
        return row[field].toLowerCase()
      }

      return row[field]
    }

    return orderBy(rows, handleField, direction)
  }

  const columns = [
    {
      name: 'Image',
      cell: row => (
        <>
          {!!row.image && (
            <img
              className="img-responsive"
              src={row.image}
              alt="img menu"
              onClick={() => {
                localStorage.setItem('restaurant_id', row._id)
                props.history.push('/admin/dashboard')
              }}
            />
          )}
          {!row.image && 'No Image'}
        </>
      ),
      selector: 'image'
    },
    {
      name: 'Name',
      sortable: true,
      selector: 'name'
    },
    {
      name: 'Address',
      selector: 'address'
    },
    {
      name: 'Order Prefix',
      selector: 'orderPrefix'
    },
    {
      name: 'Vendor',
      selector: 'owner',
      cell: row => <>{row.owner ? row.owner.email : null}</>
    },
    {
      name: 'Action',
      cell: row => <>{actionButtons(row)}</>
    }
  ]
  const actionButtons = row => {
    return (
      <>
        {loading ? (
          <Loader
            type="ThreeDots"
            color="#BB2124"
            height={20}
            width={40}
            visible={loading}
          />
        ) : null}
        <Badge
          color={row.isActive ? 'danger' : 'success'}
          onClick={e => {
            e.preventDefault()
            mutate({ variables: { id: row._id } })
          }}>
          {row.isActive ? 'Delete' : 'Enable'}
        </Badge>
      </>
    )
  }

  const conditionalRowStyles = [
    {
      when: row => !row.isActive,
      style: {
        backgroundColor: 'rgba(240, 173, 78,0.2)'
      }
    }
  ]
  const { t } = props
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null
  const filtered =
    searchQuery.length < 3
      ? data && data.restaurants
      : data &&
        data.restaurants.filter(restaurant => {
          return (
            restaurant.name.toLowerCase().search(regex) > -1 ||
            restaurant.orderPrefix.toLowerCase().search(regex) > -1 ||
            restaurant.owner.email.toLowerCase().search(regex) > -1 ||
            restaurant.address.toLowerCase().search(regex) > -1
          )
        })
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Table */}
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery ? (
                <span>
                  `${t('Error')}! ${error.message}`
                </span>
              ) : null}

              {loadingQuery ? (
                <CustomLoader />
              ) : (
                <DataTable
                  subHeader={true}
                  subHeaderComponent={
                    <SearchBar
                      value={searchQuery}
                      onChange={onChangeSearch}
                      onClick={() => onClickRefetch(refetch)}
                    />
                  }
                  title={'Restaurants'}
                  columns={columns}
                  data={filtered}
                  pagination
                  progressPending={loading || networkStatus === 4}
                  progressComponent={<CustomLoader />}
                  sortFunction={customSort}
                  defaultSortField="name"
                  onRowClicked={row => {
                    setId(row._id)
                    setImage(row.image)
                    setName(row.name)
                    props.history.push(`/admin/dashboard/${row.slug}`)
                  }}
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
export default withTranslation()(Restaurants)
