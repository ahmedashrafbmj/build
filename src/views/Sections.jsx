/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import SectionComponent from '../components/Section/Section'
import CustomLoader from '../components/Loader/CustomLoader'

// reactstrap components
import { Badge, Card, Container, Row, Modal } from 'reactstrap'

// core components
import { deleteSection, editSection, getSections } from '../apollo'
import Header from '../components/Headers/Header'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import Loader from 'react-loader-spinner'
import { useRestaurantContext } from '../context/Restaurant'

const GET_SECTIONS = gql`
  ${getSections}
`
const EDIT_SECTION = gql`
  ${editSection}
`
const DELETE_SECTION = gql`
  ${deleteSection}
`

function Sections(props) {
  const [editModal, setEditModal] = useState(false)
  const [sections, setSections] = useState(null)
  const toggleModal = section => {
    setEditModal(!editModal)
    setSections(section)
  }

  const { id: restaurantId } = useRestaurantContext()
  const [mutateEdit, { error: errorEdit }] = useMutation(EDIT_SECTION)
  const [mutateDelete, { loading: loadingDelete }] = useMutation(
    DELETE_SECTION,
    {
      refetchQueries: [{ query: GET_SECTIONS }]
    }
  )
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_SECTIONS,
    {
      variables: { id: restaurantId }
    }
  )
  console.log(loadingQuery, errorQuery, data)

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
      name: 'Name',
      sortable: true,
      selector: 'name'
    },
    {
      name: 'Status',
      sortable: false,
      cell: row => <>{statusChanged(row)}</>
    },
    {
      name: 'Restaurants',
      sortable: true,
      cell: row => <>{row.restaurants.map(item => `${item.name}`).join(', ')}</>
    },
    {
      name: 'Action',
      cell: row => <>{actionButtons(row)}</>
    }
  ]

  const statusChanged = row => {
    return (
      <>
        {errorEdit
          ? alert(
              `Something is not working. Please contact support team. ${errorEdit}`
          )
          : null}
        <label className="custom-toggle">
          <input
            onClick={() => {
              mutateEdit({
                variables: {
                  section: {
                    _id: row._id,
                    name: row.name,
                    enabled: !row.enabled,
                    restaurants: row.restaurants
                      ? row.restaurants.map(r => r._id)
                      : []
                  }
                }
              })
            }}
            defaultChecked={row.enabled}
            type="checkbox"
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

  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <SectionComponent />
        {/* Table */}
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery && `${t('Error')}! ${errorQuery.message}`}
              <DataTable
                title={'Restaurant Sections'}
                columns={columns}
                data={data && data.sections}
                pagination
                progressPending={loadingQuery}
                progressComponent={<CustomLoader />}
                sortFunction={customSort}
                defaultSortField="name"
              />
            </Card>
          </div>
        </Row>
        <Modal
          className="modal-dialog-centered"
          size="lg"
          isOpen={editModal}
          toggle={() => {
            toggleModal(null)
          }}>
          <SectionComponent section={sections} />
        </Modal>
      </Container>
    </>
  )
}

export default withTranslation()(Sections)
