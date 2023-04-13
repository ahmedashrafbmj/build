import React, { useRef, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
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
  UncontrolledAlert
} from 'reactstrap'

import { editCategory, createCategory } from '../../apollo'
import { useRestaurantContext } from '../../context/Restaurant'

const CREATE_CATEGORY = gql`
  ${createCategory}
`
const EDIT_CATEGORY = gql`
  ${editCategory}
`

function Category(props) {
  const formRef = useRef()
  const title = props.category ? props.category.title : ''
  const mutation = props.category ? EDIT_CATEGORY : CREATE_CATEGORY
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const { id: restaurantId } = useRestaurantContext()
  const clearFields = () => {
    formRef.current.reset()
  }
  const onCompleted = data => {
    const message = props.category
      ? 'Category updated successfully'
      : 'Category added successfully'
    successSetter(message)
    mainErrorSetter('')
    if (!props.category) clearFields()
  }
  const onError = error => {
    const message = `Action failed. Please Try again ${error}`
    successSetter('')
    mainErrorSetter(message)
  }
  const [mutate, { loading }] = useMutation(mutation, { onError, onCompleted })

  const { t } = props
  return (
    <Row>
      <Col className="order-xl-1">
        <Card className="bg-secondary shadow">
          <CardHeader className="bg-white border-0">
            <Row className="align-items-center">
              <Col xs="8">
                <h3 className="mb-0">
                  {props.category ? t('Edit Category') : t('Add Category')}
                </h3>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <form ref={formRef}>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6">
                    <label className="form-control-label" htmlFor="input-title">
                      {t('Title')}
                    </label>
                    <FormGroup>
                      <Input
                        className="form-control-alternative"
                        id="input-title"
                        name="input-title"
                        placeholder="e.g Breakfast"
                        type="text"
                        defaultValue={title}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  {loading ? t('Loading') : null}
                  <Col className="text-right" xs="12">
                    <Button
                      disabled={loading}
                      color="primary"
                      onClick={async e => {
                        e.preventDefault()
                        if (!loading) {
                          mutate({
                            variables: {
                              category: {
                                _id: props.category ? props.category._id : '',
                                title: formRef.current['input-title'].value,
                                restaurant: restaurantId
                              }
                            }
                          })
                        }
                      }}
                      size="md">
                      {t('Save')}
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    {success && (
                      <UncontrolledAlert color="success" fade={true}>
                        <span className="alert-inner--icon">
                          <i className="ni ni-like-2" />
                        </span>{' '}
                        <span className="alert-inner--text">
                          <strong>{t('Success')}!</strong> {success}
                        </span>
                      </UncontrolledAlert>
                    )}
                    {mainError && (
                      <UncontrolledAlert color="danger" fade={true}>
                        <span className="alert-inner--icon">
                          <i className="ni ni-like-2" />
                        </span>{' '}
                        <span className="alert-inner--text">
                          <strong>{t('Danger')}!</strong> {mainError}
                        </span>
                      </UncontrolledAlert>
                    )}
                  </Col>
                </Row>
              </div>
            </form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default withTranslation()(Category)
