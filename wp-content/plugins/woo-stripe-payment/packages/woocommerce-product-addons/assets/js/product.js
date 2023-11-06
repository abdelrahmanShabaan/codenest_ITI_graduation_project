import $ from 'jquery';
import {product_gateways as gateways} from '@paymentplugins/wc-stripe';

const handleFieldChange = (e) => {
    // when a extra product option field changes, update the cart calculation
    gateways.forEach(gateway => {
        if (gateway.maybe_calculate_cart) {
            gateway.maybe_calculate_cart();
        }
    });
}

const getExtraProductData = () => {
    const data = $('form.cart .wc-pao-addon-field').serializeArray().reduce((carry, obj) => {
        if (/([\w\-\_]+)\[\]$/.test(obj.name)) {
            const name = obj.name.substring(0, obj.name.length - 2);
            return {
                ...carry,
                [name]: [
                    ...(carry[name] || []),
                    obj.value
                ]
            }
        }
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

        $(document.body).on('updated_addons', 'form.cart', handleFieldChange);
    }
})