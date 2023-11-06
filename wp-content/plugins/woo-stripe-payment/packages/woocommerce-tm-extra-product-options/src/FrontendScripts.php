<?php

namespace PaymentPlugins\Stripe\WooCommerceExtraProductOptions;

use PaymentPlugins\Stripe\Assets\AssetsApi;

class FrontendScripts {

	private $assets;

	public function __construct( AssetsApi $assets ) {
		$this->assets = $assets;
		$this->initialize();
	}

	private function initialize() {
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}

	public function enqueue_scripts() {
		$this->assets->register_script( 'wc-stripe-epo', 'build/wc-stripe-epo.js' );

		if ( is_product() ) {
			wp_enqueue_script( 'wc-stripe-epo' );
		}
	}

}