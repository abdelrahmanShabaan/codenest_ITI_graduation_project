<?php


namespace PaymentPlugins\WooCommerce\PPCP;


class Logger {

	private $log;

	private $source;

	/**
	 * Logger constructor.
	 *
	 * @param string $source
	 */
	public function __construct( $source ) {
		$this->source = $source;
	}

	protected function get_source() {
		return $this->source;
	}

	public function log( $lvl, $msg ) {
		if ( ! $this->log ) {
			$this->log = wc_get_logger();
		}
		$this->log->log( $lvl, $msg, [ 'source' => $this->get_source() ] );
	}

	public function info( $msg ) {
		$this->log( \WC_Log_Levels::INFO, $msg );
	}

	public function error( $msg ) {
		$this->log( \WC_Log_Levels::ERROR, $msg );
	}

	public function warning( $msg ) {
		$this->log( \WC_Log_Levels::WARNING, $msg );
	}

}