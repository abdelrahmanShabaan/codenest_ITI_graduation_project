<?php

namespace PaymentPlugins\Stripe\WooCommerceProductAddons;

use PaymentPlugins\Stripe\Assets\AssetsApi;

class Package {

	public static function init() {
		if ( self::is_enabled() ) {
			add_action( 'woocommerce_init', [ __CLASS__, 'initialize' ] );
		}
	}

	public static function initialize() {
		( new FrontendScripts(
			new AssetsApi(
				dirname( __DIR__ ) . '/',
				trailingslashit( plugin_dir_url( __DIR__ ) ),
				stripe_wc()->version()
			)
		) )->initialize();
	}

	private static function is_enabled() {
		return \function_exists( 'woocommerce_product_addons_activation' );
	}

}