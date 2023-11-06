const SimplePayPal = (props) => {
    return (
        <PayPalRedirectNotice {...props}/>
    )
}

const PayPalRedirectNotice = (
    {
        data
    }) => {
    return (
        <div className="wc-ppcp-popup__container">
            <img src={data('redirectIcon')}/>
            <p dangerouslySetInnerHTML={{__html: data('i18n').redirectText}}/>
        </div>
    )
}

export default SimplePayPal;