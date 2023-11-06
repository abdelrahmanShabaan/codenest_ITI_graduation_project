<?php


namespace PaymentPlugins\WooFunnels\Stripe;


use PaymentPlugins\WooFunnels\Stripe\Cart\CartIntegration;
use PaymentPlugins\WooFunnels\Stripe\Checkout\Compatibility\ExpressButtonController;
use PaymentPlugins\WooFunnels\Stripe\Upsell\PaymentGateways;

class Main {

	public static function init() {
		if ( self::enabled() ) {
			new PaymentGateways( new AssetsApi( __DIR__, stripe_wc()->version() ) );
		}
		if ( self::is_acp_enabled() ) {
			new ExpressButtonController(
				new AssetsApi( __DIR__, stripe_wc()->version() )
			);
		}
		if ( self::is_cart_enabled() ) {
			( new CartIntegration() )->initialize();
		}
	}

	private static function enabled() {
		return function_exists( 'WFOCU_Core' );
	}

	private static function is_acp_enabled() {
		return class_exists( 'WFACP_Core' );
	}

	private static function is_cart_enabled() {
		return class_exists( '\FKCart\Plugin' );
	}

}