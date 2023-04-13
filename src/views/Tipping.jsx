/* eslint-disable react/display-name */
import React from 'react'
import { withTranslation } from 'react-i18next'
// reactstrap components
import { Container } from 'reactstrap'
import TippingComponent from '../components/Tipping/Tipping'
// core components
import Header from '../components/Headers/Header'

function Tipping() {
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <TippingComponent />
      </Container>
    </>
  )
}

export default withTranslation()(Tipping)
