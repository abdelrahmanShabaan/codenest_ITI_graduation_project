<?php
/**
 * @version 3.3.42
 */

?>
<div class="wc-stripe-save-source"
     <?php if ( ! is_user_logged_in() && ! WC()->checkout()->is_registration_required() ): ?>style="display:none"<?php endif ?>>
    <label class="checkbox">
        <input type="checkbox" id="<?php echo $gateway->save_source_key ?>" name="<?php echo $gateway->save_source_key ?>" value="yes"/>
        <span class="save-source-checkbox"></span>
    </label>
    <label class="save-source-label"><?php echo esc_html( $gateway->get_save_payment_method_label() ) ?></label>
</div>
