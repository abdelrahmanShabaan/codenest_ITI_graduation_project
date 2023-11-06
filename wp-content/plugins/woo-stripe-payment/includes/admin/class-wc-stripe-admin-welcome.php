<?php

class WC_Stripe_Admin_Welcome {

	const PAYPAL_SLUG = 'pymntpl-paypal-woocommerce';

	public static function output() {
		wp_enqueue_script( 'updates' );
		$data = rawurlencode( wp_json_encode( array(
			'routes' => array(
				'signup' => WC_Stripe_Rest_API::get_admin_endpoint( stripe_wc()->rest_api->signup->rest_uri( 'contact' ) )
			)
		) ) );
		wp_add_inline_script(
			'wc-stripe-main-script',
			"var wcStripeSignupParams = wcStripeSignupParams || JSON.parse( decodeURIComponent( '"
			. esc_js( $data )
			. "' ) );",
			'before'
		);
		$slug      = self::PAYPAL_SLUG;
		$installed = self::is_paypal_installed();
		$plugins   = (object) array(
			'authorized' => current_user_can( 'install_plugins' ),
			'paypal'     => (object) array(
				'slug'         => self::PAYPAL_SLUG,
				'installed'    => $installed,
				'activated'    => self::is_paypal_activated(),
				'install_url'  => wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=' . self::PAYPAL_SLUG ), 'install-plugin_' . self::PAYPAL_SLUG ),
				'activate_url' => add_query_arg(
					array(
						'_wpnonce' => wp_create_nonce( 'activate-plugin_' . self::get_plugin_file( self::PAYPAL_SLUG ) ),
						'action'   => 'activate',
						'plugin'   => self::get_plugin_file( self::PAYPAL_SLUG ),
					),
					network_admin_url( 'plugins.php' )
				)
			)
		);
		include_once dirname( __FILE__ ) . '/views/html-welcome-page.php';
	}

	private static function is_paypal_installed() {
		$plugins = get_plugins();
		foreach ( $plugins as $key => $plugin ) {
			if ( strpos( $key, self::PAYPAL_SLUG . '.php' ) !== false ) {
				return true;
			}
		}

		return false;
	}

	private static function is_paypal_activated() {
		return class_exists( '\PaymentPlugins\WooCommerce\PPCP\Main' );
	}

	private static function get_plugin_file( $slug ) {
		$plugins = get_plugins();
		foreach ( $plugins as $key => $plugin ) {
			if ( strpos( $key, self::PAYPAL_SLUG . '.php' ) !== false ) {
				return $key;
			}
		}

		return null;
	}

}