<div class="crisp-wrap">
  <div class="crisp-logo"></div>
  <div class="crisp-actions">
    <?php
    if (isset($_GET["crisp_website_id"])) {
    ?>
    <h2 class="crisp-title" data-icon="success"><?php _e("Crisp is now added to your site!", "crisp"); ?></h2>

    <p class="crisp-subtitle"><?php _e("We automatically added Crisp on your site. You can browse on your homepage. You should see Crisp 🎉", "crisp"); ?></p>
    <?php
    } else {
    ?>
    <h2 class="crisp-title"><?php _e("Welcome to your Crisp Integration", "crisp"); ?></h2>

    <p class="crisp-subtitle"><?php _e("Crisp is currently added to your site and you can receive chat requests from your website visitors.", "crisp"); ?></p>
    <?php
    }
    ?>

    <a class="crisp-button crisp-button-blue u-mb20" href="<?php echo esc_url("https://app.crisp.chat/website/" . $website_id) ?>/inbox/" target="_blank">💬 <?php _e("Open Crisp Inbox", "crisp"); ?></a>

    <a class="crisp-button crisp-button-grey u-mb20" href="<?php echo esc_url("https://app.crisp.chat/settings/website/" . $website_id) ?>/" target="_blank">⚙️ <?php _e("Edit Settings", "crisp"); ?></a>

    <a class="crisp-button crisp-button-grey u-mb20" href="<?php echo esc_url($add_to_crisp_link); ?>">🪄 <?php _e("Relink Crisp with my WordPress", "crisp"); ?></a>

    <p class="crisp-notice"><?php _e("Loving Crisp <b style='color:red'>♥</b> ? Rate us on the <a target='_blank' href='https://wordpress.org/support/plugin/crisp/reviews/?filter=5'>WordPress Plugin Directory</a>", "crisp"); ?></p>
  </div>

  <div class="crisp-side">
    <div class="crisp-side-illustration"></div>

    <?php
    if (isset($_GET["crisp_website_id"])) {
    ?>
      <div class="pyro">
        <div class="before"></div>
        <div class="after"></div>
      </div>
    <?php
    }
    ?>


  </div>
</div>