import React, { useEffect, useRef } from 'react'
import { Route, Switch } from 'react-router-dom'
// core components
import AdminNavbar from '../components/Navbars/AdminNavbar'
import AdminFooter from '../components/Footers/AdminFooter'
import AdminSidebar from '../components/Sidebar/AdminSidebar'

import routes from '../routes'

function SuperAdmin(props) {
  var divRef = useRef(null)
  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.scrollingElement.scrollTop = 0
    divRef.current.scrollTop = 0
  }, [])
  const getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.layout === '/super_admin') {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        )
      } else {
        return null
      }
    })
  }
  const getBrandText = path => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props.location.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name
      }
    }
    return 'Brand'
  }
  return (
    <div>
      <AdminSidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: '/super_admin/users',
          imgSrc: require('../assets/img/brand/logo.png'),
          imgAlt: '...'
        }}
      />
      <div className="main-content" ref={divRef}>
        <AdminNavbar
          {...props}
          brandText={getBrandText(props.location.pathname)}
        />
        <Switch>{getRoutes(routes)}</Switch>
        <AdminFooter />
      </div>
    </div>
  )
}

export default SuperAdmin
