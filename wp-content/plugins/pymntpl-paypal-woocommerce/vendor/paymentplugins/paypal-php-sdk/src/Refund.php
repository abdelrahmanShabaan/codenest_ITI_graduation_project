<?php


namespace PaymentPlugins\PayPalSDK;

/**
 * Class Refund
 *
 * @package PaymentPlugins\PayPalSDK
 *
 * @property string                                           $id
 * @property Amount                                           $amount
 * @property string                                           $invoice_id
 * @property string                                           $custom_id
 * @property string                                           $status
 * @property \stdClass                                        $status_details
 * @property string                                           note_to_payer
 * @property \PaymentPlugins\PayPalSDK\SellerPayableBreakdown $seller_payable_breakdown
 * @property string                                           $create_time
 * @property string                                           $update_time
 */
class Refund extends AbstractObject {

}