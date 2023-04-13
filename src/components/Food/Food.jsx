import React, { useState, useRef } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  Row,
  Col,
  Alert,
  Modal,
  Label
} from 'reactstrap'
// core components
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_FOOD } from '../../config/constants'
import { getRestaurantDetail, createFood, editFood } from '../../apollo'
import AddonComponent from '../Addon/Addon'
import { useRestaurantContext } from '../../context/Restaurant'

const CREATE_FOOD = gql`
  ${createFood}
`
const EDIT_FOOD = gql`
  ${editFood}
`
const GET_CATEGORIES = gql`
  ${getRestaurantDetail}
`
const GET_ADDONS = gql`
  ${getRestaurantDetail}
`

function Food(props) {
  const formRef = useRef()
  const mutation = props.food ? EDIT_FOOD : CREATE_FOOD
  const [title, setTitle] = useState(props.food ? props.food.title : '')
  const [description, setDescription] = useState(
    props.food ? props.food.description : ''
  )
  const [category, setCategory] = useState(
    props.food ? props.food.categoryId : ''
  )
  const [imgMenu, imgMenuSetter] = useState(props.food ? props.food.image : '')
  const [variationIndex, variationIndexSetter] = useState(0)
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [titleError, titleErrorSetter] = useState(null)
  const [categoryError, categoryErrorSetter] = useState(null)
  const [addonModal, addonModalSetter] = useState(false)
  const { id: restaurantId } = useRestaurantContext()
  const onError = error => {
    mainErrorSetter(`Failed. Please try again. ${error}`)
    successSetter('')
  }
  const onCompleted = data => {
    if (!props.food) clearFields()
    const message = props.food
      ? 'Food updated successfully'
      : 'Food added successfully'
    mainErrorSetter('')
    successSetter(message)
  }
  const [mutate, { loading: mutateLoading }] = useMutation(mutation, {
    onError,
    onCompleted
  })
  const {
    data: dataCategories,
    error: errorCategories,
    loading: loadingCategories
  } = useQuery(GET_CATEGORIES, {
    variables: {
      id: restaurantId
    }
  })

  const {
    data: dataAddons,
    error: errorAddons,
    loading: loadingAddons
  } = useQuery(GET_ADDONS, {
    variables: {
      id: restaurantId
    }
  })
  const [variation, variationSetter] = useState(
    props.food
      ? props.food.variations.map(({ title, price, discounted, addons }) => {
        return {
          title,
          price,
          discounted,
          addons,
          titleError: null,
          priceError: null
        }
      })
      : [
        {
          title: '',
          price: '',
          discounted: '',
          addons: [],
          titleError: null,
          priceError: null
        }
      ]
  )
  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const filterImage = event => {
    let images = []
    for (var i = 0; i < event.target.files.length; i++) {
      images[i] = event.target.files.item(i)
    }
    images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
    return images.length ? images[0] : undefined
  }
  const selectImage = (event, state) => {
    const result = filterImage(event)
    if (result) imageToBase64(result)
  }

  const onAdd = index => {
    const variations = variation
    if (index === variations.length - 1) {
      variations.push({
        title: '',
        price: '',
        discounted: '',
        addons: [],
        titleError: null,
        priceError: null
      })
    } else {
      variations.splice(index + 1, 0, {
        title: '',
        price: '',
        discounted: '',
        addons: [],
        titleError: null,
        priceError: null
      })
    }
    variationSetter([...variations])
  }
  const onRemove = index => {
    if (variation.length === 1 && index === 0) {
      return
    }
    const variations = variation
    variations.splice(index, 1)
    variationSetter([...variations])
  }
  const handleVariationChange = (event, index, type) => {
    const variations = variation

    if (type === 'title') {
      variations[index][type] =
        event.target.value.length === 1
          ? event.target.value.toUpperCase()
          : event.target.value
      variationSetter([...variations])
    } else {
      variations[index][type] = event.target.value
      variationSetter([...variations])
    }
  }
  const onSubmitValidaiton = () => {
    const titleError = !validateFunc(
      { title: formRef.current['input-title'].value },
      'title'
    )
    const categoryError = !validateFunc(
      { category: formRef.current['input-category'].value },
      'category'
    )
    const variations = variation
    variations.map(variationItem => {
      variationItem.priceError = !validateFunc(
        { price: variationItem.price },
        'price'
      )
      let error = false
      const occ = variation.filter(v => v.title === variationItem.title)
      if (occ.length > 1) error = true
      variationItem.titleError = error
        ? !error
        : variations.length > 1
          ? !validateFunc({ title: variationItem.title }, 'title')
          : true

      return variationItem
    })
    const variationsError = !variation.filter(
      variationItem => !variationItem.priceError || !variationItem.titleError
    ).length
    titleErrorSetter(titleError)
    categoryErrorSetter(categoryError)
    variationSetter([...variations])
    return titleError && categoryError && variationsError
  }
  const clearFields = () => {
    // formRef.current.reset()
    variationSetter([
      {
        title: '',
        price: '',
        discounted: '',
        addons: [],
        titleError: null,
        priceError: null
      }
    ])
    imgMenuSetter('')
    titleErrorSetter(null)
    categoryErrorSetter(null)
  }
  const onBlurVariation = (index, type) => {
    const variations = [...variation]
    if (type === 'title') {
      const occ = variations.filter(v => v.title === variations[index][type])
      if (occ.length > 1) {
        variations[index][type + 'Error'] = false
      } else {
        variations[index][type + 'Error'] =
          variations.length > 1
            ? !validateFunc({ [type]: variations[index][type] }, type)
            : true
      }
    }

    if (type === 'price') {
      variations[index][type + 'Error'] = !validateFunc(
        { [type]: variations[index][type] },
        type
      )
    }
    variationSetter([...variations])
  }

  const updateAddonsList = ids => {
    const variations = variation
    variations[variationIndex].addons = variations[
      variationIndex
    ].addons.concat(ids)
    variationSetter([...variations])
  }

  // show Create Addon modal
  const toggleModal = index => {
    addonModalSetter(prev => !prev)
    variationIndexSetter(index)
  }
  const onSelectAddon = (index, id) => {
    const variations = variation
    const addon = variations[index].addons.indexOf(id)
    if (addon < 0) variations[index].addons.push(id)
    else variations[index].addons.splice(addon, 1)
    variationSetter([...variations])
  }
  const onDismiss = () => {
    successSetter('')
    mainErrorSetter('')
  }
  const imageToBase64 = imgUrl => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      imgMenuSetter(fileReader.result)
    }
    fileReader.readAsDataURL(imgUrl)
  }
  const uploadImageToCloudinary = async() => {
    if (imgMenu === '') return imgMenu
    if (props.food && props.food.image === imgMenu) return imgMenu

    const apiUrl = CLOUDINARY_UPLOAD_URL
    const data = {
      file: imgMenu,
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
  const { t } = props
  return (
    <>
      <Row>
        <Col className="order-xl-1">
          <Card className="bg-secondary shadow">
            <CardHeader className="bg-white border-0">
              <Row className="align-items-center">
                <Col xs="8">
                  <h3 className="mb-0">
                    {props.food ? t('Edit Food') : t('Add Food')}
                  </h3>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {mutateLoading && t('Loading')}
              <form ref={formRef}>
                <div className="pl-lg-4">
                  <Row>
                    <Col lg="6">
                      <Row>
                        <Col>
                          <label
                            className="form-control-label"
                            htmlFor="input-title">
                            {t('Title')}
                          </label>
                          <FormGroup
                            className={
                              titleError === null
                                ? ''
                                : titleError
                                  ? 'has-success'
                                  : 'has-danger'
                            }>
                            <Input
                              className="form-control-alternative"
                              id="input-title"
                              name="input-title"
                              placeholder="e.g Breakfast"
                              type="text"
                              value={title}
                              onChange={e => setTitle(e.target.value)}
                              onBlur={event =>
                                onBlur(
                                  titleErrorSetter,
                                  'title',
                                  event.target.value
                                )
                              }
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <label
                            className="form-control-label"
                            htmlFor="input-description">
                            {t('Description')}
                          </label>
                          <FormGroup>
                            <Input
                              className="form-control-alternative"
                              id="input-description"
                              name="input-description"
                              placeholder="e.g All happiness depends on leisurely breakfast."
                              type="textarea"
                              value={description}
                              onChange={e => setDescription(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <label
                            className="form-control-label"
                            htmlFor="input-category">
                            {t('Category')}
                          </label>
                          {loadingCategories && t('Loading')}
                          {errorCategories &&
                            t('Error' + errorCategories.message)}
                          <FormGroup
                            className={
                              categoryError === null
                                ? ''
                                : categoryError
                                  ? 'has-success'
                                  : 'has-danger'
                            }>
                            <Input
                              type="select"
                              name="input-category"
                              id="exampleSelect"
                              value={category}
                              onChange={e => setCategory(e.target.value)}
                              onBlur={event =>
                                onBlur(
                                  categoryErrorSetter,
                                  'category',
                                  event.target.value
                                )
                              }>
                              {!category && (
                                <option value={''}>{t('Select')}</option>
                              )}
                              {dataCategories &&
                                dataCategories.restaurant.categories.map(
                                  category => (
                                    <option
                                      value={category._id}
                                      key={category._id}>
                                      {category.title}
                                    </option>
                                  )
                                )}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <h3 className="mb-0"> {t('Food Image')}</h3>
                          <FormGroup>
                            <div className="card-title-image">
                              {imgMenu && typeof imgMenu === 'string' && (
                                <a href="/" onClick={e => e.preventDefault()}>
                                  <img
                                    alt="..."
                                    className="rounded-rectangle"
                                    src={imgMenu}
                                  />
                                </a>
                              )}
                              <input
                                className="mt-4"
                                type="file"
                                onChange={event => {
                                  selectImage(event, 'imgMenu')
                                }}
                              />
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Col>
                    <Col lg="6">
                      <h3 className="mb-0">{t('Variations')}</h3>
                      <Row>
                        <Col lg="4">
                          <FormGroup>
                            <label
                              className="form-control-label"
                              htmlFor="input-type">
                              {t('Title')}
                            </label>
                            <br />
                            <small style={{ color: 'blue' }}>
                              Title must be unqiue
                            </small>
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <label
                              className="form-control-label"
                              htmlFor="input-price">
                              {t('Price')}
                            </label>
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <label
                              className="form-control-label"
                              htmlFor="input-price">
                              {t('Discounted')}
                            </label>
                          </FormGroup>
                        </Col>
                      </Row>

                      {variation.map((variationItem, index) => (
                        <div key={index}>
                          <Row>
                            <Col lg="4">
                              <FormGroup
                                className={
                                  variationItem.titleError === false
                                    ? 'has-danger'
                                    : variationItem.titleError === true
                                      ? 'has-success'
                                      : ''
                                }>
                                <Input
                                  className="form-control-alternative"
                                  value={variationItem.title}
                                  id="input-type"
                                  placeholder="e.g Small,Medium,Large"
                                  type="text"
                                  autoComplete="off"
                                  onChange={event => {
                                    handleVariationChange(
                                      event,
                                      index,
                                      'title',
                                      'variations'
                                    )
                                  }}
                                  onBlur={event => {
                                    onBlurVariation(index, 'title')
                                  }}
                                />
                              </FormGroup>
                            </Col>
                            <Col lg="4">
                              <FormGroup
                                className={
                                  variationItem.priceError === false
                                    ? 'has-danger'
                                    : variationItem.priceError === true
                                      ? 'has-success'
                                      : ''
                                }>
                                <Input
                                  className="form-control-alternative"
                                  value={variationItem.price}
                                  id="input-price"
                                  placeholder="e.g 9.99"
                                  type="number"
                                  onChange={event => {
                                    handleVariationChange(
                                      event,
                                      index,
                                      'price',
                                      'variations'
                                    )
                                  }}
                                  onBlur={event => {
                                    onBlurVariation(index, 'price')
                                  }}
                                />
                              </FormGroup>
                            </Col>
                            <Col lg="4">
                              <FormGroup>
                                <Input
                                  className="form-control-alternative"
                                  value={variationItem.discounted}
                                  id="input-discounted"
                                  placeholder="e.g 9.99"
                                  type="number"
                                  onChange={event => {
                                    handleVariationChange(
                                      event,
                                      index,
                                      'discounted',
                                      'variations'
                                    )
                                  }}
                                  onBlur={event => {
                                    onBlurVariation(index, 'discounted')
                                  }}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row className="mb-2">
                            <Col lg="6">
                              <Button
                                onClick={() => toggleModal(index)}
                                color="warning">
                                New Addon
                              </Button>
                            </Col>
                          </Row>
                          <Row
                            style={{
                              maxHeight: '67vh',
                              overflowY: 'scroll'
                            }}>
                            <Col lg="12">
                              {loadingAddons && 'Loading ...'}
                              {errorAddons && 'Error ...'}
                              {dataAddons &&
                                dataAddons.restaurant.addons.map(
                                  (addon, indexAddon) => (
                                    <FormGroup
                                      key={indexAddon}
                                      check
                                      className="mb-2">
                                      <Label check>
                                        <Input
                                          value={addon._id}
                                          type="checkbox"
                                          checked={variation[
                                            index
                                          ].addons.includes(addon._id)}
                                          onClick={() =>
                                            onSelectAddon(index, addon._id)
                                          }
                                        />
                                        {`${addon.title} (Description: ${addon.description})(Min: ${addon.quantityMinimum})(Max: ${addon.quantityMaximum})`}
                                      </Label>
                                    </FormGroup>
                                  )
                                )}
                            </Col>
                          </Row>
                          <Row className="mt-2">
                            <Col lg="6">
                              <FormGroup>
                                <Button
                                  color="danger"
                                  onClick={() => {
                                    onRemove(index)
                                  }}>
                                  -
                                </Button>
                                <Button
                                  onClick={() => {
                                    onAdd(index)
                                  }}
                                  color="primary">
                                  +
                                </Button>
                              </FormGroup>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </Col>
                  </Row>
                  <hr />
                  <Row className="mt-2 justify-content-center">
                    <Col xs="4">
                      <Button
                        disabled={mutateLoading}
                        color="primary"
                        className="btn-block"
                        onClick={async e => {
                          e.preventDefault()
                          if (onSubmitValidaiton() && !mutateLoading) {
                            mutate({
                              variables: {
                                foodInput: {
                                  restaurant: restaurantId,
                                  _id: props.food ? props.food._id : '',
                                  title: formRef.current['input-title'].value,
                                  description:
                                    formRef.current['input-description'].value,
                                  image: await uploadImageToCloudinary(),
                                  category:
                                    formRef.current['input-category'].value,
                                  variations: variation.map(
                                    ({ title, price, discounted, addons }) => {
                                      return {
                                        title,
                                        price: +price,
                                        discounted: +discounted,
                                        addons
                                      }
                                    }
                                  )
                                }
                              }
                            })
                          }
                        }}
                        size="lg">
                        {t('Save')}
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
                        isOpen={!!mainError}
                        toggle={onDismiss}>
                        <span className="alert-inner--icon">
                          <i className="ni ni-like-2" />
                        </span>{' '}
                        <span className="alert-inner--text">
                          <strong>{t('Danger')}!</strong> {mainError}
                        </span>
                      </Alert>
                    </Col>
                  </Row>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Modal
        className="modal-dialog-centered"
        size="lg"
        isOpen={addonModal}
        toggle={() => {
          toggleModal()
        }}>
        <AddonComponent updateAddonsList={updateAddonsList} />
      </Modal>
    </>
  )
}
export default withTranslation()(Food)
