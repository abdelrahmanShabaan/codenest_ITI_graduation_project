<?php
/**
 * @var WC_Payment_Gateway_Stripe_CC $gateway
 * @version 3.3.42
 *
 */

?>
<?php if ( $gateway->is_custom_form_active() ): ?>
    <div id="wc-stripe-cc-custom-form">
		<?php wc_stripe_get_template( $gateway->get_custom_form_template(), [ 'gateway' => $gateway ] ) ?>
    </div>
<?php else: ?>
    <div id="wc-stripe-card-element" class="<?php echo $gateway->get_option( 'form_type' ) ?>-type"></div>
<?php endif; ?>
<?php if ( $gateway->show_save_payment_method_html() ): ?>
	<?php wc_stripe_get_template( 'save-payment-method.php', array( 'gateway' => $gateway ) ) ?>
<?php endif; ?>