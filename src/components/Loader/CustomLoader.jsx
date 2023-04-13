import React from 'react'
import Loader from 'react-loader-spinner'

const CustomLoader = () => (
  <div style={{ padding: '50px', alignSelf: 'center' }}>
    <Loader type="TailSpin" color="#fb6340" height={120} width={120} />
  </div>
)

export default CustomLoader
