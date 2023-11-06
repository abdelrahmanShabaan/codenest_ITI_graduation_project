<?php

namespace PaymentPlugins\Stripe\WooCommerceSubscriptions\Controllers;

use PaymentPlugins\Stripe\WooCommerceSubscriptions\FrontendRequests;

class PaymentIntent {

	private $request;

	public function __construct( FrontendRequests $request ) {
		$this->request = $request;
		$this->initialize();
	}

	private function initialize() {
		add_filter( 'wc_stripe_create_setup_intent', [ $this, 'maybe_create_setup_intent' ] );
		add_filter( 'wc_stripe_payment_intent_args', [ $this, 'update_payment_intent_args' ], 10, 2 );
		add_filter( 'wc_stripe_setup_intent_params', [ $this, 'update_setup_intent_params' ], 10, 2 );
		add_filter( 'wc_stripe_update_setup_intent_params', [ $this, 'update_setup_intent_params' ], 10, 2 );

		/**
		 * Filter that is called when a setup-intent is created via the REST API
		 */
		add_filter( 'wc_stripe_create_setup_intent_params', [ $this, 'add_setup_intent_params' ], 10, 2 );

		add_action( 'wc_stripe_output_checkout_fields', [ $this, 'print_script_variables' ] );
	}

	private function account_requires_mandate() {
		return stripe_wc()->account_settings->get_account_country( wc_stripe_mode() ) === 'IN';
	}

	public function maybe_create_setup_intent( $bool ) {
		if ( ! $bool ) {
			if ( $this->request->is_change_payment_method() ) {
				$bool = true;
			} elseif ( $this->request->is_checkout_with_free_trial() ) {
				$bool = true;
			} elseif ( $this->request->is_order_pay_with_free_trial() ) {
				$bool = true;
			}
		}

		return $bool;
	}

	/**
	 * @param array     $args
	 * @param \WC_Order $order
	 *
	 * @return void
	 */
	public function update_payment_intent_args( $args, $order ) {
		return $this->add_params_to_intent( $args, $order );
	}

	public function update_setup_intent_params( $args, $order ) {
		return $this->add_params_to_intent( $args, $order, 'setup_intent' );
	}

	/**
	 * @param array     $args
	 * @param \WC_Order $order
	 * @param string    $type
	 *
	 * @return array
	 */
	private function add_params_to_intent( $args, $order, $type = 'payment_intent' ) {
		if ( in_array( 'card', $args['payment_method_types'] ) ) {
			// check if this is an India account. If so, make sure mandate data is included.
			if ( stripe_wc()->account_settings->get_account_country( wc_stripe_order_mode( $order ) ) === 'IN' ) {
				if ( isset( $args['setup_future_usage'] ) && $args['setup_future_usage'] === 'off_session'
				     || $type === 'setup_intent'
				     || wcs_order_contains_subscription( $order )
				) {
					$subscriptions = wcs_get_subscriptions_for_order( $order );
					if ( $subscriptions ) {
						$total = max( array_map( function ( $subscription ) {
							return (float) $subscription->get_total();
						}, $subscriptions ) );
						if ( ! isset( $args['payment_method_options']['card'] ) ) {
							$args['payment_method_options']['card'] = [];
						}
						$args['payment_method_options']['card']['mandate_options'] = array(
							'amount'          => wc_stripe_add_number_precision( $total, $order->get_currency() ),
							'amount_type'     => 'maximum',
							'interval'        => 'sporadic',
							'reference'       => $order->get_id(),
							'start_date'      => time(),
							'supported_types' => [ 'india' ]
						);
						if ( $type === 'setup_intent' ) {
							$args['payment_method_options']['card']['mandate_options']['currency'] = $order->get_currency();
						}
					}
				}
			}
		}

		return $args;
	}

	/**
	 * @param array                      $args
	 * @param \WC_Payment_Gateway_Stripe $payment_method
	 *
	 * @return array
	 */
	public function add_setup_intent_params( $args, $payment_method ) {
		if ( in_array( 'card', $args['payment_method_types'] ) ) {
			if ( $payment_method->is_mandate_required() ) {
				//if ( \WC_Subscriptions_Cart::cart_contains_free_trial() ) {
				if ( ! isset( $args['payment_method_options']['card'] ) ) {
					$args['payment_method_options']['card'] = [];
				}
				$total = 15000;//$this->get_recurring_cart_total();
				// add margin to the total since the shipping might not have been calculated yet.
				$customer_id = wc_stripe_get_customer_id();
				if ( ! $customer_id ) {
					$customer = \WC_Stripe_Customer_Manager::instance()->create_customer( WC()->customer );
					if ( ! is_wp_error( $customer ) ) {
						$customer_id = $customer->id;
						WC()->session->set( \WC_Stripe_Constants::STRIPE_CUSTOMER_ID, $customer_id );
					}
				}
				$args['customer']                                          = $customer_id;
				$args['payment_method_options']['card']['mandate_options'] = array(
					'amount'          => wc_stripe_add_number_precision( $total ),
					'amount_type'     => 'maximum',
					'interval'        => 'sporadic',
					'reference'       => sprintf( '%1$s-%2$s', WC()->session->get_customer_id(), uniqid() ),
					'start_date'      => time(),
					'supported_types' => [ 'india' ],
					'currency'        => get_woocommerce_currency()
				);
				//}
			}
		}

		return $args;
	}

	public function print_script_variables() {
		if ( WC()->cart && wcs_stripe_active() && \WC_Subscriptions_Cart::cart_contains_subscription() ) {
			stripe_wc()->data_api()->print_data( 'wc_stripe_cart_contains_subscription', true );
		}
	}

	private function get_recurring_cart_total() {
		WC()->cart->calculate_totals();
		$carts = WC()->cart->recurring_carts;
		if ( \is_array( $carts ) ) {
			return array_reduce( WC()->cart->recurring_carts, function ( $total, $cart ) {
				return (float) $total + (float) $cart->get_total( 'edit' );
			}, 0 );
		}

		return 0;
	}

}