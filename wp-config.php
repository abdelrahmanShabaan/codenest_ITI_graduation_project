<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'codenest' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'VZ~l47Wa117%NpO)(LneD9RIUtx A-@PHDRaNBz&u;VZ,tw^?j-neS;V_%hc~j ~' );
define( 'SECURE_AUTH_KEY',  'rtt2jy|.$l-|v^/<gjaAP>k]DY{e.f`Rr$gAgf<aS#$LV8S0_t mq,_*RxZ*{l-o' );
define( 'LOGGED_IN_KEY',    '7xokH|.<0aj8!ZOmcINF/m+jfl;UcGHMJa@GdII@|5c^:F1xRrio8k+(%edHp]zF' );
define( 'NONCE_KEY',        '`UfGSQ>!ynAk_5k9bJ{CIBoS@l]Fr<)SZB{No%`D<6tJp)k%pf^q$I|hPt/.;K<z' );
define( 'AUTH_SALT',        'i^xE A@qmJQ4t%hu<LJqa>Fo#GOf$S{|V]5qX-uYS.Nv/++Z!&9zV5>3YD{PGa2(' );
define( 'SECURE_AUTH_SALT', 'DTc@](#S>:dmU.nII@1K|o>m=EKZ.s9u7|y~iX;GS8OC1]a(*ToPQ^%eWIJ[J%7g' );
define( 'LOGGED_IN_SALT',   '3s/`!_QJ?Q~R!cOfi_GaI%9nR[ a{DS=4;!ghjvbBg%hT6:L.D,>+@<1.3JFHMKm' );
define( 'NONCE_SALT',       '#y:z8]8/zAsIaO^r?&LyvS}!N;O{)Ofb(GLH1nxzaMmNx[|SuG@Cf(v.Z,q|<6T@' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'ITI_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
