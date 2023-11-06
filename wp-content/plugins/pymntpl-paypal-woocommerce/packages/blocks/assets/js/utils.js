import {SHIPPING_OPTION_REGEX} from '@ppcp/utils';
import {getSetting} from '@woocommerce/settings';

export const getShippingOptionId = (packageId, rateId) => `${packageId}:${rateId}`;

export const getSelectedShippingOptionId = (shippingRates) => {
    let shippingOption = '';
    shippingRates.forEach((shippingPackage, idx) => {
        shippingPackage.shipping_rates.forEach(rate => {
            if (rate.selected) {
                shippingOption = getShippingOptionId(idx, rate.rate_id);
            }
        });
    });
    return shippingOption;
}

export const extractShippingRateParams = (id) => {
    const result = id.match(SHIPPING_OPTION_REGEX);
    if (result) {
        const {1: packageIdx, 2: rate} = result;
        return [rate, packageIdx];
    }
    return [];
}

export const removeNumberPrecision = (value, unit) => {
    return value / 10 ** unit;
}

export const hasShippingOptions = (shippingRates) => shippingRates.map(rate => rate?.shipping_rates.length > 0).filter(Boolean).length > 0;

export const createPatchRequest = ({billing, shippingData, selectedShippingOption = null}) => {
    const {shippingRates} = shippingData;
    const {currency, cartTotal, cartTotalItems} = billing;
    return [
        {
            'op': 'replace',
            'path': '/purchase_units/@reference_id==\'default\'/amount',
            'value': {
                currency_code: currency.code,
                value: removeNumberPrecision(cartTotal.value, currency.minorUnit),
                breakdown: getAmountBreakdown(cartTotalItems, currency)
            }
        },
        {
            'op': !selectedShippingOption ? 'add' : 'replace',
            'path': '/purchase_units/@reference_id==\'default\'/shipping/options',
            'value': getFormattedShippingOptions(shippingRates)
        }
    ];
};

export const getAmountBreakdown = (cartTotalItems, currency) => {
    const breakdown = {
        item_total: 0
    };
    for (const cartItem of cartTotalItems) {
        switch (cartItem.key) {
            case 'total_items':
            case 'total_fees':
                breakdown.item_total += cartItem.value;
                break;
            case 'total_discount':
                breakdown.discount = getBreakdownItem(cartItem, currency);
                break;
            case 'total_shipping':
                breakdown.shipping = getBreakdownItem(cartItem, currency)
                break;
            case 'total_tax':
                breakdown.tax_total = getBreakdownItem(cartItem, currency)
                break;
        }
    }
    breakdown.item_total = {
        value: removeNumberPrecision(breakdown.item_total, currency.minorUnit),
        currency_code: currency.code
    };
    return breakdown;
}

export const getFormattedShippingOptions = (shippingRates) => {
    let options = [];
    shippingRates.forEach((shippingPackage, idx) => {
        let rates = shippingPackage.shipping_rates.map(rate => {
            let txt = document.createElement('textarea');
            txt.innerHTML = rate.name;
            return {
                id: getShippingOptionId(idx, rate.rate_id),
                label: txt.value,
                type: 'SHIPPING',
                selected: rate.selected,
                amount: {
                    value: removeNumberPrecision(rate.price, rate.currency_minor_unit),
                    currency_code: rate.currency_code
                }
            }
        });
        options = [...options, ...rates];
    });
    return options;
}

export const getBreakdownItem = (cartItem, currency) => {
    return {
        value: removeNumberPrecision(cartItem.value, currency.minorUnit),
        currency_code: currency.code
    }
}
export const getFormattedCartItems = (cartTotalItems, currency) => {
    return cartTotalItems.map(cartItem => getFormattedCartItem(cartItem, currency));
}

export const getFormattedCartItem = (cartItem, currency) => ({
    name: cartItem.label,
    unit_amount: {
        value: removeNumberPrecision(cartItem.value, currency.minorUnit),
        currency_code: currency.code
    },
    quantity: 1
})

/**
 * Returns a rest route in ajax form given a route path.
 * @param path
 * @returns {*}
 */
export const getRestPath = (path) => {
    path = path.replace(/^\//, '');
    return getSetting('ppcpGeneralData')?.ajaxRestPath?.replace('%s', path);
}

export const isUserAdmin = () => getSetting('ppcpGeneralData')?.isAdmin

const getLocaleFields = (country) => {
    const countryLocale = getSetting('countryLocale', {});
    let localeFields = {...countryLocale.default};
    if (country && countryLocale.hasOwnProperty(country)) {
        localeFields = Object.entries(countryLocale[country]).reduce((locale, [key, value]) => {
            locale[key] = {...locale[key], ...value}
            return locale;
        }, localeFields);
    }
    return localeFields;
}

export const isAddressValid = (address, exclude = []) => {
    const fields = getLocaleFields(address.country);
    for (const [key, value] of Object.entries(address)) {
        if (!exclude.includes(key) && fields?.[key] && fields[key].required) {
            if (isEmpty(value)) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Returns true if the provided value is empty.
 * @param value
 * @returns {boolean}
 */
const isEmpty = (value) => {
    if (typeof value === 'string') {
        return value.length == 0 || value == '';
    }
    if (Array.isArray(value)) {
        return array.length == 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length == 0;
    }
    if (typeof value === 'undefined') {
        return true;
    }
    return true;
}

export const versionCompare = (ver1, ver2, compare) => {
    switch (compare) {
        case '<':
            return ver1 < ver2;
        case '>':
            return ver1 > ver2;
        case '<=':
            return ver1 <= ver2;
        case '>=':
            return ver1 >= ver2;
        case '=':
            return ver1 == ver2;
    }
    return false;
}

export const DEFAULT_SHIPPING_ADDRESS = {
    'first_name': '',
    'last_name': '',
    'company': '',
    'address_1': '',
    'address_2': '',
    'city': '',
    'state': '',
    'postcode': '',
    'country': '',
    'phone': '',
}

export const DEFAULT_BILLING_ADDRESS = {
    ...DEFAULT_SHIPPING_ADDRESS,
    'email': ''
}