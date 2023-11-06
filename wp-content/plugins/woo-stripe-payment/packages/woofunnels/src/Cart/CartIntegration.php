<?php

namespace PaymentPlugins\WooFunnels\Stripe\Cart;

class CartIntegration {

	public function initialize() {
		//add_action( 'fkcart_before_checkout_button', [ $this, 'render_before_checkout_button' ] );
		add_action( 'fkcart_after_checkout_button', [ $this, 'render_after_checkout_button' ] );
	}

	public function render_before_checkout_button() {
	}

	public function render_after_checkout_button() {
		$cart = WC()->cart;
		if ( $cart && $cart->needs_payment() ) {
			\WC_Stripe_Field_Manager::mini_cart_buttons();
			if ( is_ajax() ) {
				?>
                <script>
                    if (window.jQuery) {
                        jQuery(document.body).triggerHandler('wc_fragments_refreshed');
                    }
                </script>
                <style>
                    .wc-stripe-gpay-mini-cart,
                    .wc-stripe-applepay-mini-cart,
                    .wc-stripe-payment-request-mini-cart {
                        margin-top: 10px;
                        display: block;
                    }
                </style>
				<?php
			}
		}
	}

}