import React, { useState, useRef } from 'react'
import { validateFunc } from '../constraints/constraints'
import { withTranslation } from 'react-i18next'
import Header from '../components/Headers/Header'
import { useQuery, useMutation, gql } from '@apollo/client'
import { getRestaurantProfile, editRestaurant } from '../apollo'
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_FOOD } from '../config/constants'
// reactstrap components
import {
  Button,
  Card,
  Alert,
  CardHeader,
  CardBody,
  Container,
  FormGroup,
  Input,
  Row,
  Col
} from 'reactstrap'
import { useRestaurantContext } from '../context/Restaurant'

const GET_PROFILE = gql`
  ${getRestaurantProfile}
`
const EDIT_RESTAURANT = gql`
  ${editRestaurant}
`

const VendorProfile = props => {
  const { t } = props
  const { id: restaurantId } = useRestaurantContext()

  const [imgUrl, setImgUrl] = useState('')
  const [nameError, setNameError] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [addressError, setAddressError] = useState(null)
  const [prefixError, setPrefixError] = useState(null)
  const [deliveryTimeError, setDeliveryTimeError] = useState(null)
  const [minimumOrderError, setMinimumOrderError] = useState(null)
  const [salesTaxError, setSalesTaxError] = useState(null)
  const [errors, setErrors] = useState('')
  const [success, setSuccess] = useState('')
  const onCompleted = data => {
    setNameError(null)
    setAddressError(null)
    setPrefixError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setSalesTaxError(null)
    setErrors('')
    setSuccess('Restaurant updated successfully')
  }

  const onError = ({ graphQLErrors, networkError }) => {
    setNameError(null)
    setAddressError(null)
    setPrefixError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setSalesTaxError(null)
    setSuccess('')
    if (graphQLErrors) {
      setErrors(graphQLErrors[0].message)
    }
    if (networkError) {
      setErrors(networkError.result.errors[0].message)
    }
  }
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_PROFILE,
    {
      variables: { id: restaurantId }
    }
  )
  const [mutate, { loading }] = useMutation(EDIT_RESTAURANT, {
    onError,
    onCompleted
  })

  const formRef = useRef(null)

  const selectImage = (event, state) => {
    const result = filterImage(event)
    if (result) imageToBase64(result)
  }

  const filterImage = event => {
    let images = []
    for (var i = 0; i < event.target.files.length; i++) {
      images[i] = event.target.files.item(i)
    }
    images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
    return images.length ? images[0] : undefined
  }
  const imageToBase64 = imgUrl => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      setImgUrl(fileReader.result)
    }
    fileReader.readAsDataURL(imgUrl)
  }
  const uploadImageToCloudinary = async() => {
    if (imgUrl === '') return imgUrl

    const apiUrl = CLOUDINARY_UPLOAD_URL
    const data = {
      file: imgUrl,
      upload_preset: CLOUDINARY_FOOD
    }
    try {
      const result = await fetch(apiUrl, {
        body: JSON.stringify(data),
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST'
      })
      const imageData = await result.json()
      return imageData.secure_url
    } catch (e) {
      console.log(e)
    }
  }

  const onSubmitValidaiton = data => {
    const form = formRef.current
    const name = form.name.value
    const address = form.address.value
    const username = form.username.value
    const password = form.password.value
    // IMPORTANT!!!!
    const prefix = form.prefix.value
    const deliveryTime = form.deliveryTime.value
    const minimumOrder = form.minimumOrder.value
    const salesTax = +form.salesTax.value

    const nameErrors = !validateFunc({ name }, 'name')
    const addressErrors = !validateFunc({ address }, 'address')
    const prefixErrors = !validateFunc({ prefix: prefix }, 'prefix')
    const deliveryTimeErrors = !validateFunc(
      { deliveryTime: deliveryTime },
      'deliveryTime'
    )
    const minimumOrderErrors = !validateFunc(
      { minimumOrder: minimumOrder },
      'minimumOrder'
    )
    const usernameErrors = !validateFunc({ name: username }, 'name')
    const passwordErrors = !validateFunc({ password }, 'password')
    const salesTaxError = !validateFunc({ salesTax }, 'salesTax')
    setNameError(nameErrors)
    setAddressError(addressErrors)
    setPrefixError(prefixErrors)
    setUsernameError(usernameErrors)
    setPasswordError(passwordErrors)
    setDeliveryTimeError(deliveryTimeErrors)
    setMinimumOrderError(minimumOrderErrors)
    setSalesTaxError(salesTaxError)
    if (
      !(
        nameErrors &&
        addressErrors &&
        prefixErrors &&
        usernameErrors &&
        passwordErrors &&
        deliveryTimeErrors &&
        minimumOrderErrors &&
        salesTaxError
      )
    ) {
      setErrors('Fields Required')
    }
    return (
      nameErrors &&
      addressErrors &&
      prefixErrors &&
      usernameErrors &&
      passwordErrors &&
      deliveryTimeErrors &&
      minimumOrderErrors &&
      salesTaxError
    )
  }

  const onDismiss = () => {
    setNameError(null)
    setAddressError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setSalesTaxError(null)
    setSuccess('')
    setErrors('')
  }
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">{t('Update Profile')}</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {loadingQuery && <span>{t('Loading...')}</span>}
                {errorQuery && <span>{errorQuery.message}</span>}
                <>
                  <form ref={formRef}>
                    <Row>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-username">
                          {t("Restaurant's Username")}
                        </label>
                        <FormGroup
                          className={
                            usernameError === false
                              ? 'has-danger'
                              : usernameError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="username"
                            className="form-control-alternative"
                            id="input-type-username"
                            placeholder="e.g Test"
                            type="text"
                            defaultValue={
                              (data && data.restaurant.username) || ''
                            }
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-password">
                          {t("Restaurant's Password")}
                        </label>
                        <FormGroup
                          className={
                            passwordError === false
                              ? 'has-danger'
                              : passwordError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="password"
                            className="form-control-alternative"
                            id="input-type-password"
                            placeholder="e.g 123456"
                            type="text"
                            defaultValue={
                              (data && data.restaurant.password) || ''
                            }
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-name">
                          {t("Restaurant's Name")}
                        </label>
                        <br />
                        <FormGroup
                          className={
                            nameError === false
                              ? 'has-danger'
                              : nameError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="name"
                            className="form-control-alternative"
                            id="input-type-name"
                            placeholder="e.g Johns Food"
                            type="text"
                            defaultValue={(data && data.restaurant.name) || ''}
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-address">
                          {t("Restaurant's address")}
                        </label>
                        <br />
                        <FormGroup
                          className={
                            addressError === false
                              ? 'has-danger'
                              : addressError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="address"
                            className="form-control-alternative"
                            id="input-type-address"
                            placeholder="e.g Abc Street, xyz city, country"
                            type="text"
                            defaultValue={data && data.restaurant.address}
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-order_id_prefix">
                          {t('Order Prefix')}
                        </label>
                        <br />
                        <FormGroup
                          className={
                            prefixError === false
                              ? 'has-danger'
                              : prefixError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="prefix"
                            className="form-control-alternative"
                            id="input-type-order_id_prefix"
                            placeholder="e.g -33.45"
                            type="text"
                            defaultValue={data && data.restaurant.orderPrefix}
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-delivery-time">
                          {t('Delivery Time')}
                        </label>
                        <br />
                        <FormGroup
                          className={
                            deliveryTimeError === false
                              ? 'has-danger'
                              : deliveryTimeError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="deliveryTime"
                            className="form-control-alternative"
                            id="input-type-delivery-time"
                            placeholder="e.g 33.45"
                            type="number"
                            defaultValue={data && data.restaurant.deliveryTime}
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-minimum-order">
                          {t('Minimum Order')}
                        </label>
                        <br />
                        <FormGroup
                          className={
                            minimumOrderError === false
                              ? 'has-danger'
                              : minimumOrderError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="minimumOrder"
                            className="form-control-alternative"
                            id="input-type-minimum-order"
                            placeholder="e.g 200"
                            type="number"
                            defaultValue={data && data.restaurant.minimumOrder}
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-sales-tax">
                          {t('Sales Tax %')}
                        </label>
                        <br />
                        <FormGroup
                          className={
                            salesTaxError === false
                              ? 'has-danger'
                              : salesTaxError === true
                                ? 'has-success'
                                : ''
                          }>
                          <Input
                            name="salesTax"
                            className="form-control-alternative"
                            id="input-type-sales-tax"
                            placeholder="e.g 0-100"
                            type="number"
                            defaultValue={data && data.restaurant.tax}
                            autoComplete="off"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <label
                          className="form-control-label"
                          htmlFor="input-type-image">
                          {t('Image')}
                        </label>
                        <br />
                        <FormGroup>
                          <div className="card-title-image">
                            <a href="/" onClick={e => e.preventDefault()}>
                              <img
                                alt="..."
                                className="rounded-rectangle"
                                src={imgUrl || (data && data.restaurant.image)}
                              />
                            </a>
                          </div>
                          <input
                            className="mt-2"
                            type="file"
                            onChange={event => {
                              selectImage(event, 'image_url')
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <hr />
                    <Row className="mt-2 justify-content-center">
                      <Col xs="4">
                        <Button
                          color="primary"
                          className="btn-block"
                          onClick={async e => {
                            e.preventDefault()
                            if (onSubmitValidaiton()) {
                              const imgUpload = await uploadImageToCloudinary()
                              const form = formRef.current
                              const name = form.name.value
                              const address = form.address.value
                              const prefix = form.prefix.value // can we not update this?
                              const deliveryTime = form.deliveryTime.value
                              const minimumOrder = form.minimumOrder.value
                              const username = form.username.value
                              const password = form.password.value
                              const salesTax = form.salesTax.value
                              mutate({
                                variables: {
                                  restaurantInput: {
                                    _id: restaurantId,
                                    name,
                                    address,
                                    image:
                                      imgUpload ||
                                      data.restaurant.image ||
                                      'https://www.lifcobooks.com/wp-content/themes/shopchild/images/placeholder_book.png',
                                    orderPrefix: prefix,
                                    deliveryTime: Number(deliveryTime),
                                    minimumOrder: Number(minimumOrder),
                                    username: username,
                                    password: password,
                                    salesTax: +salesTax
                                  }
                                }
                              })
                            }
                          }}
                          size="lg">
                          {loading ? t('Updating...') : t('Update')}
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <Alert
                          color="success"
                          isOpen={!!success}
                          toggle={onDismiss}>
                          <span className="alert-inner--icon">
                            <i className="ni ni-like-2" />
                          </span>{' '}
                          <span className="alert-inner--text">
                            <strong>{t('Success')}!</strong> {success}
                          </span>
                        </Alert>
                        <Alert
                          color="danger"
                          isOpen={!!errors}
                          toggle={onDismiss}>
                          <span className="alert-inner--icon">
                            <i className="ni ni-like-2" />
                          </span>{' '}
                          <span className="alert-inner--text">
                            <strong>{t('Danger')}!</strong> {errors}
                          </span>
                        </Alert>
                      </Col>
                    </Row>
                  </form>
                </>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
export default withTranslation()(VendorProfile)
