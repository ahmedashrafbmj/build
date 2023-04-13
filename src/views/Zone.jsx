/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react'
import { withTranslation } from 'react-i18next'
// reactstrap components
import { Badge, Card, Container, Row, Modal } from 'reactstrap'
import { gql, useQuery, useMutation } from '@apollo/client'
import Header from '../components/Headers/Header'
import ZoneComponent from '../components/Zone/Zone'
import CustomLoader from '../components/Loader/CustomLoader'
import { getZones, deleteZone } from '../apollo'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'

const GET_ZONES = gql`
  ${getZones}
`
const DELETE_ZONE = gql`
  ${deleteZone}
`

const Zones = props => {
  const [editModal, setEditModal] = useState(false)
  const [zones, setZone] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)

  const [mutate, { error, loading }] = useMutation(DELETE_ZONE, {
    refetchQueries: [{ query: GET_ZONES }]
  })
  const { data, loading: loadingQuery, refetch } = useQuery(GET_ZONES)
  const toggleModal = zone => {
    setEditModal(!editModal)
    setZone(zone)
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
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? data && data.zones
      : data &&
        data.zones.filter(zone => {
          return (
            zone.title.toLowerCase().search(regex) > -1 ||
            zone.description.toLowerCase().search(regex) > -1
          )
        })

  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <ZoneComponent />
        {/* Table */}
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {error ? (
                <span>
                  `${t('Error')}! ${error.message}`
                </span>
              ) : null}
              {loading ? <CustomLoader /> : null}
              <DataTable
                subHeader={true}
                subHeaderComponent={
                  <SearchBar
                    value={searchQuery}
                    onChange={onChangeSearch}
                    onClick={() => refetch()}
                  />
                }
                title={'Zones'}
                columns={columns}
                data={filtered}
                pagination
                progressPending={loadingQuery}
                progressComponent={<CustomLoader />}
                sortFunction={customSort}
                defaultSortField="title"
              />
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
          <ZoneComponent zone={zones} closeModal={setEditModal} />
        </Modal>
      </Container>
    </>
  )
}

export default withTranslation()(Zones)
