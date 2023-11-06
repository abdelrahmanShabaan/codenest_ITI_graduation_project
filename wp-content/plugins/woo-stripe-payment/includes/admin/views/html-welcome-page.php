<?php

/**
 *
 */
$user      = wp_get_current_user();
$signed_up = get_option( 'wc_stripe_admin_signup', false );
?>
<div class="wc-stripe-main__page">
    <div class="wc-stripe-main__container">
		<?php include dirname( __FILE__ ) . '/html-main-navigation.php' ?>
        <div class="wc-stripe-welcome__content">
            <div class="wc-stripe-main__row cards-container">
                <div class="wc-stripe-main__card">
                    <a href="<?php echo admin_url( 'admin.php?page=wc-settings&tab=checkout&section=stripe_api' ) ?>">
                        <div class="wc-stripe-main-card__content">
                            <h3><?php esc_html_e( 'Settings', 'woo-stripe-payment' ) ?></h3>
                            <div class="icon-container">
                                <!--<span class="dashicons dashicons-admin-generic"></span>-->
                                <img class="icon" src="<?php echo stripe_wc()->assets_url( 'img/settings.svg' ) ?>"/>
                            </div>
                            <div class="card-header">
                                <p><?php esc_html_e( 'Connect your Stripe account, enable payment methods, and customize the plugin settings to fit your business needs.', 'woo-stripe-payment' ) ?></p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="wc-stripe-main__card">
                    <a target="_blank" href="https://docs.paymentplugins.com/wc-stripe/config">
                        <div class="wc-stripe-main-card__content">
                            <h3><?php esc_html_e( 'Documentation', 'woo-stripe-payment' ) ?></h3>
                            <div class="icon-container documentation">
                                <!--<span class="dashicons dashicons-admin-users"></span>-->
                                <img class="icon" src="<?php echo stripe_wc()->assets_url( 'img/documentation.svg' ) ?>"/>
                            </div>
                            <div class="card-header">
                                <p>
									<?php esc_html_e( 'Want in depth documentation?', 'woo-stripe-payment' ) ?>
                                    <br/>
									<?php esc_html_e( 'Our config guide and API docs are a great place to start.', 'woo-stripe-payment' ) ?>
                                </p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="wc-stripe-main__card">
                    <a href="<?php echo admin_url( 'admin.php?page=wc-stripe-main&section=support' ) ?>">
                        <div class="wc-stripe-main-card__content">
                            <h3><?php esc_html_e( 'Support', 'woo-stripe-payment' ) ?></h3>
                            <div class="icon-container support">
                                <!--<span class="dashicons dashicons-admin-users"></span>-->
                                <img class="icon" src="<?php echo stripe_wc()->assets_url( 'img/support.svg' ) ?>"/>
                            </div>
                            <div class="card-header">
                                <p><?php esc_html_e( 'Have a question?', 'woo-stripe-payment' ) ?>
                                    <br/>
									<?php esc_html_e( 'Our support team is ready to assist you.', 'woo-stripe-payment' ) ?>
                                </p>
                            </div>
                        </div>
                    </a>
                </div>
				<?php if ( $plugins->authorized && ! $plugins->paypal->activated ): ?>
                    <div class="wc-stripe-main__card paypal-card plugin-card-<?php echo $plugins->paypal->slug ?>">
                        <div class="wc-stripe-main-card__content">
                            <h3><?php esc_html_e( 'Payment Plugins for PayPal WooCommerce', 'woo-stripe-payment' ) ?></h3>
                            <div class="icon-container paypal">
                                <!--<span class="dashicons dashicons-admin-users"></span>-->
                                <img class="icon" src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-color.svg"/>
                            </div>
                            <div class="card-header">
                                <p>
									<?php esc_html_e( 'Offering PayPal on your site can increase conversion rates by up to 28%.', 'woo-stripe-payment' ) ?>
                                    <br/>
									<?php esc_html_e( 'Our PayPal plugin is the highest rated available for WooCommerce.', 'woo-stripe-payment' ) ?>
                                </p>
                                <form id="plugin-filter">
                                    <a class="<?php echo $plugins->paypal->installed ? 'activate-now' : 'install-now' ?> button"
                                       href="<?php echo $plugins->paypal->installed ? esc_url( $plugins->paypal->activate_url ) : esc_url( $plugins->paypal->install_url ) ?>" data-slug="<?php echo esc_attr( $slug ) ?>"><?php $plugins->paypal->installed ? esc_html_e( 'Activate',
											'woo-stripe-payment' )
											: esc_html_e( 'Install Now', 'woo-stripe-payment' ) ?></a>
                                </form>
                            </div>
                        </div>
                    </div>
				<?php endif; ?>
            </div>
        </div>
    </div>
</div>
