import {useState, useCallback, useMemo} from '@wordpress/element';
import {loadStripe} from "@stripe/stripe-js";
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {getSetting} from '@woocommerce/settings'
import {cloneDeep} from 'lodash';
import {
    getSettings,
    //initStripe as loadStripe
} from '../util';
import {Installments} from '../../components/checkout/';

import {useProcessCheckoutError, useDeferredPaymentIntent} from "../hooks";

const {publishableKey, stripeParams} = getSetting('stripeGeneralData');
const params = cloneDeep(stripeParams);
if (params.hasOwnProperty('betas') && params.betas.indexOf('link_autofill_modal_beta_1') > -1) {
    delete params.betas[params.betas.indexOf('link_autofill_modal_beta_1')];
}
const stripe = loadStripe(publishableKey, params);


const getData = getSettings('stripe_cc_data');

const isSetupCard = total => 0 >= total;

export const PaymentElementComponent = (props) => {
    const {cartTotal, currency} = props.billing;
    let options = {
        mode: 'payment',
        ...getData('elementOptions')
    }
    if (isSetupCard(cartTotal.value)) {
        options = {...options, mode: 'setup'}
    } else {
        options = {
            ...options,
            amount: cartTotal.value,
            currency: currency?.code?.toLowerCase()
        }
    }
    return (
        <>
            <Elements stripe={stripe} options={options}>
                <CardElement {...props}/>
            </Elements>
        </>
    );
}

const CardElement = ({onComplete, ...props}) => {
    const [formComplete, setFormComplete] = useState(false);
    const installmentsActive = getData('installmentsActive')
    const elements = useElements();
    const stripe = useStripe();
    const {billing: {billingData}, eventRegistration, emitResponse, shouldSavePayment} = props;
    const {email} = billingData;
    const {onPaymentProcessing, onCheckoutAfterProcessingWithError} = eventRegistration;
    const {responseTypes, noticeContexts} = emitResponse;
    const name = getData('name');
    const onChange = useCallback((event) => {
        setFormComplete(event.complete);
    }, []);
    const {createPaymentMethod, addPaymentMethodData} = useDeferredPaymentIntent({
        billingData,
        eventRegistration,
        responseTypes,
        shouldSavePayment,
        noticeContexts,
        name
    });

    useProcessCheckoutError({
        responseTypes,
        subscriber: onCheckoutAfterProcessingWithError,
        messageContext: noticeContexts.PAYMENTS
    });

    const getPaymentMethod = useCallback(async () => {
        let paymentMethod = null;
        const result = await createPaymentMethod();
        if (result?.paymentMethod?.id) {
            paymentMethod = result.paymentMethod.id;
        }
        return paymentMethod;
    }, [createPaymentMethod]);

    const options = {
        defaultValues: {
            billingDetails: {
                email
            }
        },
        fields: {
            billingDetails: {address: 'never'}
        },
        wallets: {applePay: 'never', googlePay: 'never'}
    }
    return (
        <>
            <PaymentElement options={options} onChange={onChange}/>
            {installmentsActive && <Installments
                paymentMethodName={getData('name')}
                stripe={stripe}
                cardFormComplete={formComplete}
                getPaymentMethod={getPaymentMethod}
                addPaymentMethodData={addPaymentMethodData}/>}
        </>
    )
}

export default PaymentElementComponent;