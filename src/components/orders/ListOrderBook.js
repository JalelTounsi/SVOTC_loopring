import React from 'react'
import intl from 'react-intl-universal'
import {connect} from 'dva'
import {getTokensByMarket} from 'modules/formatter/common'
import {Popover,Spin} from 'antd'
import {toFixed, toNumber} from "LoopringJS/common/formatter";
import {getFormatTime} from "../../modules/formatter/common";

const MetaItem = (props) => {
  const {label, value, render} = props
  return (
    <div className="row pt5 pb5 align-items-center zb-b-b" style={{minWidth:'150px',maxWidth:'250px'}}>
      <div className="col-auto fs12 color-black-2">
        {label}
      </div>
      <div className="col text-right fs14 color-black-1 text-wrap pl20">
        {render ? render(value) : value}
      </div>
    </div>
  )
}

const ItemMore=({item,tokens})=>{
  return (
    <div>
      <MetaItem label={intl.get('order.total')} value={`${item.size} ${tokens.right}` } />
      <MetaItem label={intl.get('order.validUntil')} value={getFormatTime(toNumber(item.validUntil)*1e3,'MM-DD hh:mm')} />
    </div>
  )
}
function ListOrderBook(props) {
  const {orderBook:list,trades} = props;
  const tokens = getTokensByMarket(list.filters.market)
  const priceSelected = (value, e) => {
    e.preventDefault()
    props.dispatch({type:'placeOrder/priceChange', payload:{priceInput:value}})
  };
  const amountSelected = (value, e) => {
    e.preventDefault()
    props.dispatch({type:'placeOrder/amountChange', payload:{amountInput:value}})
  };
  let sell = [], buy = []
  if(list && list.item) {
    if(list.item.sell) {
        sell = [...list.item.sell].reverse()
    }
    if(list.item.buy) {
      buy = [...list.item.buy].map(item=>{
        if(sell.length > 0 && Number(item[0]) > Number(sell[sell.length - 1][0])) {
          item.largerThanSell1 = true
        }
        return item
      })
    }
  }

  const isIncresse = () => {
    if(trades.length===0 || trades.length ===1){
      return true
    }else {
      return trades[0].price >= trades[1].price
    }
  };
  return (
    <div>
	    <div className="card dark" style={{height:"100vh"}}>
	    	<div className="card-header card-header-dark bordered">
	    	    <h4>{intl.get('order_list.order_book')}</h4>
	    	</div>
	    	<div className="trade-list" style={{height:"-webkit-calc(100% - 31px)"}}>
    	    	    <div className="bg" style={{ position: "absolute", top:"50%", marginTop:"-45px", zIndex: "100", width: "100%", height: "40px", lineHeight: "38px", border:"1px solid rgba(255,255,255,.07)", borderWidth: "1px 0", fontSize: "16px"}}>
                  {trades.length >0 && isIncresse() &&	<div className="text-up text-center cursor-pointer" onClick={priceSelected.bind(this, trades[0] ? trades[0].price.toString() : '0')}>{trades[0] && trades[0].price}<span className="offset-md"><i className="icon-arrow-up"></i></span></div>}
                  {trades.length >0 && !isIncresse() &&	<div className="text-down text-center cursor-pointer" onClick={priceSelected.bind(this, trades[0] ? trades[0].price.toString() : '0')}>{trades[0] && trades[0].price}<span className="offset-md"><i className="icon-arrow-down"></i></span></div>}
                </div>
    	        <ul className="mr-0">
	    	            <li className="trade-list-header">
			    	        <span>{intl.get('order.price')} {tokens.right}</span>
			    	        <span style={{textAlign:'right'}}>{intl.get('order.amount')} {tokens.left} </span>
			    	        <span style={{textAlign:'right'}}>{intl.get('order.LRCFee')}</span>
		    	        </li>
		    	    </ul>
	    	    <div className="height-control" style={{height: "-webkit-calc(50% - 85px)",marginTop:"5px",marginBottom:"0",paddiongBottom:"10" }}>
              <Spin spinning={list.loading}>
                <ul style={{height: "100%", overflow:"auto",paddingTop:"0",marginBottom:"0px" }}>
                      {
                        sell.map((item,index)=>
                          <Popover placement="right" content={<ItemMore item={item} tokens={tokens}/>} title={null} key={index}>
                            <li >
                              <span className="text-down cursor-pointer" onClick={priceSelected.bind(this, toFixed(Number(item.price),8))}>{toFixed(Number(item.price),8)}</span>
                              <span className="cursor-pointer" style={{textAlign:'right'}} onClick={amountSelected.bind(this, toFixed(Number(item.amount),4))}>{toFixed(Number(item.amount),4)}</span>
                              <span style={{textAlign:'right'}}>{toFixed(Number(item.lrcFee),8)}</span>
                            </li>
                          </Popover>
                        )
                      }
                      {
                        sell.length === 0 &&
                        <li className="text-center">{intl.get('common.list.no_data')}</li>
                      }
                  </ul>
              </Spin>
	    	    </div>
	    	    <div className="height-control" style={{height: "-webkit-calc(50% - 85px)",paddingTop:"0",paddingBottom:"0",marginTop:"50px",marginBottom:"0"}}>
              <Spin spinning={list.loading}>
  	            <ul style={{height: "100%", overflow:"auto",paddingTop:"0",marginBottom:"0" }}>
  	                {
                      buy.map((item,index)=>
                        <Popover placement="right" content={<ItemMore item={item} tokens={tokens}/>} title={null} key={index}>
                          <li key={index}>
                            <span className="text-up cursor-pointer" onClick={priceSelected.bind(this, toFixed(Number(item.price),8))}>{toFixed(Number(item.price),8)}</span>
                            <span className="cursor-pointer" style={{textAlign:'right'}} onClick={amountSelected.bind(this, toFixed(Number(item.amount),4))}>{toFixed(Number(item.amount),4)}</span>
                            <span style={{textAlign:'right'}}>{toFixed(Number(item.lrcFee),8)}</span></li>
                        </Popover>
                      )
                    }
                    {
                      buy.length === 0 &&
                          <li className="text-center" >{intl.get('common.list.no_data')}</li>
                    }
  	            </ul>
              </Spin>
	    	    </div>
	        </div>
	    </div>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    orderBook:state.sockets.orderBook,
    trades:state.sockets.trades.items
  }
}

export default connect(mapStateToProps)(ListOrderBook)
