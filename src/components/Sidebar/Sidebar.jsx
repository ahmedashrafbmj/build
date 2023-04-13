/*eslint-disable*/
import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
import { NavLink as NavLinkRRD, Link } from 'react-router-dom'
// nodejs library to set properties for components
import { PropTypes } from 'prop-types'

// reactstrap components
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col
} from 'reactstrap'
import { useRestaurantContext } from '../../context/Restaurant'

function Sidebar(props) {
  const { image, name, id } = useRestaurantContext()
  const [collapseOpen, setCollapseOpen] = useState(false)
  // toggles collapse between opened and closed (true/false)
  function toggleCollapse() {
    setCollapseOpen(!collapseOpen)
  }
  // closes the collapse
  function closeCollapse() {
    setCollapseOpen(false)
  }
  // creates the links that appear in the left menu / Sidebar
  function createLinks(routes, t) {
    return routes.map((prop, key) => {
      if (
        JSON.parse(localStorage.getItem('user-enatega')).userType === 'ADMIN'
      ) {
        return prop.appearInSidebar && !prop.admin ? (
          <NavItem key={key}>
            <NavLink
              to={prop.layout + prop.path.replace(':id', id)}
              tag={NavLinkRRD}
              onClick={closeCollapse}
              activeClassName="active">
              {prop.image && (
                <img
                  className="rounded 10"
                  src={prop.image}
                  alt="img"
                  width="15px"
                  height="15px"
                />
              )}
              <i className={prop.icon} />

              {t(prop.name)}
            </NavLink>
          </NavItem>
        ) : null
      } else {
        return prop.appearInSidebar &&
          !prop.admin &&
          prop.name != 'Back to Admin' ? (
          <NavItem key={key}>
            <NavLink
              to={prop.layout + prop.path.replace(':id', id)}
              tag={NavLinkRRD}
              onClick={closeCollapse}
              activeClassName="active">
              <i className={prop.icon} />
              {t(prop.name)}
            </NavLink>
          </NavItem>
        ) : null
      }
    })
  }

  const { t } = props
  const { bgColor, routes, logo } = props

  let navbarBrandProps
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link
    }
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: '_blank'
    }
  }
  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main">
      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}>
          <span className="navbar-toggler-icon" />
        </button>
        {/* Brand */}
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}
        {/* User */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="..."
                    src={require('../../assets/img/theme/team-4-800x800.jpg')}
                  />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">{t('Welcome')}!</h6>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                onClick={e => {
                  e.preventDefault()
                  localStorage.removeItem('user-enatega')
                  props.history.push('/auth/login')
                }}>
                <i className="ni ni-user-run" />
                <span>{t('Logout')}</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Collapse header */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}>
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>
          {name && image ? (
            <Row>
              <Col>
                <div>
                  <img src={image} alt="" width="20px" height="20px" />
                  <span className="pl-3">{name}</span>
                </div>
              </Col>
            </Row>
          ) : null}

          {/* Navigation */}
          <Nav navbar>{createLinks(routes, t)}</Nav>
        </Collapse>
      </Container>
    </Navbar>
  )
}

Sidebar.defaultProps = {
  routes: [{}]
}

Sidebar.propTypes = {
  // links that will be displayed inside the component
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the image src of the logo
    imgSrc: PropTypes.string.isRequired,
    // the alt for the img
    imgAlt: PropTypes.string.isRequired
  })
}

export default withTranslation()(Sidebar)
