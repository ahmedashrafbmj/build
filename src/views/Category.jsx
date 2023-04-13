/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import CategoryComponent from '../components/Category/Category'
import CustomLoader from '../components/Loader/CustomLoader'
// reactstrap components
import { Badge, Card, Container, Row, Modal } from 'reactstrap'
// core components
import Header from '../components/Headers/Header'
import { getRestaurantDetail, deleteCategory } from '../apollo'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'
import { useRestaurantContext } from '../context/Restaurant'

const GET_CATEGORIES = gql`
  ${getRestaurantDetail}
`
const DELETE_CATEGORY = gql`
  ${deleteCategory}
`
const Category = props => {
  const [editModal, setEditModal] = useState(false)
  const [category, setCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = category => {
    setEditModal(!editModal)
    setCategory(category)
  }
  const { id: restaurantId } = useRestaurantContext()
  const [mutate, { loading }] = useMutation(DELETE_CATEGORY)

  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_CATEGORIES,
    {
      variables: {
        id: restaurantId
      }
    }
  )
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
        {!loading && (
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
        )}
      </>
    )
  }
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? data && data.restaurant.categories
      : data &&
        data.restaurant.categories.filter(category => {
          return category.title.toLowerCase().search(regex) > -1
        })
  const { t } = props

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <CategoryComponent />
        {/* Table */}
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery ? (
                <span>
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
                  title={t('Categories')}
                  columns={columns}
                  data={filtered}
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
            toggleModal(null)
          }}>
          <CategoryComponent category={category} />
        </Modal>
      </Container>
    </>
  )
}
export default withTranslation()(Category)
