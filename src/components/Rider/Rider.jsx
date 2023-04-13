import React, { useState, useRef } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
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
  UncontrolledAlert
} from 'reactstrap'
// core components
import {
  createRider,
  editRider,
  getRiders,
  getZones,
  getAvailableRiders
} from '../../apollo'

const CREATE_RIDER = gql`
  ${createRider}
`
const EDIT_RIDER = gql`
  ${editRider}
`
const GET_RIDERS = gql`
  ${getRiders}
`
const GET_ZONES = gql`
  ${getZones}
`
const GET_AVAILABLE_RIDERS = gql`
  ${getAvailableRiders}
`

function Rider(props) {
  const formRef = useRef()
  const mutation = props.rider ? EDIT_RIDER : CREATE_RIDER
  const name = props.rider ? props.rider.name : ''
  const userName = props.rider ? props.rider.username : ''
  const password = props.rider ? props.rider.password : ''
  const phone = props.rider ? props.rider.phone : ''
  const available = props.rider ? props.rider.available : true
  const zone = props.rider ? props.rider.zone._id : ''
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [nameError, nameErrorSetter] = useState(null)
  const [usernameError, usernameErrorSetter] = useState(null)
  const [passwordError, passwordErrorSetter] = useState(null)
  const [phoneError, phoneErrorSetter] = useState(null)
  const [zoneError, zoneErrorSetter] = useState(null)

  const onCompleted = data => {
    if (!props.rider) clearFields()
    const message = props.rider
      ? 'Rider updated successfully'
      : 'Rider added successfully'
    mainErrorSetter('')
    successSetter(message)
    setTimeout(hideAlert, 5000)
  }
  const onError = ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      mainErrorSetter(graphQLErrors[0].message)
    }
    if (networkError) {
      mainErrorSetter(networkError.result.errors[0].message)
    }
    successSetter('')
    setTimeout(hideAlert, 5000)
  }
  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_RIDERS }, { query: GET_AVAILABLE_RIDERS }],
    onError,
    onCompleted
  })
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(GET_ZONES)

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const onSubmitValidaiton = () => {
    const nameError = !validateFunc(
      { name: formRef.current['input-name'].value },
      'name'
    )
    const usernameError = !validateFunc(
      { username: formRef.current['input-userName'].value },
      'username'
    )
    const passwordError = !validateFunc(
      { password: formRef.current['input-password'].value },
      'password'
    )
    const phoneError = !validateFunc(
      { phone: formRef.current['input-phone'].value },
      'phone'
    )
    const zoneError = !validateFunc(
      { zone: formRef.current['input-zone'].value },
      'zone'
    )

    nameErrorSetter(nameError)
    usernameErrorSetter(usernameError)
    phoneErrorSetter(phoneError)
    passwordErrorSetter(passwordError)
    zoneErrorSetter(zoneError)
    return (
      nameError && usernameError && phoneError && passwordError && zoneError
    )
  }
  const clearFields = () => {
    formRef.current.reset()
    nameErrorSetter(null)
    usernameErrorSetter(null)
    passwordErrorSetter(null)
    phoneErrorSetter(null)
    zoneErrorSetter(null)
  }

  const hideAlert = () => {
    mainErrorSetter('')
    successSetter('')
  }
  const { t } = props
  return (
    <Row>
      <Col className="order-xl-1">
        <Card className="bg-secondary shadow">
          <CardHeader className="bg-white border-0">
            <Row className="align-items-center">
              <Col xs="8">
                <h3 className="mb-0">
                  {props.rider ? t('Edit Rider') : t('Add Rider')}
                </h3>
                <p style={{ color: 'red' }}>
                  This feature is available with Rider app.
                  <a
                    href="https://ninjascode.com/#contact"
                    rel="noreferrer"
                    target="_blank">
                    &nbsp;Contact us&nbsp;
                  </a>
                  if you want this feature
                </p>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <form ref={formRef}>
              <div className="pl-lg-4">
                <Row>
                  <Col lg="6">
                    <label className="form-control-label" htmlFor="input-name">
                      {t('Name')}
                    </label>
                    <FormGroup
                      className={
                        nameError === null
                          ? ''
                          : nameError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-name"
                        name="input-name"
                        placeholder="e.g John Doe"
                        type="text"
                        defaultValue={name}
                        onBlur={event => {
                          onBlur(nameErrorSetter, 'name', event.target.value)
                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="6">
                    <label
                      className="form-control-label"
                      htmlFor="input-username">
                      {t('Username')}
                    </label>
                    <FormGroup
                      className={
                        usernameError === null
                          ? ''
                          : usernameError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-username"
                        name="input-userName"
                        placeholder="e.g ridername007"
                        type="text"
                        defaultValue={userName}
                        onBlur={event =>
                          onBlur(
                            usernameErrorSetter,
                            'username',
                            event.target.value
                          )
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <label className="form-control-label" htmlFor="input-phone">
                      {t('Phone')}
                    </label>
                    <FormGroup
                      className={
                        phoneError === null
                          ? ''
                          : phoneError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-phone"
                        name="input-phone"
                        placeholder="e.g 923458989989"
                        type="number"
                        defaultValue={phone}
                        onBlur={event =>
                          onBlur(phoneErrorSetter, 'phone', event.target.value)
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="6">
                    <label
                      className="form-control-label"
                      htmlFor="input-password">
                      {t('Password')}
                    </label>
                    <FormGroup
                      className={
                        passwordError === null
                          ? ''
                          : passwordError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        className="form-control-alternative"
                        id="input-password"
                        name="input-password"
                        placeholder="e.g 132"
                        type="text"
                        defaultValue={password}
                        onBlur={event =>
                          onBlur(
                            passwordErrorSetter,
                            'password',
                            event.target.value
                          )
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    <label
                      className="form-control-label"
                      htmlFor="input-available">
                      {t('Available')}
                    </label>
                    <FormGroup>
                      <label className="custom-toggle">
                        <input
                          defaultChecked={available}
                          type="checkbox"
                          id="input-available"
                          name="input-available"
                        />
                        <span className="custom-toggle-slider rounded-circle" />
                      </label>
                    </FormGroup>
                  </Col>
                  <Col lg="6">
                    <label
                      className="form-control-label"
                      htmlFor="input-category">
                      {t('Zone')}
                    </label>
                    {errorQuery ? (
                      <tr>
                        <td>
                          `${t('Error')}! ${errorQuery.message}`
                        </td>
                      </tr>
                    ) : null}
                    {loadingQuery ? <div>Loading...</div> : null}
                    <FormGroup
                      className={
                        zoneError === null
                          ? ''
                          : zoneError
                            ? 'has-success'
                            : 'has-danger'
                      }>
                      <Input
                        type="select"
                        id="exampleSelect"
                        name="input-zone"
                        defaultValue={zone}
                        onBlur={event => {
                          onBlur(zoneErrorSetter, 'zone', event.target.value)
                        }}>
                        {!zone && <option value={''}>{t('Select')}</option>}
                        {data &&
                          data.zones.map(zone => (
                            <option value={zone._id} key={zone._id}>
                              {zone.title}
                            </option>
                          ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    {success && (
                      <UncontrolledAlert color="success" fade={true}>
                        <span className="alert-inner--text">{success}</span>
                      </UncontrolledAlert>
                    )}
                    {mainError && (
                      <UncontrolledAlert color="danger" fade={true}>
                        <span className="alert-inner--text">{mainError}</span>
                      </UncontrolledAlert>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col className="text-right" lg="6">
                    <Button
                      color="primary"
                      disabled={loading}
                      onClick={async e => {
                        e.preventDefault()
                        if (onSubmitValidaiton()) {
                          mutate({
                            variables: {
                              riderInput: {
                                _id: props.rider ? props.rider._id : '',
                                name: formRef.current['input-name'].value,
                                username:
                                  formRef.current['input-userName'].value,
                                password:
                                  formRef.current['input-password'].value,
                                phone: formRef.current['input-phone'].value,
                                zone: formRef.current['input-zone'].value,
                                available:
                                  formRef.current['input-available'].checked
                              }
                            }
                          })
                        }
                      }}
                      size="md">
                      {props.rider ? 'Update' : t('Save')}
                    </Button>
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
export default withTranslation()(Rider)
