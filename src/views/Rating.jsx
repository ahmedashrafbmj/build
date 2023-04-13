/* eslint-disable react/display-name */
import React from 'react'
import { withTranslation } from 'react-i18next'
import { Container, Row, Card } from 'reactstrap'
import Header from '../components/Headers/Header'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import CustomLoader from '../components/Loader/CustomLoader'
import { useQuery, gql } from '@apollo/client'
import { reviews } from '../apollo'
import { useRestaurantContext } from '../context/Restaurant'

const REVIEWS = gql`
  ${reviews}
`

const Ratings = props => {
  const { id: restaurantId } = useRestaurantContext()
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(REVIEWS, {
    variables: { restaurant: restaurantId }
  })

  const columns = [
    {
      name: 'Name',
      sortable: true,
      selector: 'user.name',
      cell: row => <>{row.order.user.name}</>
    },
    {
      name: 'Email',
      sortable: true,
      selector: 'user.email',
      cell: row => <>{row.order.user.email}</>
    },
    {
      name: 'Items',
      cell: row => (
        <>
          {row.order.items.map(({ title }) => {
            return title + '\t'
          })}
        </>
      )
    },
    {
      name: 'Review',
      sortable: true,
      selector: 'description',
      cell: row => <>{row.description}</>
    },
    {
      name: 'Ratings',
      sortable: true,
      selector: 'rating',
      cell: row => <>{row.rating}</>
    }
  ]
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

  const handleSort = (column, sortDirection) =>
    console.log(column.selector, sortDirection, column)
  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              {errorQuery && (
                <tr>
                  <td>
                    `${t('Error')}! ${errorQuery.message}`
                  </td>
                </tr>
              )}
              <DataTable
                title={t('Ratings')}
                columns={columns}
                data={data && data.reviews}
                pagination
                progressPending={loadingQuery}
                progressComponent={<CustomLoader />}
                onSort={handleSort}
                sortFunction={customSort}
                defaultSortField="order.user.name"
              />
            </Card>
          </div>
        </Row>
      </Container>
    </>
  )
}

export default withTranslation()(Ratings)
