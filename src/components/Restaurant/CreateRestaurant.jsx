import React, { useState, useRef } from 'react'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
import { useMutation, gql } from '@apollo/client'
import { createRestaurant, restaurantByOwner } from '../../apollo'
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_FOOD } from '../../config/constants'
// reactstrap components
import {
  Button,
  Card,
  Alert,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  Row,
  Col
} from 'reactstrap'

const CREATE_RESTAURANT = gql`
  ${createRestaurant}
`
const RESTAURANT_BY_OWNER = gql`
  ${restaurantByOwner}
`

const CreateRestaurant = props => {
  const { t } = props
  const owner = props.owner

  const [imgUrl, setImgUrl] = useState('')
  const [nameError, setNameError] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [addressError, setAddressError] = useState(null)
  const [deliveryTimeError, setDeliveryTimeError] = useState(null)
  const [minimumOrderError, setMinimumOrderError] = useState(null)
  const [salesTaxError, setSalesTaxError] = useState(null)
  const [errors, setErrors] = useState('')
  const [success, setSuccess] = useState('')
  const onCompleted = data => {
    setNameError(null)
    setAddressError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setErrors('')
    setSalesTaxError(null)
    setSuccess('Restaurant added')
    clearFormValues()
  }
  const onError = ({ graphQLErrors, networkError }) => {
    setNameError(null)
    setAddressError(null)
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
  const [mutate, { loading }] = useMutation(CREATE_RESTAURANT, {
    onError,
    onCompleted,
    update
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
    const deliveryTime = form.deliveryTime.value
    const minimumOrder = form.minimumOrder.value
    const salesTax = +form.salesTax.value

    const nameError = !validateFunc({ name }, 'name')
    const addressError = !validateFunc({ address }, 'address')

    const deliveryTimeError = !validateFunc(
      { deliveryTime: deliveryTime },
      'deliveryTime'
    )
    const minimumOrderError = !validateFunc(
      { minimumOrder: minimumOrder },
      'minimumOrder'
    )
    const usernameError = !validateFunc({ name: username }, 'name')
    const passwordError = !validateFunc({ password }, 'password')
    const salesTaxError = !validateFunc({ salesTax }, 'salesTax')
    setNameError(nameError)
    setAddressError(addressError)
    setUsernameError(usernameError)
    setPasswordError(passwordError)
    setDeliveryTimeError(deliveryTimeError)
    setMinimumOrderError(minimumOrderError)
    setSalesTaxError(salesTaxError)
    if (
      !(
        nameError &&
        addressError &&
        usernameError &&
        passwordError &&
        deliveryTimeError &&
        minimumOrderError &&
        salesTaxError
      )
    ) {
      setErrors('Fields Required')
    }
    return (
      nameError &&
      addressError &&
      usernameError &&
      passwordError &&
      deliveryTimeError &&
      minimumOrderError &&
      salesTaxError
    )
  }
  function update(cache, { data: { createRestaurant } }) {
    console.log('update', cache, createRestaurant)
    const { restaurantByOwner } = cache.readQuery({
      query: RESTAURANT_BY_OWNER,
      variables: { id: owner }
    })
    cache.writeQuery({
      query: RESTAURANT_BY_OWNER,
      variables: { id: owner },
      data: {
        restaurantByOwner: {
          ...restaurantByOwner,
          restaurants: [...restaurantByOwner.restaurants, createRestaurant]
        }
      }
    })
  }
  const clearFormValues = () => {
    const form = formRef.current
    form.name.value = ''
    form.address.value = ''
    form.username.value = ''
    form.password.value = ''
    form.deliveryTime.value = 20
    form.minimumOrder.value = 0
    setImgUrl('')
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
                      defaultValue={''}
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
                      defaultValue={''}
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
                      defaultValue={''}
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
                      defaultValue={''}
                      autoComplete="off"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
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
                      defaultValue={20}
                      autoComplete="off"
                    />
                  </FormGroup>
                </Col>
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
                      defaultValue={0}
                      autoComplete="off"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
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
                      defaultValue={10}
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
                          src={
                            imgUrl ||
                            'https://www.lifcobooks.com/wp-content/themes/shopchild/images/placeholder_book.png'
                          }
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
                        const deliveryTime = form.deliveryTime.value
                        const minimumOrder = form.minimumOrder.value
                        const username = form.username.value
                        const password = form.password.value

                        mutate({
                          variables: {
                            owner,
                            restaurant: {
                              name,
                              address,
                              image:
                                imgUpload ||
                                'https://www.lifcobooks.com/wp-content/themes/shopchild/images/placeholder_book.png',
                              deliveryTime: Number(deliveryTime),
                              minimumOrder: Number(minimumOrder),
                              username,
                              password
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
                  <Alert color="success" isOpen={!!success} toggle={onDismiss}>
                    <span className="alert-inner--icon">
                      <i className="ni ni-like-2" />
                    </span>{' '}
                    <span className="alert-inner--text">
                      <strong>{t('Success')}!</strong> {success}
                    </span>
                  </Alert>
                  <Alert color="danger" isOpen={!!errors} toggle={onDismiss}>
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
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}
export default withTranslation()(CreateRestaurant)
