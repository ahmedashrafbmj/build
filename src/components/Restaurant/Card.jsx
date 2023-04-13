import React from 'react'
import { Card, CardTitle, CardImg, CardText } from 'reactstrap'
const cardPadding = {
  padding: '5%',
  width: '220px',
  marginRight: '20px'
}
const cardImage = {
  width: '200px',
  height: '200px'
}
const List = props => {
  return (
    <>
      <Card style={cardPadding} className="shadow-box-example hoverable ">
        <CardImg alt="..." src={props.rest.image} top style={cardImage} />
        <CardTitle>{props.rest.name}</CardTitle>
        <CardText>{props.rest.address}</CardText>
      </Card>
    </>
  )
}
export default List
