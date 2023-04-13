import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
// reactstrap components
import { Badge, Card, Container, Row, Media, Modal } from 'reactstrap'
// core components
import Header from '../components/Headers/Header'
import { getRestaurantDetail, deleteFood } from '../apollo'
import FoodComponent from '../components/Food/Food'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import { transformToNewline } from '../utils/stringManipulations'
import Loader from 'react-loader-spinner'
import SearchBar from '../components/TableHeader/SearchBar'
import { useRestaurantContext } from '../context/Restaurant'

const GET_FOODS = gql`
  ${getRestaurantDetail}
`
const DELETE_FOOD = gql`
  ${deleteFood}
`
const Food = props => {
  const [editModal, setEditModal] = useState(false)
  const [food, setFood] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const { id: restaurantId } = useRestaurantContext()

  const [mutate, { loading }] = useMutation(DELETE_FOOD, {
    refetchQueries: [{ query: GET_FOODS, variables: { id: restaurantId } }]
  })
  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_FOODS,
    {
      variables: {
        id: restaurantId
      }
    }
  )
  const toggleModal = food => {
    setEditModal(!editModal)
    setFood(food)
  }

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

  const columns = [
    {
      name: 'Title',
      selector: 'title',
      sortable: true,
      cell: row => (
        <>
          <Media>
            <span className="mb-0 text-sm">{row.title}</span>
          </Media>
        </>
      )
    },
    {
      name: 'Description',
      sortable: true,
      selector: 'description',
      cell: row => <>{transformToNewline(row.description, 3)}</>
    },
    {
      name: 'Category',
      sortable: true,
      selector: 'category.category',
      cell: row => <>{row.category}</>
    },
    {
      name: 'Image',
      cell: row => (
        <>
          {!!row.image && (
            <img className="img-responsive" src={row.image} alt="img menu" />
          )}
          {!row.image && 'No Image'}
        </>
      )
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
              variables: {
                id: row._id,
                restaurant: restaurantId,
                categoryId: row.categoryId
              }
            })
          }}>
          {'Delete'}
        </Badge>
      </>
    )
  }

  const foodsList = categories => {
    const list = []
    categories &&
      categories.forEach(category => {
        if (category.foods && category.foods.length) {
          return category.foods.map(item => {
            list.push({
              ...item,
              category: category.title,
              categoryId: category._id,
              ...category,
              _id: item._id,
              title: item.title
            })

            return {
              ...item,
              category: category.title,
              categoryId: category._id,
              ...category,
              _id: item._id,
              title: item.title
            }
          })
        }
      })
    return list
  }
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? foodsList(data && data.restaurant.categories)
      : foodsList(data && data.restaurant.categories).filter(food => {
        return (
          food.title.toLowerCase().search(regex) > -1 ||
            food.description.toLowerCase().search(regex) > -1 ||
            food.category.toLowerCase().search(regex) > -1
        )
      })

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <FoodComponent />
        {/* Table */}
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {errorQuery && (
                <span>
                  `${'Error'}! ${errorQuery.message}`
                </span>
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
                  title={'Foods'}
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
          <FoodComponent food={food} />
        </Modal>
      </Container>
    </>
  )
}

export default withTranslation()(Food)
