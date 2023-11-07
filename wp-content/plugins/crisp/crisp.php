<?php
/**
 * Plugin Name: Crisp
 * Plugin URI: http://wordpress.org/plugins/crisp/
 * Description: Crisp is a Livechat plugin
 * Author: Crisp
 * Version: 0.43
 * Author URI: https://crisp.chat
 * Text Domain: crisp
*/

require_once( ABSPATH . 'wp-admin/includes/plugin.php' );

// Notice: if the woocommerce plugin is installed, deactivate the Crisp WP \
//        plugin to prevent any duplicate widgets and Crisp settings menu.
add_action(
  'plugins_loaded',
  function () {
    if (defined("WP_CRISP_WOOCOMMERCE")) {
      register_deactivation_hook( __FILE__ ,  function() {
        delete_option("website_id");
        delete_option("crisp_onboarding");
        delete_option("website_verify");
      });

      deactivate_plugins(plugin_basename(__FILE__));

      return;
    } else {
      add_action("admin_menu", "crisp_create_menu");
      add_action("wp_enqueue_scripts", "crisp_enqueue_script");
      add_action("script_loader_tag", "crisp_enqueue_async", 10, 2);
    }
  }
);

function crisp_create_menu() {
  add_menu_page(
    __("Crisp Settings", "crisp"),
    __("Crisp Settings", "crisp"),
    "administrator", __FILE__,
    "crisp_plugin_settings_page" ,
    plugins_url("/assets/images/icon-favicon.svg", __FILE__)
  );

  add_action("admin_init", "register_crisp_plugin_settings" );
  add_action("admin_init", "register_crisp_plugin_onboarding");
  add_action("admin_notices", "register_crisp_plugin_notice");
  add_action("admin_enqueue_scripts", "register_crisp_admin_enqueue");
  add_action("plugins_loaded", "register_crisp_plugin_textdomain" );
}

function register_crisp_plugin_textdomain() {
  load_plugin_textdomain("crisp", FALSE, basename( dirname( __FILE__ ) ) . "/languages/" );
}

function register_crisp_plugin_onboarding() {
  $onboarding = get_option("crisp_onboarding");
  $website_id = get_option("website_id");

  if (empty($website_id) && (empty($onboarding) || !$onboarding)) {
    update_option("crisp_onboarding", true);
    wp_redirect(admin_url("admin.php?page=".plugin_basename(__FILE__)));
  }
}

function register_crisp_plugin_notice() {
  $website_id = get_option("website_id");

  if (empty($website_id) && (!isset($_GET["page"]) || $_GET["page"] != plugin_basename(__FILE__))) {
    $admin_url = admin_url("admin.php?page=".plugin_basename(__FILE__));
    ?>
      <div class="notice notice-warning is-dismissible notice-crisp">
        <p>
          <img src="<?php echo plugins_url("/assets/images/icon-favicon.svg", __FILE__); ?>" height="16" style="margin-bottom: -3px" />
          &nbsp;
          <?php
            echo sprintf(
              esc_html(__('The Crisp plugin isn’t connected right now. To display Crisp widget on your WordPress site, %1$sconnect the plugin now%2$s. The configuration only takes 1 minute!', "crisp") ),
              "<a href='$admin_url'>",
              "</a>"
            );
          ?>
        </p>
      </div>
    <?php
  }
}

function register_crisp_plugin_settings() {
  register_setting( "crisp-plugin-settings-group", "website_id" );
  add_option("crisp_onboarding", false);
}

function register_crisp_admin_enqueue() {
  wp_enqueue_style("admin_crisp_style", plugins_url("/assets/stylesheets/style.css", __FILE__));
}

function crisp_plugin_settings_page() {
  add_action("admin_enqueue_scripts", "crisp_admin_enqueue");

  if (current_user_can("administrator")) {
    if( wp_verify_nonce($_GET['_wpnonce'])) {
      if (isset($_GET["crisp_website_id"]) && !empty($_GET["crisp_website_id"])) {
        update_option("website_id", sanitize_text_field($_GET["crisp_website_id"]));

        // Clear WP Rocket Cache if needed
        if (function_exists("rocket_clean_domain")) {
          rocket_clean_domain();
        }

        // Clear WP Super Cache if needed
        if (function_exists("wp_cache_clean_cache")) {
          global $file_prefix;
          wp_cache_clean_cache($file_prefix, true);
        }
      }

      if (isset($_GET["crisp_verify"]) && !empty($_GET["crisp_verify"])) {
        update_option("website_verify", sanitize_key($_GET["crisp_verify"]));
      }
    }
  }

  $website_id = get_option("website_id");
  $is_crisp_working = isset($website_id) && !empty($website_id);
  $http_callback = "http" . (($_SERVER["SERVER_PORT"] == 443) ? "s://" : "://") . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"];
  $http_callback = urlencode(wp_nonce_url($http_callback));
  $admin_email = wp_get_current_user()->user_email;
  $admin_name = wp_get_current_user()->display_name;
  $website_name = get_bloginfo("name");
  $website_domain = get_site_url();
  $website_domain = str_replace("http://", "", $website_domain);
  $website_domain = str_replace("https://", "", $website_domain);
  $website_domain = preg_replace("(:[0-9]{1,6})", "", $website_domain);

  $add_to_crisp_link = esc_url_raw("https://app.crisp.chat/initiate/plugin/aca0046c-356c-428f-8eeb-063014c6a278?payload=$http_callback&user_email=$admin_email&user_name=$admin_name&website_name=$website_name&website_domain=$website_domain");

  if ($is_crisp_working) {
    include_once(plugin_dir_path( __FILE__ ) . "views/settings_installed.php");
  } else {
    include_once(plugin_dir_path( __FILE__ ) . "views/settings_install.php");
  }
}

function crisp_sync_wordpress_user() {
  $output = "";


  if (is_user_logged_in()) {
    $current_user = wp_get_current_user();
  }

  if (!isset($current_user)) {
    return "";
  }

  $website_verify = get_option("website_verify");

  $email = $current_user->user_email;
  $nickname = $current_user->display_name;

  if (!empty($email) && empty($website_verify)) {
    $output .= "\$crisp.push(['set', 'user:email', '" . $email . "']);";
  } else if (!empty($email)) {
    $hmac = hash_hmac("sha256", $email, $website_verify);
    $output .= "\$crisp.push(['set', 'user:email', ['" . $email . "', '" . $hmac . "']]);";
  }

  if (!empty($nickname)) {
    $output .= "\$crisp.push(['set', 'user:nickname', '" . $nickname . "']);";
  }

  return $output;
}

function crisp_sync_woocommerce_customer() {
  $output = "";
  if (!class_exists("WooCommerce") || is_admin()) {
    return $output;
  }

  if (WC()->session == NULL) {
    return $output;
  }

  $customer = WC()->session->get("customer");

  if ($customer == NULL) {
    return $output;
  }

  if (isset($customer["phone"]) && !empty($customer["phone"])) {
    $output .= "\$crisp.push(['set', 'user:phone', '" . $customer["phone"] . "']);";
  }

  $nickname = "";

  if (isset($customer["first_name"]) && !empty($customer["first_name"])) {
    $nickname = $customer["first_name"];
  }
  if (isset($customer["last_name"]) && !empty($customer["last_name"])) {
    $nickname .= " ".$customer["last_name"];
  }

  if (!empty($nickname)) {
    $output .= "\$crisp.push(['set', 'user:nickname', '" . $nickname . "']);";
  }

  $data = array();
  $data_keys = array(
    "company",
    "address",
    "address_1",
    "address_2",
    "postcode",
    "state",
    "country",
    "shipping_company",
    "shipping_address",
    "shipping_address_1",
    "shipping_address_2",
    "shipping_state",
    "shipping_country",
  );

  foreach ($data_keys as $key) {
    if (isset($customer[$key]) && !empty($customer[$key])) {
      $data[] = "['". $key . "', '" . $customer[$key] . "']";
    }
  }

  if (count($data) > 0) {
    $output .= "\$crisp.push(['set', 'session:data', [[" . implode(",", $data) . "]]]);";
  }

  return $output;
}

function crisp_enqueue_script() {
  $website_id = get_option("website_id");
  $locale = str_replace("_", "-", strtolower(get_locale()));
  $locale = preg_replace("/([a-z]{2}-[a-z]{2})(-.*)/", "$1", $locale);

  if (!isset($website_id) || empty($website_id)) {
    return;
  }

  $output="
    window.\$crisp=[];
    if (!window.CRISP_RUNTIME_CONFIG) {
      window.CRISP_RUNTIME_CONFIG = {}
    }

    if (!window.CRISP_RUNTIME_CONFIG.locale) {
      window.CRISP_RUNTIME_CONFIG.locale = '$locale'
    }

    CRISP_WEBSITE_ID = '$website_id';";

  $output .= crisp_sync_wordpress_user();
  $output .= crisp_sync_woocommerce_customer();

  wp_enqueue_script("crisp", "https://client.crisp.chat/l.js", array(), "", true);
  wp_add_inline_script("crisp", $output, "before");
}

function crisp_enqueue_async($tag, $handle) {
  if ("crisp" !== $handle ) {
    return $tag;
  }

  return str_replace("src", " async src", $tag );
}