import Login from './views/Login'
import Category from './views/Category'
import Food from './views/Food'
import Profile from './views/VendorProfile'
import Orders from './views/Orders'
import Configuration from './views/Configuration'
import Users from './views/Users'
import Vendors from './views/Vendors'
import RestaurantList from './views/RestaurantList'
import ResetPassword from './views/ForgotPassword'
import Riders from './views/Riders'
import Options from './views/Options'
import Addons from './views/Addons'
import Coupons from './views/Coupons'
import Dashboard from './views/Dashboard'
import Restaurant from './views/Restaurant'
import Ratings from './views/Rating'
import Dispatch from './views/Dispatch'
import Timings from './views/Timings'
import Tipping from './views/Tipping'
import Zone from './views/Zone'
import Sections from './views/Sections'
import Notifications from './views/Notifications'
import Payment from './views/Payment'
import Commission from './views/Commission'
import DeliveryBoundsAndLocation from './views/DeliveryBoundsAndLocation'
import DispatchRestaurant from './views/DispatchRestaurant'
import WithdrawRequest from './views/WithdrawRequest'

var routes = [
  {
    path: '/list',
    name: 'List',
    icon: 'ni ni-tv-2 text-primary',
    component: Restaurant,
    layout: '/restaurant',
    appearInSidebar: false,
    admin: false
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'ni ni-tv-2 text-primary',
    component: Dashboard,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/category',
    name: 'Category',
    icon: 'ni ni-chart-pie-35 text-red',
    component: Category,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/food',
    name: 'Food',
    icon: 'ni ni-tie-bow text-green',
    component: Food,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/profile',
    name: 'Profile',
    icon: 'ni ni-single-02 text-blue',
    component: Profile,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/orders',
    name: 'Orders',
    icon: 'ni ni-delivery-fast text-orange',
    component: Orders,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/vendors',
    name: 'Vendors',
    icon: 'ni ni-collection text-primary',
    component: Vendors,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/restaurants',
    name: 'Restaurants',
    icon: 'ni ni-collection text-primary',
    component: RestaurantList,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/sections',
    name: 'Restaurant Sections',
    icon: 'ni ni-shop text-red',
    component: Sections,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/users',
    name: 'Users',
    icon: 'ni ni-single-02 text-green',
    component: Users,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/riders',
    name: 'Riders',
    icon: 'ni ni-delivery-fast text-indigo',
    component: Riders,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/configuration',
    name: 'Configuration',
    icon: 'ni ni-settings text-blue',
    component: Configuration,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/option',
    name: 'Option',
    icon: 'ni ni-atom text-purple',
    component: Options,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/ratings',
    name: 'Ratings',
    icon: 'fas fa-star text-yellow',
    component: Ratings,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/addons',
    name: 'Addons',
    icon: 'ni ni-app text-indigo',
    component: Addons,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/timings',
    name: 'Timings',
    icon: 'ni ni-app text-indigo',
    component: Timings,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/payment',
    name: 'Payment',
    icon: 'ni ni-app text-orange',
    component: Payment,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/deliverybounds',
    name: 'Delivery Bounds & Location',
    icon: 'ni ni-app text-orange',
    component: DeliveryBoundsAndLocation,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/vendors',
    name: 'Back to Admin',
    icon: 'ni ni-curved-next text-black',
    component: Vendors,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/coupons',
    name: 'Coupons',
    icon: 'ni ni-ungroup text-yellow',
    component: Coupons,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/tipping',
    name: 'Tipping',
    icon: 'ni ni-money-coins text-primary',
    component: Tipping,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/zones',
    name: 'Zone',
    icon: 'ni ni-square-pin text-blue',
    component: Zone,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/login',
    name: 'Login',
    icon: 'ni ni-key-25 text-info',
    component: Login,
    layout: '/auth',
    appearInSidebar: false
  },
  {
    path: '/reset',
    name: 'ResetPassword',
    icon: 'ni ni-key-25 text-info',
    component: ResetPassword,
    layout: '/auth',
    appearInSidebar: false
  },
  {
    path: '/dispatch',
    name: 'Dispatch',
    icon: 'ni ni-collection text-primary',
    component: Dispatch,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: 'ni ni-bell-55 text-orange',
    component: Notifications,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/commission',
    name: 'Commission Rates',
    icon: 'ni ni-bell-55 text-orange',
    component: Commission,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/dispatch/:id',
    name: 'Dispatch',
    icon: 'ni ni-collection text-primary',
    component: DispatchRestaurant,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/withdraw/',
    name: 'Withdraw Requests',
    icon: 'ni ni-collection text-primary',
    component: WithdrawRequest,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  }
]
export default routes
