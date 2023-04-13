/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { Badge, Container, Row, Card, Modal } from 'reactstrap'
import Header from '../components/Headers/Header'
import OptionComponent from '../components/Option/Option'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'

import { withTranslation } from 'react-i18next'
import { useQuery, useMutation, gql } from '@apollo/client'
import { getRestaurantDetail, deleteOption } from '../apollo'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'
import { useRestaurantContext } from '../context/Restaurant'

const GET_OPTIONS = gql`
  ${getRestaurantDetail}
`
const DELETE_OPTION = gql`
  ${deleteOption}
`

const Option = props => {
  const [editModal, setEditModal] = useState(false)
  const [option, setOption] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = option => {
    setEditModal(!editModal)
    setOption(option)
  }
  const { id: restaurantId } = useRestaurantContext()

  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_OPTIONS,
    {
      variables: { id: restaurantId }
    }
  )
  const [mutate, { loading }] = useMutation(DELETE_OPTION, {
    refetchQueries: [{ query: GET_OPTIONS, variables: { id: restaurantId } }]
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

  const handleSort = (column, sortDirection) =>
    console.log(column.selector, sortDirection)

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
      name: 'Price',
      sortable: true,
      selector: 'price'
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
      ? data && data.restaurant.options
      : data &&
        data.restaurant.options.filter(option => {
          return (
            option.title.toLowerCase().search(regex) > -1 ||
            option.description.toLowerCase().search(regex) > -1
          )
        })
  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <OptionComponent />
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery && (
                <tr>
                  <td>
                    `${t('Error')}! ${errorQuery.message}`
                  </td>
                </tr>
              )}
              {loading ? (
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
                  title={t('Options')}
                  columns={columns}
                  data={data && data.restaurant ? filtered : {}}
                  pagination
                  progressPending={loadingQuery}
                  progressComponent={<CustomLoader />}
                  onSort={handleSort}
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
          <OptionComponent option={option} />
        </Modal>
      </Container>
    </>
  )
}
export default withTranslation()(Option)
