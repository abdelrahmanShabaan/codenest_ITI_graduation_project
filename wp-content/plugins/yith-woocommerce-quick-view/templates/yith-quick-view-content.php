<?php
/**
 * Quick view content.
 *
 * @author  YITH <plugins@yithemes.com>
 * @package YITH WooCommerce Quick View
 * @version 1.0.0
 */

defined( 'YITH_WCQV' ) || exit; // Exit if accessed directly.

while ( have_posts() ) :
	the_post();
	?>

	<div class="product">

		<div id="product-<?php the_ID(); ?>" <?php post_class( 'product' ); ?>>

			<?php do_action( 'yith_wcqv_product_image' ); ?>

			<div class="summary entry-summary">
				<div class="summary-content">
					<?php do_action( 'yith_wcqv_product_summary' ); ?>
				</div>
			</div>

		</div>

	</div>
	<?php
endwhile; // end of the loop.
