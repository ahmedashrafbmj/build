import React from 'react'
import Button from 'reactstrap/lib/Button'
import styles from './styles'

const SearchBar = props => {
  return (
    <div style={styles.viewContainer}>
      <Button style={styles.buttonStyle} onClick={props.onClick}>
        Refresh
      </Button>
      <input
        style={styles.searchBarStyle}
        type="text"
        placeholder="Search"
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  )
}

export default SearchBar
