import React from 'react'
import { Row, Col, Content, Box, DataTable, Inputs, Button } from 'adminlte-2-react'
import Details from './details'
import './explorer.css'
const { Text } = Inputs

const axios = require('axios').default

const SERVER = 'https://p2wdb.fullstack.cash/'
const EXPLORER_URL = 'https://explorer.bitcoin.com/bch/tx/'

let _this
class Explorer extends React.Component {
  constructor (props) {
    super(props)
    _this = this
    this.state = {
      showEntry: false,
      data: [],
      entries: [],
      entryData: null,
      addId: '',
      endpoint: `${SERVER}entry/all/${0}`,
      isFiltered: false,
      inFetch: true
    }

    this.firstColumns = [
      { title: 'Created At', data: 'createdAt' },
      {
        title: 'Transaction',
        data: 'txid',
        render: txid => (
          <span className='on-click-event action-handler'>
            {txid.subString}
          </span>
        )
      },
      {
        title: 'Hash',
        data: 'hash',
        render: hash => (
          <span className='on-click-event action-handler'>
            {hash.subString}
          </span>
        )
      },
      { title: 'App Id', data: 'appId' }
    ]
  }

  render () {
    const { data, entryData, isFiltered, appId, inFetch } = _this.state
    return (
      <Content
        title='P2WDB Explorer'
        subTitle='Block Explorer for P2WDB'
        browserTitle='P2WDB Explorer'
      >
        <Row>
          {!entryData && (
            <Box loaded={!inFetch} title='Search By Appid' className='text-center'>
              <Text
                id='appId'
                name='appId'
                placeholder='Enter AppId'
                label='AppId'
                labelPosition='above'
                onChange={this.handleUpdate}
              />
              <Button
                text={isFiltered && !appId ? 'Search All' : 'Search'}
                type='primary'
                className='btn-lg btn-close-entry mr-1 ml-1 mt-1'
                onClick={_this.handleSearchByAppId}
              />
            </Box>
          )}

          {entryData && (
            <Col xs={12}>
              <Details entry={entryData} onClose={_this.handleClose} />
            </Col>
          )}
          <Col xs={12}>
            <Box title='Block explorer for P2WDB'>
              <DataTable
                columns={_this.firstColumns}
                data={data}
                options={{
                  paging: true,
                  lengthChange: false,
                  searching: false,
                  ordering: false,
                  info: true,
                  autoWidth: false
                }}
                onClickEvents={{
                  onClickEvent: (data, rowIdx, rowData) => {
                    _this.handleEvents(data)
                  }
                }}
              />
            </Box>
          </Col>
        </Row>
      </Content>
    )
  }

  handleUpdate (event) {
    _this.setState({
      [event.target.name]: event.target.value
    })
  }

  async componentDidMount () {
    _this.handleEntries()

    // Get data and update table
    // every 20 seconds
    setInterval(() => {
      _this.handleEntries()
    }, 20000)
  }

  async handleEntries () {
    const entries = await _this.getEntries()
    _this.generateDataTable(entries)
  }

  // REST petition to Get data fron the pw2db
  async getEntries (endpoint) {
    try {
      const url = endpoint || _this.state.endpoint
      // console.log(`url : ${url}`)
      const options = {
        method: 'GET',
        url: url,
        data: {}
      }
      const result = await axios.request(options)
      _this.setState({
        entries: result.data.data,
        inFetch: false
      })
      return result.data.data
    } catch (err) {
      console.warn('Error in getEntries() ', err)
    }
  }

  // Generate table content
  generateDataTable (dataArr) {
    try {
      const data = []

      for (let i = 0; i < dataArr.length; i++) {
        const entry = dataArr[i]
        const row = {
          // createdAt row data
          createdAt: new Date(entry.createdAt).toLocaleString(),
          // Transaction id row data
          txid: {
            subString: _this.cutString(entry.key),
            txid: entry.key
          },
          // Hash row data
          hash: {
            subString: _this.cutString(entry.hash),
            hash: entry.hash,
            data: entry
          },
          // App id row data
          appId: entry.appId || 'none'
        }
        data.push(row)
      }
      _this.setState({
        data
      })
    } catch (err) {
      console.warn('Error in generateDataTable() ', err)
    }
  }

  cutString (txid) {
    try {
      const subTxid = txid.slice(0, 4)
      const subTxid2 = txid.slice(-4)
      return `${subTxid}...${subTxid2}`
    } catch (err) {
      console.warn('Error in cutString() ', err)
    }
  }

  handleTxIdClick (txid) {
    try {
      window.open(`${EXPLORER_URL}${txid}`, '_blank')
    } catch (err) {
      console.warn('Error in handleTxIdClick() ', err)
    }
  }

  handleHashClick (data) {
    try {
      data.isValid = data.isValid.toString()
      _this.setState({
        entryData: data
      })
    } catch (err) {
      _this.setState({
        entryData: null
      })
      console.warn('Error in handleHashClick() ', err)
    }
  }

  handleEvents (eventData) {
    try {
      const { txid, hash, data } = eventData

      if (txid) {
        _this.handleTxIdClick(txid)
      }
      if (hash && data) {
        _this.handleHashClick(data)
      }
    } catch (err) {
      console.warn('Error in handleEvents() ', err)
    }
  }

  handleClose () {
    _this.setState({
      entryData: null
    })
  }

  async handleSearchByAppId () {
    try {
      const { appId } = _this.state
      let endpoint
      let isFiltered = true
      if (!appId) {
        endpoint = `${SERVER}entry/all/${0}`
        isFiltered = false
      } else {
        endpoint = `${SERVER}entry/appid/${appId}`
      }
      // save the last called endpoint for intervall calls
      _this.setState({
        endpoint,
        isFiltered,
        inFetch: true
      })
      const entries = await _this.getEntries(endpoint)
      _this.generateDataTable(entries)
    } catch (error) {
      console.warn(error)
    }
  }
}

export default Explorer
