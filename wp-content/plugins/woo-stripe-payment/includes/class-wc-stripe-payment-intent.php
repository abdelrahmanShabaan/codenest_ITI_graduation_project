<?php

defined( 'ABSPATH' ) || exit();

require_once( WC_STRIPE_PLUGIN_FILE_PATH . 'includes/abstract/abstract-wc-stripe-payment.php' );

/**
 *
 * @since   3.1.0
 *
 * @author  Payment Plugins
 * @package Stripe/Classes
 */
class WC_Stripe_Payment_Intent extends WC_Stripe_Payment {

	private $update_payment_intent = false;

	private $retry_count = 0;

	private $payment_intent_args;

	/**
	 *
	 * {@inheritDoc}
	 *
	 * @see WC_Stripe_Payment::process_payment()
	 */
	public function process_payment( $order ) {
		// first check to see if a payment intent can be used
		if ( ( $intent = $this->can_use_payment_intent( $order ) ) ) {
			if ( $this->can_update_payment_intent( $order, $intent ) ) {
				$intent = $this->gateway->paymentIntents->update( $intent['id'], $this->get_payment_intent_args( $order, false, $intent ) );
			}
		} else {
			$intent = $this->gateway->paymentIntents->create( $this->get_payment_intent_args( $order ) );
		}

		if ( is_wp_error( $intent ) ) {
			if ( $this->should_retry_payment( $intent, $order ) ) {
				return $this->process_payment( $order );
			} else {
				$this->add_payment_failed_note( $order, $intent );

				return $intent;
			}
		}

		// always update the order with the payment intent.
		$order->update_meta_data( WC_Stripe_Constants::PAYMENT_INTENT_ID, $intent->id );
		$order->update_meta_data( WC_Stripe_Constants::PAYMENT_METHOD_TOKEN, is_object( $intent->payment_method ) ? $intent->payment_method->id : $intent->payment_method );
		$order->update_meta_data( WC_Stripe_Constants::MODE, wc_stripe_mode() );
		$order->update_meta_data( WC_Stripe_Constants::PAYMENT_INTENT, WC_Stripe_Utils::sanitize_intent( $intent->toArray() ) );
		$order->save();

		if ( $intent->status === 'requires_confirmation' ) {
			$intent = $this->gateway->paymentIntents->confirm(
				$intent->id,
				apply_filters( 'wc_stripe_payment_intent_confirmation_args', $this->payment_method->get_payment_intent_confirmation_args( $intent, $order ), $intent, $order )
			);
			if ( is_wp_error( $intent ) ) {
				$this->post_payment_process_error_handling( $intent, $order );
				$this->add_payment_failed_note( $order, $intent );

				return $intent;
			}
		}

		// the intent was processed.
		if ( $intent->status === 'succeeded' || $intent->status === 'requires_capture' ) {
			$charge = $intent->charges->data[0];
			if ( isset( $intent->setup_future_usage, $charge->payment_method_details ) && 'off_session' === $intent->setup_future_usage ) {
				if ( ! defined( WC_Stripe_Constants::PROCESSING_ORDER_PAY ) ) {
					$this->payment_method->save_payment_method( is_object( $intent->payment_method ) ? $intent->payment_method->id : $intent->payment_method, $order, $charge->payment_method_details );
				}
			}
			// remove metadata that's no longer needed
			$order->delete_meta_data( WC_Stripe_Constants::PAYMENT_INTENT );

			$this->destroy_session_data();

			return (object) array(
				'complete_payment' => true,
				'charge'           => $charge,
			);
		}
		if ( $intent->status === 'processing' ) {
			$this->destroy_session_data();
			$order->update_status( apply_filters( 'wc_stripe_charge_pending_order_status', 'on-hold', $intent->charges->data[0], $order ) );
			$this->payment_method->save_order_meta( $order, $intent->charges->data[0] );

			return (object) array(
				'complete_payment' => false,
				'redirect'         => $this->payment_method->get_return_url( $order ),
			);
		}
		if ( in_array( $intent->status, array( 'requires_action', 'requires_payment_method', 'requires_source_action', 'requires_source' ), true ) ) {
			/**
			 * Allow 3rd party code to alter the order status of an asynchronous payment method.
			 * The plugin uses the charge.pending event to set the order's status to on-hold.
			 */
			if ( ! $this->payment_method->synchronous ) {
				$status = apply_filters( 'wc_stripe_asynchronous_payment_method_order_status', 'pending', $order, $intent );
				if ( 'pending' !== $status ) {
					$order->update_status( $status );
				}
			}

			return (object) array(
				'complete_payment' => false,
				'redirect'         => $this->payment_method->get_payment_intent_checkout_url( $intent, $order ),
			);
		}
	}

	public function scheduled_subscription_payment( $amount, $order ) {
		$update_subscription = false;
		$subscription        = null;
		$args                = $this->get_payment_intent_args( $order );

		// unset in case 3rd party code adds this attribute.
		unset( $args['setup_future_usage'] );

		$args['confirm']        = true;
		$args['off_session']    = true;
		$args['payment_method'] = trim( $this->payment_method->get_order_meta_data( WC_Stripe_Constants::PAYMENT_METHOD_TOKEN, $order ) );

		if ( ( $customer = $this->payment_method->get_order_meta_data( WC_Stripe_Constants::CUSTOMER_ID, $order ) ) ) {
			$args['customer'] = $customer;
		}

		if ( ( $mandate = $order->get_meta( WC_Stripe_Constants::STRIPE_MANDATE ) ) ) {
			$args['mandate'] = $mandate;
		}

		// if the payment method is empty, check the subscription's parent order to see if that has the payment method
		if ( empty( $args['payment_method'] ) ) {
			$subscription_id = $order->get_meta( '_subscription_renewal' );
			if ( $subscription_id ) {
				$subscription = wcs_get_subscription( absint( $subscription_id ) );
				if ( $subscription ) {
					$parent_order = $subscription->get_parent();
					if ( $parent_order ) {
						$payment_method_id = $parent_order->get_meta( WC_Stripe_Constants::PAYMENT_METHOD_TOKEN );
						if ( $payment_method_id ) {
							// retrieve the payment method
							$payment_method = $this->gateway->mode( $order )->paymentMethods->retrieve( $payment_method_id );
							if ( ! is_wp_error( $payment_method ) ) {
								$args['payment_method'] = $payment_method->id;
								$args['customer']       = $payment_method->customer;
								$update_subscription    = true;
							}
						}
					}
				}
			}
		}

		$retry_mgr = \PaymentPlugins\Stripe\WooCommerceSubscriptions\RetryManager::instance();
		$intent    = $this->gateway->mode( $order )->paymentIntents->create( $args );
		if ( is_wp_error( $intent ) ) {
			if ( $retry_mgr->should_retry( $order, $this->gateway, $intent, $args ) ) {
				return $this->scheduled_subscription_payment( $amount, $order );
			}

			return $intent;
		} else {
			$order->update_meta_data( WC_Stripe_Constants::PAYMENT_INTENT_ID, $intent->id );

			if ( $subscription && $update_subscription ) {
				$subscription->update_meta_data( WC_Stripe_Constants::PAYMENT_METHOD_TOKEN, is_object( $intent->payment_method ) ? $intent->payment_method->id : $intent->payment_method );
				$subscription->update_meta_data( WC_Stripe_Constants::CUSTOMER_ID, $intent->customer );
				$subscription->save();
			}

			$charge = isset( $intent->charges->data[0] ) ? $intent->charges->data[0] : null;

			if ( in_array( $intent->status, array( 'succeeded', 'requires_capture', 'processing' ) ) ) {
				return (object) array(
					'complete_payment' => true,
					'charge'           => $charge,
				);
			} else {
				return (object) array(
					'complete_payment' => false,
					'charge'           => $charge,
				);
			}
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 *
	 * @see WC_Stripe_Payment::process_pre_order_payment()
	 */
	public function process_pre_order_payment( $order ) {
		$args = $this->get_payment_intent_args( $order );

		// unset in case 3rd party code adds this attribute.
		unset( $args['setup_future_usage'] );

		$args['confirm']        = true;
		$args['off_session']    = true;
		$args['payment_method'] = $this->payment_method->get_order_meta_data( WC_Stripe_Constants::PAYMENT_METHOD_TOKEN, $order );

		if ( ( $customer = $this->payment_method->get_order_meta_data( WC_Stripe_Constants::CUSTOMER_ID, $order ) ) ) {
			$args['customer'] = $customer;
		}

		$intent = $this->gateway->paymentIntents->mode( wc_stripe_order_mode( $order ) )->create( $args );

		if ( is_wp_error( $intent ) ) {
			return $intent;
		} else {
			$order->update_meta_data( WC_Stripe_Constants::PAYMENT_INTENT_ID, $intent->id );

			$charge = $intent->charges->data[0];

			if ( in_array( $intent->status, array( 'succeeded', 'requires_capture', 'processing' ) ) ) {
				return (object) array(
					'complete_payment' => true,
					'charge'           => $charge,
				);
			} else {
				return (object) array(
					'complete_payment' => false,
					'charge'           => $charge,
				);
			}
		}
	}

	/**
	 * Compares the order's saved intent to the order's attributes.
	 * If there is a delta, then the payment intent can be updated. The intent should
	 * only be updated if this is the checkout page.
	 *
	 * @param WC_Order $order
	 */
	public function can_update_payment_intent( $order, $intent = null ) {
		$result = true;
		if ( ! $this->update_payment_intent && ( defined( WC_Stripe_Constants::WOOCOMMERCE_STRIPE_ORDER_PAY ) || ! is_checkout() || defined( WC_Stripe_Constants::REDIRECT_HANDLER ) || defined( WC_Stripe_Constants::PROCESSING_PAYMENT ) ) ) {
			$result = false;
		} else {
			$intent = ! $intent ? $order->get_meta( WC_Stripe_Constants::PAYMENT_INTENT ) : $intent;
			if ( $intent ) {
				$order_hash  = implode(
					'_',
					array(
						wc_stripe_add_number_precision( $order->get_total(), $order->get_currency() ),
						strtolower( $order->get_currency() ),
						$this->get_payment_method_charge_type(),
						wc_stripe_get_customer_id( $order->get_user_id() ),
						$this->payment_method->get_payment_method_from_request()
					)
				);
				$intent_hash = implode(
					'_',
					array(
						$intent['amount'],
						$intent['currency'],
						$intent['capture_method'],
						$intent['customer'],
						isset( $intent['payment_method']['id'] ) ? $intent['payment_method']['id'] : ''
					)
				);
				$result      = $order_hash !== $intent_hash || ! in_array( $this->payment_method->get_payment_method_type(), $intent['payment_method_types'] );
			}
		}

		return apply_filters( 'wc_stripe_can_update_payment_intent', $result, $intent, $order );;
	}

	/**
	 *
	 * @param WC_Order $order
	 */
	public function get_payment_intent_args( $order, $new = true, $intent = null ) {
		$this->add_general_order_args( $args, $order );
		$this->add_level3_order_data( $args, $order );

		$args['capture_method'] = $this->get_payment_method_charge_type();
		if ( ( $statement_descriptor = stripe_wc()->advanced_settings->get_option( 'statement_descriptor' ) ) ) {
			$args['statement_descriptor'] = WC_Stripe_Utils::sanitize_statement_descriptor( $statement_descriptor );
		}
		if ( $new ) {
			$args['confirmation_method'] = $this->payment_method->get_confirmation_method( $order );
			$args['confirm']             = false;
		} else {
			if ( $intent && $intent['status'] === 'requires_action' ) {
				unset( $args['capture_method'] );
			}
			if ( isset( $intent['payment_method']['type'] ) && $intent['payment_method']['type'] === 'link' ) {
				/**
				 * Unset the payment method so it's not updated by Stripe. We don't want to update the payment method
				 * if it exists because it already contains the Link mandate.
				 */
				unset( $args['payment_method'] );
			}
			if ( $intent && $intent->status === 'requires_action' ) {
				/**
				 * The statement_descriptor can't be updated when the intent's status is requires_action
				 */
				unset( $args['statement_descriptor'] );
			}
		}

		if ( stripe_wc()->advanced_settings->is_email_receipt_enabled() && ( $email = $order->get_billing_email() ) ) {
			$args['receipt_email'] = $email;
		}

		if ( ( $customer_id = wc_stripe_get_customer_id( $order->get_customer_id() ) ) ) {
			$args['customer'] = $customer_id;
		}

		if ( $this->payment_method->should_save_payment_method( $order )
		     || ( $this->payment_method->supports( 'add_payment_method' )
		          && apply_filters( 'wc_stripe_force_save_payment_method',
					false,
					$order,
					$this->payment_method ) )
		) {
			$args['setup_future_usage'] = 'off_session';
		}

		$args['payment_method_types'][] = $this->payment_method->get_payment_method_type();

		// if there is a payment method attached already, then ensure the payment_method_type
		// associated with that attached payment_method is included.
		if ( $intent && ! empty( $intent->payment_method ) && \is_array( $intent->payment_method_types ) ) {
			$args['payment_method_types'] = array_values( array_unique( array_merge( $args['payment_method_types'], $intent->payment_method_types ) ) );
		}

		$this->payment_method->add_stripe_order_args( $args, $order );

		/**
		 * @param array                    $args
		 * @param WC_Order                 $order
		 * @param WC_Stripe_Payment_Intent $this
		 */
		$this->payment_intent_args = apply_filters( 'wc_stripe_payment_intent_args', $args, $order, $this );

		return $this->payment_intent_args;
	}

	/**
	 * @param float         $amount
	 * @param WC_Order      $order
	 * @param Stripe\Charge $charge
	 *
	 * @return mixed|\Stripe\Charge|\Stripe\PaymentIntent|\Stripe\StripeObject
	 * @throws \Stripe\Exception\ApiErrorException
	 */
	public function capture_charge( $amount, $order, $charge = null ) {
		$payment_intent = $this->payment_method->get_order_meta_data( WC_Stripe_Constants::PAYMENT_INTENT_ID, $order );
		if ( empty( $payment_intent ) && $charge ) {
			$payment_intent = $charge->payment_intent;
			$order->update_meta_data( WC_Stripe_Constants::PAYMENT_INTENT_ID, $payment_intent );
			$order->save();
		}
		$args = array( 'amount_to_capture' => wc_stripe_add_number_precision( $amount, $order->get_currency() ) );

		// Link does not currently support level3
		if ( $charge && isset( $charge->payment_method_details->type ) && $charge->payment_method_details->type !== 'link' ) {
			$this->add_level3_order_data( $args, $order, true );
		}
		$params = apply_filters( 'wc_stripe_payment_intent_capture_args', $args, $amount, $order );

		$result = $this->gateway->mode( wc_stripe_order_mode( $order ) )->paymentIntents->capture( $payment_intent, $params );
		if ( ! is_wp_error( $result ) ) {
			return $result->charges->data[0];
		}

		return $result;
	}

	/**
	 *
	 * {@inheritDoc}
	 *
	 * @see WC_Stripe_Payment::void_charge()
	 */
	public function void_charge( $order ) {
		// fetch the intent and check its status
		$payment_intent = $this->gateway->paymentIntents->mode( wc_stripe_order_mode( $order ) )->retrieve( $order->get_meta( WC_Stripe_Constants::PAYMENT_INTENT_ID ) );
		if ( is_wp_error( $payment_intent ) ) {
			return $payment_intent;
		}
		$statuses = array( 'requires_payment_method', 'requires_capture', 'requires_confirmation', 'requires_action' );
		if ( 'canceled' !== $payment_intent->status ) {
			if ( in_array( $payment_intent->status, $statuses ) ) {
				return $this->gateway->paymentIntents->mode( wc_stripe_order_mode( $order ) )->cancel( $payment_intent->id );
			} elseif ( 'succeeded' === $payment_intent->status ) {
				return $this->process_refund( $order, $order->get_total() - $order->get_total_refunded() );
			}
		}
	}

	/**
	 *
	 * {@inheritDoc}
	 *
	 * @see WC_Stripe_Payment::get_payment_method_from_charge()
	 */
	public function get_payment_method_from_charge( $charge ) {
		return $charge->payment_method;
	}

	/**
	 *
	 * {@inheritDoc}
	 *
	 * @see WC_Stripe_Payment::add_order_payment_method()
	 */
	public function add_order_payment_method( &$args, $order ) {
		$args['payment_method'] = $this->payment_method->get_payment_method_from_request();
		if ( empty( $args['payment_method'] ) ) {
			unset( $args['payment_method'] );
		}
	}

	/**
	 *
	 * @param WC_Order $order
	 */
	public function can_use_payment_intent( $order ) {
		$intent         = $order->get_meta( WC_Stripe_Constants::PAYMENT_INTENT );
		$session_intent = (array) WC_Stripe_Utils::get_payment_intent_from_session();
		if ( $session_intent ) {
			if ( ! $intent || $session_intent['id'] !== $intent['id'] ) {
				$intent = $session_intent;
			}
		}
		$intent = $intent ? $this->gateway->paymentIntents->retrieve( $intent['id'], apply_filters( 'wc_stripe_payment_intent_retrieve_args', array( 'expand' => array( 'payment_method' ) ), $order, $intent['id'] ) ) : false;
		if ( $intent && ! is_wp_error( $intent ) ) {
			// If an intent is cancelled, then it's likely that it timed out and can't be used.
			if ( $intent->status === 'canceled' ) {
				$intent = false;
			} else {
				if ( \in_array( $intent->status, array( 'succeeded', 'requires_capture', 'processing' ) ) && ! defined( WC_Stripe_Constants::REDIRECT_HANDLER ) ) {
					/**
					 * If the status is succeeded, and the order ID on the intent doesn't match this checkout's order ID, we know this is
					 * a previously processed intent and so should not be used.
					 */
					if ( isset( $intent->metadata['order_id'] ) && $intent->metadata['order_id'] != $order->get_id() ) {
						$intent = false;
					}
				} elseif ( $intent['confirmation_method'] != $this->payment_method->get_confirmation_method( $order ) ) {
					$intent = false;
				}
			}

			// compare the active environment to the order's environment
			$mode = wc_stripe_order_mode( $order );
			if ( $mode && $mode !== wc_stripe_mode() ) {
				$intent = false;
			}
		} else {
			$intent = false;
		}

		return $intent;
	}

	/**
	 *
	 * {@inheritDoc}
	 *
	 * @see WC_Stripe_Payment::can_void_charge()
	 */
	public function can_void_order( $order ) {
		return $order->get_meta( WC_Stripe_Constants::PAYMENT_INTENT_ID );
	}

	public function set_update_payment_intent( $bool ) {
		$this->update_payment_intent = $bool;
	}

	public function destroy_session_data() {
		WC_Stripe_Utils::delete_payment_intent_to_session();
	}

	/**
	 * @param \WP_Error $error
	 * @param \WC_Order $order
	 */
	public function should_retry_payment( $error, $order ) {
		$result      = false;
		$data        = $error->get_error_data();
		$delete_data = function () use ( $order ) {
			WC_Stripe_Utils::delete_payment_intent_to_session();
			$order->delete_meta_data( WC_Stripe_Constants::PAYMENT_INTENT );
		};
		/**
		 * @since 3.3.40
		 * Merchants sometimes change the Stripe account that the plugin is connected to. This results in
		 * API errors because the customer ID doesn't exist in the new Stripe account. Create a customer ID
		 * to avoid this error.
		 * @return void
		 */
		$create_customer      = function () use ( $order ) {
			if ( $order->get_customer_id() ) {
				$mode     = wc_stripe_order_mode( $order );
				$response = WC_Stripe_Customer_Manager::instance()->create_customer( new WC_Customer( $order->get_customer_id() ), $mode );
				if ( ! is_wp_error( $response ) ) {
					wc_stripe_save_customer( $response->id, $order->get_customer_id(), $mode );
					wc_stripe_log_info( sprintf( 'Customer ID %1$s does not exist in Stripe account %2$s. New customer ID %3$s created for user ID %4$s.',
						$this->payment_intent_args['customer'],
						stripe_wc()->account_settings->get_account_id( $mode ),
						$response->id,
						$order->get_customer_id()
					) );
				}
			}
		};
		$delete_payment_token = function () use ( $order ) {
			// remove the payment method that no longer exist.
			if ( $order->get_customer_id() ) {
				$token = $this->payment_method->get_token( $this->payment_intent_args['payment_method'], $order->get_customer_id() );
				if ( $token ) {
					$token->delete();
					wc_stripe_log_info( sprintf( 'Order ID: %1$s. Customer attempted to use saved payment method %2$s but it does not exist in Stripe account %3$s. The payment method has been removed from the WooCommerce database.',
						$order->get_id(),
						$token->get_token(),
						stripe_wc()->account_settings->get_account_id( wc_stripe_order_mode( $order ) )
					) );
					if ( wp_doing_ajax() && WC()->session ) {
						// trigger a page re-load so the page refreshes and the updated list of payment methods are rendered.
						WC()->session->reload_checkout = true;
					}
				}
			}
		};

		$remove_level3_data = function () {
			add_filter( 'wc_stripe_payment_intent_args', function ( $args ) {
				unset( $args['level3'] );

				return $args;
			}, 1000 );
		};

		if ( $this->retry_count < 1 ) {
			// $data can be an exception, so validate that it's an array.
			if ( $data && is_array( $data ) ) {
				if ( isset( $data['payment_intent'] ) ) {
					if ( isset( $data['payment_intent']['status'] ) ) {
						$result = in_array( $data['payment_intent']['status'], array( 'succeeded', 'requires_capture' ), true );
						if ( $result ) {
							$delete_data();
						}
					}
				} elseif ( isset( $data['code'] ) ) {
					if ( $data['code'] === 'resource_missing' ) {
						if ( $data['param'] === 'customer' ) {
							$create_customer();
						} elseif ( $data['param'] === 'payment_method' ) {
							$delete_payment_token();

							return false;
						} else {
							$delete_data();
						}
						$result = true;
					} elseif ( $data['code'] === 'parameter_unknown' ) {
						if ( $data['param'] === 'level3' ) {
							$result = true;
							$remove_level3_data();
						}
					}
				} elseif ( isset( $data['param'] ) && strpos( $data['param'], 'level3' ) !== false ) {
					$result = true;
					$remove_level3_data();
				}
			}
			if ( $result ) {
				$this->retry_count += 1;
			}
		}

		return $result;
	}

	/**
	 * @param \WP_Error $error
	 * @param \WC_Order $order
	 */
	public function post_payment_process_error_handling( $error, $order ) {
		$data = $error->get_error_data();
		if ( isset( $data['payment_intent'] ) ) {
			WC_Stripe_Utils::save_payment_intent_to_session( $data['payment_intent'], $order );
		}
	}

	/**
	 * @param array     $args
	 * @param \WC_Order $order
	 *
	 * @return void
	 */
	protected function add_level3_order_data( &$args, $order, $capture = false ) {
		if ( $this->payment_method->get_payment_method_type() === 'card'
		     && stripe_wc()->account_settings->get_account_country( wc_stripe_order_mode( $order ) ) === 'US'
		     && stripe_wc()->account_settings->has_completed_connect_process( wc_stripe_order_mode( $order ) )
		) {
			$args['level3'] = array(
				'merchant_reference' => $order->get_id(),
				'shipping_amount'    => wc_stripe_add_number_precision( (float) $order->get_shipping_total() + (float) $order->get_shipping_tax(), $order->get_currency() )
			);
			if ( $order->get_shipping_country() === 'US' ) {
				$shipping_address_zip = $order->get_shipping_postcode();
				if ( \WC_Validation::is_postcode( $shipping_address_zip, 'US' ) ) {
					$args['level3']['shipping_address_zip'] = $shipping_address_zip;
				}
			}
			if ( WC()->countries->get_base_country() === 'US' ) {
				$shipping_from_zip = get_option( 'woocommerce_store_postcode' );
				if ( \WC_Validation::is_postcode( $shipping_from_zip, 'US' ) ) {
					$args['level3']['shipping_from_zip'] = $shipping_from_zip;
				}
			}
			$currency = $order->get_currency();
			$totals   = (object) array( 'subtotal' => 0, 'tax' => 0, 'discount' => 0, 'shipping_amount' => $args['level3']['shipping_amount'] );

			foreach ( $order->get_items( [ 'line_item', 'fee' ] ) as $item ) {
				$line_item  = new stdClass();
				$item_total = 0;

				if ( $item instanceof \WC_Order_Item_Product ) {
					$product_code            = $item->get_variation_id() ? $item->get_variation_id() : $item->get_product_id();
					$line_item->product_code = substr( (string) $product_code, 0, 12 );
					/**
					 * We want the subtotal here because that's the item's value before things like discounts are removed.
					 * The subtotal does not include tax.
					 */
					$item_total = $item->get_subtotal();
				} elseif ( $item instanceof \WC_Order_Item_Fee ) {
					$line_item->product_code = substr( sanitize_title( $item->get_name() ), 0, 12 );
					$item_total              = $item->get_total();
				}
				$line_item->product_description = substr( $item->get_name(), 0, 26 );
				$line_item->unit_cost           = wc_stripe_add_number_precision( (float) $item_total / (float) $item->get_quantity(), $currency );
				$line_item->quantity            = round( $item->get_quantity() );
				$line_item->tax_amount          = wc_stripe_add_number_precision( $item->get_total_tax(), $currency );
				$line_item->discount_amount     = wc_stripe_add_number_precision( (float) $item_total - (float) $item->get_total(), $currency );

				$totals->subtotal += $line_item->unit_cost * $line_item->quantity;
				$totals->tax      += $line_item->tax_amount;
				$totals->discount += $line_item->discount_amount;

				$args['level3']['line_items'][] = (array) $line_item;
			}

			/**
			 * perform a validation of the line_items to make sure their totals equal the order total.
			 * total amount = sum(unit_cost * quantity) + sum(tax_amount) - sum(discount_amount) + shipping_amount
			 */
			$diff = ( ! $capture ? $args['amount'] : $args['amount_to_capture'] ) - ( $totals->subtotal + $totals->tax - $totals->discount + $totals->shipping_amount );

			if ( abs( $diff ) >= 1 ) {
				$line_item = array(
					'product_code'        => ! $capture ? 'conversion' : 'capture_diff',
					'product_description' => ! $capture ? 'Conversion' : 'Capture Difference',
					'quantity'            => 1,
					'tax_amount'          => 0
				);
				if ( $diff > 0 ) {
					// order amount is greater, so add a positive unit_cost to line_item
					$line_item['unit_cost']       = $diff;
					$line_item['discount_amount'] = 0;
				} else {
					// order amount is less than totals, so add a discount_amount to line_item
					$line_item['unit_cost']       = 0;
					$line_item['discount_amount'] = abs( $diff );
				}
				$args['level3']['line_items'][] = $line_item;
			}
		}
		// line_items is a required property so if there are none, then unset level3.
		if ( empty( $args['level3']['line_items'] ) ) {
			unset( $args['level3'] );
		}

		return $args;
	}

}
