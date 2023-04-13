import { useQuery, gql, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Table,
  UncontrolledAlert
} from 'reactstrap'
import { updateWithdrawReqStatus, withdrawRequestQuery } from '../apollo'
import Header from '../components/Headers/Header'
const MAX_ROWS_PER_PAGE = 20
export default function WithdrawRequest() {
  const [page, setPage] = useState(0)
  const [selectedWithdrawRequest, setWithdrawRequest] = useState(null)
  const { loading, error, data } = useQuery(
    gql`
      ${withdrawRequestQuery}
    `,
    { variables: { offset: page * MAX_ROWS_PER_PAGE }, pollInterval: 60000 }
  )
  const [
    updateStatus,
    { loading: loadingStatus, data: statusData }
  ] = useMutation(
    gql`
      ${updateWithdrawReqStatus}
    `
  )
  if (loading) {
    return <Container>Loading...</Container>
  }
  if (error) {
    return <Container>Error Occured</Container>
  }
  const {
    getAllWithdrawRequests: { data: withDrawRequests, pagination }
  } = data
  const {
    updateWithdrawReqStatus: { message: errorMessage }
  } = statusData || { updateWithdrawReqStatus: { mesasge: '' } }

  return (
    <>
      <Header />
      <Container className="mt-7">
        <div>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Withdraw Requests</CardTitle>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Rider</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withDrawRequests.map(req => (
                    <tr key={req._id}>
                      <th scope="row">{req.requestId}</th>
                      <td>{req.rider.name}</td>
                      <td>{req.status}</td>
                      <td>{req.requestAmount.toFixed(2)}</td>
                      <td>{new Date(req.requestTime).toLocaleDateString()}</td>
                      <td>
                        <Badge
                          onClick={e => {
                            e.preventDefault()
                            setWithdrawRequest(req)
                          }}
                          href={'#'}
                          color={'success'}>
                          Edit
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                className="pagination justify-content-end"
                listClassName="justify-content-end">
                {Array(parseInt(pagination.total / MAX_ROWS_PER_PAGE) + 1)
                  .fill(0)
                  .map((_, index) => (
                    <PaginationItem
                      active={page === index}
                      key={`page-${index}`}>
                      <PaginationLink
                        href="#"
                        onClick={e => {
                          e.preventDefault()
                          console.log('page', index)
                          setPage(index)
                        }}>
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
              </Pagination>
            </CardBody>
          </Card>
        </div>
      </Container>
      {selectedWithdrawRequest && (
        <Modal
          size="lg"
          className="modal-dialog-centered"
          isOpen={true}
          toggle={() => setWithdrawRequest(null)}>
          <Card>
            <CardBody>
              <CardTitle tag="h5">Edit Withdraw Requests</CardTitle>
              <Form>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="requestId">Request ID</Label>
                      <Input
                        id="requestId"
                        name="requestId"
                        type="text"
                        value={selectedWithdrawRequest.requestId}
                        readOnly
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="rider">Rider</Label>
                      <Input
                        id="rider"
                        name="rider"
                        type="text"
                        value={selectedWithdrawRequest.rider.name}
                        readOnly
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label for="requestAmount">Requested Amount</Label>
                  <Input
                    id="requestAmount"
                    name="requestAmount"
                    value={selectedWithdrawRequest.requestAmount.toFixed(2)}
                    readOnly
                  />
                </FormGroup>
                <Row form>
                  <Col>
                    <FormGroup>
                      <Label for="currentWalletAmount">Wallet Amount</Label>
                      <Input
                        id="currentWalletAmount"
                        name="currentWalletAmount"
                        value={
                          selectedWithdrawRequest.rider.currentWalletAmount
                        }
                        readOnly
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col>
                    <FormGroup>
                      <Label for="currentWalletAmount">Requested Time</Label>
                      <Input
                        id="currentWalletAmount"
                        name="currentWalletAmount"
                        value={new Date(selectedWithdrawRequest.requestTime)}
                        readOnly
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label for="requestStatus">Status</Label>
                  <Input
                    id="requestStatus"
                    name="select"
                    type="select"
                    defaultValue={selectedWithdrawRequest.status}>
                    <option>REQUESTED</option>
                    <option>TRANSFERRED</option>
                    <option>CANCELLED</option>
                  </Input>
                </FormGroup>
                <Button
                  disabled={loadingStatus}
                  onClick={e => {
                    e.preventDefault()
                    const status = document.getElementById('requestStatus')
                      .value
                    if (status !== selectedWithdrawRequest.status) {
                      updateStatus({
                        variables: { id: selectedWithdrawRequest._id, status }
                      })
                    }
                  }}>
                  Update
                </Button>
                {errorMessage && (
                  <div>
                    <UncontrolledAlert color="danger">
                      {errorMessage}
                    </UncontrolledAlert>
                  </div>
                )}
              </Form>
            </CardBody>
          </Card>
        </Modal>
      )}
    </>
  )
}
