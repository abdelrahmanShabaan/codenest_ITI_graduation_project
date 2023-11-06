<?php

defined( 'ABSPATH' ) || exit();

/**
 * Load the test mode account details
 */
if ( function_exists( 'WC' ) ) {
	$account_settings = stripe_wc()->account_settings;
	if ( ! $account_settings->has_completed_connect_process() ) {
		$live_secret = wc_stripe_get_secret_key( 'live' );

		if ( $live_secret ) {
			// there is a secret_key, so the customer has gone through the connect process;
			$account_settings->settings['via_connect'] = true;
			update_option( $account_settings->get_option_key(), $account_settings->settings );
		}
	}
}