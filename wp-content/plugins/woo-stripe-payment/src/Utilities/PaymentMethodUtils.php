<?php

namespace PaymentPlugins\Stripe\Utilities;

class PaymentMethodUtils {

	/**
	 * Sort the payment tokens by the default.
	 *
	 * @param $tokens
	 *
	 * @return mixed
	 */
	public static function sort_by_default( $tokens ) {
		if ( \is_array( $tokens ) ) {
			usort( $tokens, function ( $a ) {
				if ( \is_object( $a ) && method_exists( $a, 'is_default' ) ) {
					return $a->is_default() ? - 1 : 1;
				}

				return - 1;
			} );
		}

		return $tokens;
	}

	/**
	 * @param $tokens
	 *
	 * @since 3.3.51
	 * @return array|mixed
	 */
	public static function filter_by_type( $tokens ) {
		if ( \is_array( $tokens ) ) {
			return \array_filter( $tokens, function ( $token ) {
				return $token instanceof \WC_Payment_Token_Stripe;
			} );
		}

		return $tokens;
	}

	/**
	 * @param                            $token_id
	 * @param                            $user_id
	 * @param \WC_Payment_Gateway_Stripe $gateway
	 *
	 * @since 3.3.51
	 * @return bool
	 */
	public static function token_exists( $token_id, $user_id, $gateway = null ) {
		global $wpdb;
		$where = [
			$wpdb->prepare( 'token = %s', $token_id ),
			$wpdb->prepare( 'user_id = %d', $user_id )
		];
		if ( $gateway ) {
			$where[] = $wpdb->prepare( 'gateway_id = %s', $gateway->id );
			if ( method_exists( $gateway, 'get_payment_token_type' ) ) {
				$where[] = $wpdb->prepare( 'type = %s', $gateway->get_payment_token_type() );
			}
		} else {
			$where[] = $wpdb->prepare( 'gateway_id LIKE %s', '%stripe_%' );
		}

		$where_clause = ' WHERE ' . implode( ' AND ', $where );

		$count = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}woocommerce_payment_tokens {$where_clause}" );

		return absint( $count ) > 0;
	}

}