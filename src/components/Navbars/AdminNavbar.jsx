import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
import ResetPassword from '../ResetPassword/ResetPassword'
import { useApolloClient } from '@apollo/client'
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Media,
  Modal,
  Container
} from 'reactstrap'

function AdminNavbar(props) {
  const client = useApolloClient()
  const [modal, modalSetter] = useState(false)
  const toggleModal = () => {
    modalSetter(prev => !prev)
  }
  const { t } = props
  const vendor = localStorage.getItem('user-enatega')
    ? JSON.parse(localStorage.getItem('user-enatega')).userType === 'VENDOR'
    : false
  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <span className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block">
            {props.match.path === '/restaurant' ? '' : t(props.brandText)}
          </span>

          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={require('../../assets/img/theme/team-4-800x800.jpg')}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">Admin</span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">{t('Welcome')}!</h6>
                </DropdownItem>
                <DropdownItem divider />
                {vendor && (
                  <DropdownItem
                    onClick={e => {
                      e.preventDefault()
                      toggleModal()
                    }}>
                    <i className="ni ni-key-25" />
                    <span>{t('Change Password')}</span>
                  </DropdownItem>
                )}
                <DropdownItem
                  href="#pablo"
                  onClick={e => {
                    e.preventDefault()
                    localStorage.removeItem('user-enatega')
                    localStorage.removeItem('restaurant_id')
                    client.clearStore()
                    props.history.push('/auth/login')
                  }}>
                  <i className="ni ni-user-run" />
                  <span>{t('Logout')}</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <Modal
            className="modal-dialog-centered"
            size="lg"
            isOpen={modal}
            toggle={() => {
              toggleModal()
            }}>
            <ResetPassword />
          </Modal>
        </Container>
      </Navbar>
    </>
  )
}

export default withTranslation()(AdminNavbar)
