import {useEffect} from '@wordpress/element';

export const useLinkIcon = ({enabled, email, icon}) => {
    useEffect(() => {
        if (enabled) {
            let el = document.getElementById('email');
            if (el) {
                if (!el.classList.contains('stripe-link-icon-container')) {
                    removeElement('.wc-stripe-link-icon');
                    el.classList.add('stripe-link-icon-container');
                    const iconEl = document.createElement('template');
                    iconEl.innerHTML = icon;
                    el.parentElement.append(iconEl.content.firstChild);
                }
            } else {

            }
        }
    });
}

const removeElement = (className) => {
    const el = document.querySelector(className);
    if (el) {
        el.remove();
    }
}