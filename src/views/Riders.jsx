/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
// reactstrap components
import { Badge, Card, Container, Row, Modal } from 'reactstrap'
import { useQuery, useMutation, gql } from '@apollo/client'
import Header from '../components/Headers/Header'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import RiderComponent from '../components/Rider/Rider'
import SearchBar from '../components/TableHeader/SearchBar'
import {
  getRiders,
  deleteRider,
  toggleAvailablity,
  getAvailableRiders
} from '../apollo'
import Loader from 'react-loader-spinner'

const GET_RIDERS = gql`
  ${getRiders}
`
const DELETE_RIDER = gql`
  ${deleteRider}
`
const TOGGLE_RIDER = gql`
  ${toggleAvailablity}
`
const GET_AVAILABLE_RIDERS = gql`
  ${getAvailableRiders}
`

function Riders(props) {
  const [editModal, setEditModal] = useState(false)
  const [rider, setRider] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutateToggle] = useMutation(TOGGLE_RIDER, {
    refetchQueries: [{ query: GET_RIDERS }, { query: GET_AVAILABLE_RIDERS }]
  })
  const [mutateDelete, { loading: loadingDelete }] = useMutation(DELETE_RIDER, {
    refetchQueries: [{ query: GET_RIDERS }]
  })
  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_RIDERS
  )

  const toggleModal = rider => {
    setEditModal(!editModal)
    setRider(rider)
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

  const handleSort = (column, sortDirection) =>
    console.log(column.selector, sortDirection)

  const { t } = props

  const columns = [
    {
      name: t('Name'),
      sortable: true,
      selector: 'name'
    },
    {
      name: t('Username'),
      sortable: true,
      selector: 'username'
    },
    {
      name: t('Password'),
      sortable: true,
      selector: 'password'
    },
    {
      name: t('Phone'),
      sortable: true,
      selector: 'phone'
    },
    {
      name: t('Zone'),
      selector: 'zone.title'
    },
    {
      name: t('Available'),
      cell: row => <>{availableStatus(row)}</>
    },
    {
      name: 'Action',
      cell: row => <>{actionButtons(row)}</>
    }
  ]

  const availableStatus = row => {
    return (
      <>
        {row.available}
        <label className="custom-toggle">
          <input
            defaultChecked={row.available}
            type="checkbox"
            onChange={event => {
              mutateToggle({ variables: { id: row._id } })
            }}
          />
          <span className="custom-toggle-slider rounded-circle" />
        </label>
      </>
    )
  }

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
        {loadingDelete ? (
          <Loader
            type="ThreeDots"
            color="#BB2124"
            height={20}
            width={40}
            visible={loadingDelete}
          />
        ) : null}
        <Badge
          color="danger"
          onClick={e => {
            e.preventDefault()
            mutateDelete({ variables: { id: row._id } })
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
      ? data && data.riders
      : data &&
        data.riders.filter(rider => {
          return (
            rider.name.toLowerCase().search(regex) > -1 ||
            rider.username.toLowerCase().search(regex) > -1 ||
            rider.phone.toLowerCase().search(regex) > -1 ||
            rider.zone.title.toLowerCase().search(regex) > -1
          )
        })

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <RiderComponent />
        {/* Table */}
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery ? (
                <tr>
                  <td>
                    `${t('Error')}! ${errorQuery.message}`
                  </td>
                </tr>
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
                  title={t('Riders')}
                  columns={columns}
                  data={filtered}
                  pagination
                  progressPending={loadingQuery}
                  progressComponent={<CustomLoader />}
                  onSort={handleSort}
                  sortFunction={customSort}
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
          <RiderComponent rider={rider} />
        </Modal>
      </Container>
    </>
  )
}

export default withTranslation()(Riders)
