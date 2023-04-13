/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { Container, Badge, Row, Card, Modal } from 'reactstrap'
import Header from '../components/Headers/Header'
import AddonComponent from '../components/Addon/Addon'
import { getRestaurantDetail, deleteAddon } from '../apollo'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import { withTranslation } from 'react-i18next'
import { useQuery, useMutation, gql } from '@apollo/client'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'
import { useRestaurantContext } from '../context/Restaurant'

const GET_ADDONS = gql`
  ${getRestaurantDetail}
`
const DELETE_ADDON = gql`
  ${deleteAddon}
`
const Addon = props => {
  const [addon, setAddon] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = addon => {
    setEditModal(!editModal)
    setAddon(addon)
  }
  const { id: restaurantId } = useRestaurantContext()
  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_ADDONS,
    {
      variables: { id: restaurantId }
    }
  )
  const [mutate, { error, loading }] = useMutation(DELETE_ADDON, {
    refetchQueries: [{ query: GET_ADDONS, variables: { id: restaurantId } }]
  })

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field] && isNaN(row[field])) {
        return row[field].toLowerCase()
      }
      return row[field]
    }
    return orderBy(rows, handleField, direction)
  }

  const columns = [
    {
      name: 'Title',
      sortable: true,
      selector: 'title'
    },
    {
      name: 'Description',
      sortable: true,
      selector: 'description'
    },
    {
      name: 'Minimum',
      sortable: true,
      selector: 'quantityMinimum'
    },
    {
      name: 'Maximum',
      sortable: true,
      selector: 'quantityMaximum'
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
            toggleModal(row)
          }}
          color="primary">
          Edit
        </Badge>
        &nbsp;&nbsp;
        {loading && (
          <Loader
            type="ThreeDots"
            color="#BB2124"
            height={20}
            width={40}
            visible={loading}
          />
        )}
        <Badge
          color="danger"
          onClick={e => {
            e.preventDefault()
            mutate({
              variables: { id: row._id, restaurant: restaurantId }
            })
          }}>
          {'Delete'}
        </Badge>
      </>
    )
  }
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null
  const filtered =
    searchQuery.length < 3
      ? data && data.restaurant.addons
      : data &&
        data.restaurant.addons.filter(addon => {
          return (
            addon.title.toLowerCase().search(regex) > -1 ||
            addon.description.toLowerCase().search(regex) > -1
          )
        })
  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <AddonComponent />
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery && (
                <tr>
                  <td>
                    `${t('Error')}! ${error.message}`
                  </td>
                </tr>
              )}
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
                  title={'Addons'}
                  columns={columns}
                  data={data && data.restaurant ? filtered : {}}
                  pagination
                  progressPending={loading}
                  progressComponent={<CustomLoader />}
                  sortFunction={customSort}
                  defaultSortField="title"
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
          <AddonComponent addon={addon} />
        </Modal>
      </Container>
    </>
  )
}
export default withTranslation()(Addon)
