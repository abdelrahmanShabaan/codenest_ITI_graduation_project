<?php

namespace PaymentPlugins\Stripe\WooCommerceSubscriptions;

use PaymentPlugins\Stripe\WooCommerceSubscriptions\Controllers\OrderMetadata;
use PaymentPlugins\Stripe\WooCommerceSubscriptions\Controllers\PaymentIntent;

class Package {

	public static function init() {
		if ( self::is_enabled() ) {
			add_action( 'woocommerce_init', [ __CLASS__, 'initialize' ] );
			add_filter( 'wc_stripe_api_controllers', function ( $controllers ) {
				$controllers['subscriptions'] = 'PaymentPlugins\Stripe\WooCommerceSubscriptions\Rest\Routes\ChangePaymentMethodRoute';

				return $controllers;
			} );
		}
	}

	public static function initialize() {
		new PaymentIntent( new FrontendRequests() );
		new OrderMetadata();
	}

	private static function is_enabled() {
		return \function_exists( 'wcs_is_subscription' );
	}

}