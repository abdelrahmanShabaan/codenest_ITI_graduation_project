import $ from 'jquery';
import {product_gateways as gateways} from '@paymentplugins/wc-stripe';

const handleFieldChange = (e) => {
    let tmcpCalculation = false;
    // when a extra product option field changes, update the cart calculation
    gateways.forEach(gateway => {
        if (gateway.maybe_calculate_cart) {
            tmcpCalculation = true;
            gateway.maybe_calculate_cart();
            tmcpCalculation = false;
        }
    });
}

const getExtraProductData = () => {
    const data = $('form.cart .tmcp-field').serializeArray().reduce((carry, obj) => {
        return {...carry, [obj.name]: obj.value};
    }, {});
    return data;
}

$(() => {
    if (gateways.length) {

        gateways.forEach(gateway => {
            // add to cart data function wrapper
            const getAddToCartData = gateway.get_add_to_cart_data;
            gateway.get_add_to_cart_data = () => {
                return {
                    ...getAddToCartData.call(gateway),
                    ...getExtraProductData()
                }
            }
        });

        $(document.body).on('change', 'form.cart .tmcp-field', handleFieldChange);
    }
})