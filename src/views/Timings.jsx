/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
// reactstrap components
import { Card, Container, Row, Col } from 'reactstrap'
// core components
import Header from '../components/Headers/Header'
import { getRestaurantProfile, updateTimings } from '../apollo'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker'
import CustomLoader from '../components/Loader/CustomLoader'
import { useRestaurantContext } from '../context/Restaurant'

const GET_RESTAURANT_PROFILE = gql`
  ${getRestaurantProfile}
`
const UPDATE_TIMINGS = gql`
  ${updateTimings}
`
const Timings = props => {
  const [value, onChange] = useState({})
  const { id: restaurantId } = useRestaurantContext()
  const { t } = props
  const onChangeTime = (day, values) => {
    value[day] = values
    onChange(value)
  }
  const getTransformedTimings = e => {
    const openingTimes = Object.keys(value).map(v => {
      return {
        day: v,
        times: value[v].map(timings => ({
          startTime: timings[0].split(':'),
          endTime: timings[1].split(':')
        }))
      }
    })
    return openingTimes
  }
  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_RESTAURANT_PROFILE,
    {
      variables: { id: restaurantId }
    }
  )
  const transformedTimes = {}

  const [mutate, { error, loading }] = useMutation(UPDATE_TIMINGS)
  if (errorQuery) return <span>Error! {error.message}</span>

  data &&
    data.restaurant.openingTimes.forEach(value => {
      transformedTimes[value.day] = value.times.map(t => [
        `${t.startTime[0]}:${t.startTime[1]}`,
        `${t.endTime[0]}:${t.endTime[1]}`
      ])
    })
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row className="mt-5">
          <div className="col">
            <Card className="shadow">
              {loadingQuery ? (
                <CustomLoader />
              ) : (
                <form>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <label className="form-control-label">{t('Day')}</label>
                      </Col>
                      <Col lg="6">
                        <label className="form-control-label">
                          {t('Open Times')}
                        </label>
                      </Col>
                    </Row>

                    <DayComponent
                      day={t('MON')}
                      value={transformedTimes.MON || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                    <DayComponent
                      day={t('TUE')}
                      value={transformedTimes.TUE || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                    <DayComponent
                      day={t('WED')}
                      value={transformedTimes.WED || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                    <DayComponent
                      day={t('THU')}
                      value={transformedTimes.THU || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                    <DayComponent
                      day={t('FRI')}
                      value={transformedTimes.FRI || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                    <DayComponent
                      day={t('SAT')}
                      value={transformedTimes.SAT || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                    <DayComponent
                      day={t('SUN')}
                      value={transformedTimes.SUN || [['00:00', '23:59']]}
                      onChangeTime={onChangeTime}
                    />
                  </div>
                  <div className="row mt-2 justify-content-center mb-2">
                    <button
                      onClick={e => {
                        e.preventDefault()
                        const openingTimes = getTransformedTimings()
                        mutate({
                          variables: {
                            id: restaurantId,
                            openingTimes
                          }
                        })
                      }}
                      className="btn btn-primary btn-md">
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {error && (
                    <div className="row">
                      <span>{error.message}</span>
                    </div>
                  )}
                </form>
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  )
}

export default withTranslation()(Timings)
const DayComponent = ({ day, value, onChangeTime }) => {
  useEffect(() => {
    onChangeTime(day, values)
  })

  const [values, onChange] = useState(value)
  return (
    <Col>
      <Row className="mt-2" style={{ background: 'aliceblue' }}>
        <Col lg="6">
          <div className="row justify-content">
            <div className="col mt-2 mb-2">
              <label className="form-control-label">{day}</label>
            </div>
            <div className="col mt-2 mb-2">
              {values.length > 0 && (
                <button
                  onClick={e => {
                    e.preventDefault()
                    onChange([])
                  }}
                  className="btn btn-outline-danger btn-sm">
                  Closed all day
                </button>
              )}
              {values.length === 0 && (
                <button
                  onClick={e => {
                    e.preventDefault()
                    onChange([['00:00', '23:59']])
                  }}
                  className="btn btn-outline-primary btn-sm">
                  Open
                </button>
              )}
            </div>
          </div>
        </Col>
        <Col lg="6">
          {values.map((value, index) => (
            <Row key={day + index} className="mt-2 mb-2">
              <TimeRangePicker
                required
                rangeDivider="to"
                disableClock
                format="hh:mm a"
                clearIcon={null}
                value={value}
                onChange={value => {
                  values[index] = value
                  onChange([...values])
                  console.log(values)
                }}
              />
              <div className="col col-lg-6">
                {index === values.length - 1 && (
                  <button
                    onClick={e => {
                      e.preventDefault()
                      onChange([...values, ['00:00', '23:59']])
                    }}
                    className="btn btn-outline-primary btn-sm">
                    +
                  </button>
                )}
                {values.length > 1 && (
                  <button
                    onClick={e => {
                      e.preventDefault()
                      values.splice(index, 1)
                      onChange([...values])
                    }}
                    className="btn btn-outline-danger btn-sm">
                    -
                  </button>
                )}
              </div>
            </Row>
          ))}
          {values.length === 0 && (
            <Row className="mt-2 mb-2">
              <span>Closed All day</span>
            </Row>
          )}
        </Col>
      </Row>
    </Col>
  )
}
