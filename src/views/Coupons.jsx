import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import CouponComponent from '../components/Coupon/Coupon'
import { Badge, Card, Container, Row, Modal } from 'reactstrap'
import Header from '../components/Headers/Header'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import Loader from 'react-loader-spinner'
import { getCoupons, deleteCoupon, editCoupon } from '../apollo'
import SearchBar from '../components/TableHeader/SearchBar'

const GET_COUPONS = gql`
  ${getCoupons}
`
const EDIT_COUPON = gql`
  ${editCoupon}
`
const DELETE_COUPON = gql`
  ${deleteCoupon}
`

const Coupon = props => {
  const [editModal, setEditModal] = useState(false)
  const [coupon, setCoupon] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutateEdit] = useMutation(EDIT_COUPON)
  const [mutateDelete, { loading: loadingDelete }] = useMutation(
    DELETE_COUPON,
    {
      refetchQueries: [{ query: GET_COUPONS }]
    }
  )
  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_COUPONS
  )
  const toggleModal = coupon => {
    setEditModal(!editModal)
    setCoupon(coupon)
  }

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
      name: 'Discount %',
      sortable: true,
      selector: 'discount'
    },
    {
      name: 'Status',
      cell: row => <>{statusChanged(row)}</>
    },
    {
      name: 'Action',
      cell: row => <>{actionButtons(row)}</>
    }
  ]
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null
  const filtered =
    searchQuery.length < 3
      ? data && data.coupons
      : data &&
        data.coupons.filter(coupon => {
          return coupon.title.toLowerCase().search(regex) > -1
        })

  const statusChanged = row => {
    return (
      <label className="custom-toggle">
        <input
          onClick={() => {
            mutateEdit({
              variables: {
                couponInput: {
                  _id: row._id,
                  title: row.title,
                  discount: row.discount,
                  enabled: !row.enabled
                }
              }
            })
          }}
          defaultChecked={row.enabled}
          type="checkbox"
        />
        <span className="custom-toggle-slider rounded-circle" />
      </label>
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
        ) : (
          <Badge
            color="danger"
            onClick={e => {
              e.preventDefault()
              mutateDelete({ variables: { id: row._id } })
            }}>
            {'Delete'}
          </Badge>
        )}
      </>
    )
  }

  const { t } = props
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <CouponComponent />
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
                  title={t('Coupons')}
                  columns={columns}
                  data={filtered}
                  pagination
                  progressPending={loadingQuery}
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
          <CouponComponent coupon={coupon} />
        </Modal>
      </Container>
    </>
  )
}

export default withTranslation()(Coupon)
