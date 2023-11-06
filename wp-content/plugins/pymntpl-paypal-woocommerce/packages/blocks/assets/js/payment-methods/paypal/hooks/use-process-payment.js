import {useState, useEffect, useRef, useCallback} from '@wordpress/element';
import {convertPayPalAddressToCart, extractFullName} from "@ppcp/utils";
import {isEmpty} from 'lodash';
import {getSetting} from '@woocommerce/settings';
import {
    DEFAULT_BILLING_ADDRESS,
    DEFAULT_SHIPPING_ADDRESS
} from "../../../utils";

const isOlderVersion = getSetting('ppcpGeneralData').isOlderVersion

export const useProcessPayment = (
    {
        onSubmit,
        billingData,
        shippingData,
        onPaymentProcessing,
        responseTypes,
        activePaymentMethod,
        paymentMethodId
    }) => {
    const [paymentData, setPaymentData] = useState(null);
    const currentPaymentData = useRef(null);
    const currentBillingData = useRef(null);
    const currentShippingData = useRef(null);

    useEffect(() => {
        currentPaymentData.current = paymentData;
        currentBillingData.current = billingData;
        currentShippingData.current = shippingData;
    });

    useEffect(() => {
        if (!isEmpty(paymentData)) {
            onSubmit();
        }
    }, [paymentData, onSubmit]);

    const convertOrderDataToAddress = useCallback((order) => {
        const {needsShipping} = currentShippingData.current;
        let address = {};
        if (!isEmpty(order?.payer?.address?.address_line_1)) {
            address = convertPayPalAddressToCart(order.payer.address);
        } else if (needsShipping && !isEmpty(order?.purchase_units?.[0]?.shipping)) {
            const shipping = order.purchase_units[0].shipping;
            address = convertPayPalAddressToCart(shipping.address);
        }
        if (order?.payer?.name) {
            address = {...address, ...extractName(order.payer.name)};
        }
        if (order?.payer?.email_address) {
            address = {...address, email: order.payer.email_address};
        }
        if (order?.payer?.phone?.phone_number?.national_number) {
            address = {...address, phone: order.payer.phone.phone_number.national_number};
        }
        return address;
    }, []);

    const convertBillingTokenToAddress = useCallback((data, type = 'billing') => {
        let address = {};
        const {needsShipping} = currentShippingData.current;
        if (type === 'billing') {
            if (data?.payer_info?.billing_address) {
                address = convertPayPalAddressToCart(data.payer_info.billing_address);
            }
        } else {
            if (needsShipping && data.shipping_address) {
                address = convertPayPalAddressToCart(data.shipping_address);
            }
        }
        if (data?.payer_info?.first_name) {
            address = {...address, first_name: data.payer_info.first_name};
        }
        if (data?.payer_info?.last_name) {
            address = {...address, last_name: data.payer_info.last_name};
        }
        if (data?.payer_info?.email) {
            address = {...address, email: data.payer_info.email};
        }
        if (data?.payer_info?.phone) {
            address = {...address, phone: data.payer_info.phone};
        }
        return address;
    }, []);

    const extractName = useCallback((name) => {
        let first_name, last_name;
        if (Array.isArray(name)) {
            [first_name, last_name] = name;
        } else {
            ({given_name: first_name, surname: last_name} = name);
        }
        return {first_name, last_name};
    }, []);

    const convertShippingAddress = useCallback(order => {
        let address = {};
        if (order?.purchase_units?.[0]?.shipping) {
            const shipping = order.purchase_units[0].shipping;
            address = convertPayPalAddressToCart(shipping.address);
            if (shipping?.name?.full_name) {
                const name = extractFullName(shipping.name.full_name);
                address = {...address, ...extractName(name)};
            }
        }
        return address;
    }, []);

    useEffect(() => {
        if (activePaymentMethod === paymentMethodId) {
            const unsubscribe = onPaymentProcessing(() => {
                const billingData = currentBillingData.current;
                const shippingData = currentShippingData.current;
                const {shippingAddress, needsShipping} = shippingData;
                const {orderId, billingToken, billingTokenData = null, order = {}} = currentPaymentData.current;
                const response = {
                    meta: {
                        paymentMethodData: {
                            ppcp_paypal_order_id: orderId,
                            ppcp_billing_token: billingToken
                        },
                        ...(isOlderVersion &&
                            {
                                billingData: {
                                    ...DEFAULT_BILLING_ADDRESS,
                                    ...billingData,
                                    ...convertOrderDataToAddress(order),
                                    ...(billingTokenData && convertBillingTokenToAddress(billingTokenData))
                                }
                            }),
                        billingAddress: {
                            ...DEFAULT_BILLING_ADDRESS,
                            ...billingData,
                            ...convertOrderDataToAddress(order),
                            ...(billingTokenData && convertBillingTokenToAddress(billingTokenData))
                        }
                    }
                }
                if (needsShipping) {
                    if (isOlderVersion) {
                        response.meta.shippingData = {
                            address: {
                                ...shippingAddress,
                                ...convertShippingAddress(order),
                                ...(billingTokenData && convertBillingTokenToAddress(billingTokenData, 'shipping'))
                            }
                        }
                    } else {
                        response.meta.shippingAddress = {
                            ...DEFAULT_SHIPPING_ADDRESS,
                            ...shippingAddress,
                            ...convertShippingAddress(order),
                            ...(billingTokenData && convertBillingTokenToAddress(billingTokenData, 'shipping'))
                        }
                    }
                }
                return {type: responseTypes.SUCCESS, ...response};
            });

            return () => unsubscribe();
        }
    }, [onPaymentProcessing, activePaymentMethod]);

    return {paymentData, setPaymentData};
}