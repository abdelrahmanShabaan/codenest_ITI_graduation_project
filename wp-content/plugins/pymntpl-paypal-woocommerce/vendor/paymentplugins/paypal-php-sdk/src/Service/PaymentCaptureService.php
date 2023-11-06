<?php


namespace PaymentPlugins\PayPalSDK\Service;


use PaymentPlugins\PayPalSDK\Payment;
use PaymentPlugins\PayPalSDK\Refund;

class PaymentCaptureService extends BaseService {

	protected $path = 'v2/payments';

	public function retrieve( $id, $options = null ) {
		return $this->get( $this->buildPath( '/captures/%s', $id ), Payment::class, null, $options );
	}

	public function refund( $id, $params = [], $options = null ) {
		return $this->post( $this->buildPath( '/captures/%s/refund', $id ), Refund::class, $params, $options );
	}

}