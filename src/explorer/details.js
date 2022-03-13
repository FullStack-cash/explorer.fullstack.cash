import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Box, Button } from 'adminlte-2-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import JSONPretty from 'react-json-pretty'

const HASH_EXPLORER = 'https://p2wdb.fullstack.cash/entry/hash/' // PSF p2wdb hash explorer
const TX_EXPLORER = 'https://simpleledger.info/tx/' // BCH Transaction Explorer

let _this
class Details extends React.Component {
  constructor (props) {
    super(props)

    _this = this

    this.state = {
      entry: {},
      entryData: {}
    }
  }

  render () {
    const { entry, entryData } = _this.state
    return (
      <>
        <Row>
          <Col sm={12}>
            <Box className=' border-none mt-2' loaded={!this.state.inFetch}>
              <Row className='text-center'>
                <Col sm={12}>
                  <h1 id='SendTokens'>
                    <FontAwesomeIcon
                      className='title-icon'
                      size='xs'
                      icon='info-circle'
                    />
                    <span>Details</span>
                  </h1>
                  {entry._id && (
                    <Box className='border-none details-data-content'>
                      <p>
                        <b>IS VALID: </b>
                        {entry.isValid}
                      </p>
                      <p>
                        <b>APP ID: </b>
                        {entry.appId || 'none'}
                      </p>
                      <p>
                        <b>CREATE AT: </b>
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <b>ID: </b>
                        {entry._id}
                      </p>
                      <p>
                        <b>HASH: </b>
                        <a
                          href={`${HASH_EXPLORER}${entry.hash}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {entry.hash}
                        </a>
                      </p>
                      <p>
                        <b>TRANSACTION ID : </b>
                        <a
                          href={`${TX_EXPLORER}${entry.key}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {entry.key}
                        </a>
                      </p>
                      {entryData && (
                        <>
                          <b>VALUE : </b>
                          <p>
                            - <b>Message : </b> {entryData.message}
                          </p>
                          <p>
                            - <b>Signature : </b> {entryData.signature}
                          </p>
                          <p>
                            {!_this.isJson(entryData.data) && (
                              <>
                                - <b>Data : </b> {entryData.data}
                              </>
                            )}

                            {_this.isJson(entryData.data) && (
                              <>
                                - <b>Data :</b>
                                <JSONPretty
                                  id='json-pretty'
                                  data={entryData.data}
                                />
                              </>
                            )}
                          </p>
                        </>
                      )}
                    </Box>
                  )}
                </Col>
                <Col sm={12}>
                  <div className='btn-wrapper'>
                    <Button
                      text='Close'
                      type='primary'
                      className='btn-lg btn-close-entry mr-1 ml-1 mt-1'
                      onClick={_this.handleClose}
                    />
                  </div>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>
      </>
    )
  }

  componentDidMount () {
    _this.handleData()
  }

  componentDidUpdate () {
    if (_this.props.entry._id !== _this.state.entry._id) {
      _this.handleData()
    }
  }

  handleData () {
    try {
      const { entry } = _this.props
      _this.setState({
        entry,
        entryData: entry.value
      })
    } catch (err) {
      console.warn('Error in handleData()', err)
    }
  }

  handleClose () {
    _this.props.onClose()
  }

  // Detects if the input is a string and converts to json object
  isJson (data) {
    try {
      JSON.parse(data)
      return true
    } catch (error) {
      return false
    }
  }
}
Details.propTypes = {
  entry: PropTypes.object,
  onClose: PropTypes.func
}
export default Details
