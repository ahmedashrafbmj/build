import React, { useState, useEffect } from 'react'
import { withTranslation } from 'react-i18next'
import { Badge, Card, Container, Row, Modal } from 'reactstrap'
import { gql, useMutation, useQuery } from '@apollo/client'
import Header from '../components/Headers/Header'
import VendorComponent from '../components/Vendor/Vendor'
import CustomLoader from '../components/Loader/CustomLoader'
import { getVendors, deleteVendor } from '../apollo'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'

const GET_VENDORS = gql`
  ${getVendors}
`
const DELETE_VENDOR = gql`
  ${deleteVendor}
`
const Vendors = props => {
  const [editModal, setEditModal] = useState(false)
  const [vendors, setVendor] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const { loading: loadingQuery, error: errorQuery, data, refetch } = useQuery(
    GET_VENDORS
  )
  const [mutate, { error, loading }] = useMutation(DELETE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }]
  })

  const { t } = props
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? data && data.vendors
      : data &&
        data.vendors.filter(vendor => {
          return vendor.email.toLowerCase().search(regex) > -1
        })

  const toggleModal = vendor => {
    setEditModal(!editModal)
    setVendor(vendor)
  }

  useEffect(() => {
    localStorage.removeItem('restaurant_id')
  }, [])

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
      name: 'Email',
      sortable: true,
      selector: 'email'
    },
    {
      name: 'Total Restaurants',
      sortable: true,
      cell: row => <>{row.restaurants.length}</>
    },
    {
      name: 'Action',
      cell: row => <>{actionButtons(row)}</>
    }
  ]
  const actionButtons = row => {
    return (
      <>
        <Badge
          onClick={e => {
            e.preventDefault()
            props.history.push({
              pathname: '/restaurant/list',
              state: { id: row._id }
            })
          }}
          color="info">
          Restaurants
        </Badge>
        &nbsp;&nbsp;
        <Badge
          onClick={e => {
            e.preventDefault()
            toggleModal(row)
          }}
          color="primary">
          Edit
        </Badge>
        &nbsp;&nbsp;
        {loading ? (
          <Loader
            type="ThreeDots"
            color="#BB2124"
            height={20}
            width={40}
            visible={loading}
          />
        ) : null}
        {error ? <span>{error.message}</span> : null}
        <Badge
          color="danger"
          onClick={e => {
            e.preventDefault()
            mutate({ variables: { id: row._id } })
          }}>
          {'Delete'}
        </Badge>
      </>
    )
  }
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <VendorComponent />
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery ? (
                <span>
                  {' '}
                  `${t('Error')}! ${errorQuery.message}`
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
                      onClick={() => refetch()}
                    />
                  }
                  title={t('Vendors')}
                  columns={columns}
                  data={filtered}
                  pagination
                  progressPending={loading}
                  progressComponent={<CustomLoader />}
                  sortFunction={customSort}
                  defaultSortField="email"
                />
              )}
            </Card>
          </div>
        </Row>
        <Modal
          className="modal-dialog-centered"
          size="lg"
          isOpen={editModal}
          toggle={() => {
            toggleModal()
          }}>
          <VendorComponent vendor={vendors} />
        </Modal>
      </Container>
    </>
  )
}

export default withTranslation()(Vendors)
