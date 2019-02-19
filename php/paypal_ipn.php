<?php
// Paypal IPN Listener for Getleads Paypal Notification
// code sample from paypal here: https://github.com/paypal/ipn-code-samples 


// CONFIG: Enable debug mode. This means we'll log requests into 'ipn.log' in the same directory.
// Especially useful if you encounter network errors or other intermittent problems with IPN (validation).
// Set this to 0 once you go live or don't require logging.
define("DEBUG", 1);

// Set to 0 once you're ready to go live
define("USE_SANDBOX", 1);


define("LOG_FILE", "./ipn.log");


// Read POST data
// reading posted data directly from $_POST causes serialization
// issues with array data in POST. Reading raw POST data from input stream instead.
$raw_post_data = file_get_contents('php://input');
$raw_post_array = explode('&', $raw_post_data);
$myPost = array();
foreach ($raw_post_array as $keyval) {
	$keyval = explode ('=', $keyval);
	if (count($keyval) == 2)
		$myPost[$keyval[0]] = urldecode($keyval[1]);
}
// read the post from PayPal system and add 'cmd'
$req = 'cmd=_notify-validate';
if(function_exists('get_magic_quotes_gpc')) {
	$get_magic_quotes_exists = true;
}
foreach ($myPost as $key => $value) {
	if($get_magic_quotes_exists == true && get_magic_quotes_gpc() == 1) {
		$value = urlencode(stripslashes($value));
	} else {
		$value = urlencode($value);
	}
	$req .= "&$key=$value";
}

// Post IPN data back to PayPal to validate the IPN data is genuine
// Without this step anyone can fake IPN data

if(USE_SANDBOX == true) {
	$paypal_url = "https://www.sandbox.paypal.com/cgi-bin/webscr";
} else {
	$paypal_url = "https://www.paypal.com/cgi-bin/webscr";
}

$ch = curl_init($paypal_url);
if ($ch == FALSE) {
	return FALSE;
}

curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_FORBID_REUSE, 1);

if(DEBUG == true) {
	curl_setopt($ch, CURLOPT_HEADER, 1);
	curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
}

// CONFIG: Optional proxy configuration
//curl_setopt($ch, CURLOPT_PROXY, $proxy);
//curl_setopt($ch, CURLOPT_HTTPPROXYTUNNEL, 1);

// Set TCP timeout to 30 seconds
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Connection: Close'));

// CONFIG: Please download 'cacert.pem' from "http://curl.haxx.se/docs/caextract.html" and set the directory path
// of the certificate as shown below. Ensure the file is readable by the webserver.
// This is mandatory for some environments.

//$cert = __DIR__ . "./cacert.pem";
//curl_setopt($ch, CURLOPT_CAINFO, $cert);

$res = curl_exec($ch);
if (curl_errno($ch) != 0) // cURL error
	{
	if(DEBUG == true) {	
		error_log(date('[Y-m-d H:i e] '). "Can't connect to PayPal to validate IPN message: " . curl_error($ch) . PHP_EOL, 3, LOG_FILE);
	}
	curl_close($ch);
	exit;

} else {
		// Log the entire HTTP response if debug is switched on.
		if(DEBUG == true) {
			error_log(date('[Y-m-d H:i e] '). "HTTP request of validation request:". curl_getinfo($ch, CURLINFO_HEADER_OUT) ." for IPN payload: $req" . PHP_EOL, 3, LOG_FILE);
			error_log(date('[Y-m-d H:i e] '). "HTTP response of validation request: $res" . PHP_EOL, 3, LOG_FILE);
		}
		curl_close($ch);
}

// Inspect IPN validation result and act accordingly

// Split response headers and payload, a better way for strcmp
$tokens = explode("\r\n\r\n", trim($res));
$res = trim(end($tokens));

if (strcmp ($res, "VERIFIED") == 0) {
	// check whether the payment_status is Completed
	// check that txn_id has not been previously processed
	// check that receiver_email is your PayPal email
	// check that payment_amount/payment_currency are correct
	// process payment and mark item as paid.

	// assign posted variables to local variables
	$payment_status = $_POST['payment_status'];
	$payment_amount = $_POST['mc_gross'];
	$payment_currency = $_POST['mc_currency'];
	$receiver_email = $_POST['receiver_email'];
	$payer_email = $_POST['payer_email'];

    /* --------------------------------------------
    Example code to check fraud 
    
    $errmsg = '';

    // Make sure seller email matches your primary account email.
    if ($receiver_email != 'youraccount@mail.com') {
        $errmsg .= "'receiver_email' does not match.";
    }

    // Make sure the amount(s) paid match. in the example below, payment amount should be 19.00
    if ($payment_amount != '19.00') { 
        $errmsg .= "'mc_gross' does not match.";
    }

    // Make sure the currency code matches
    if ($payment_currency != 'USD') { 
        $errmsg .= "'mc_currency' does not match.";
    }

    if (!empty($errmsg)) {
        	
    	// manually investigate errors from the fraud checking
    	$body_error = <<<EOD
		<p>IPN failed fraud checks:</p>
		<p>$errmsg</p>
		<p>from buyer: $payer_email</p>
EOD;
//Must end on first column

		$headers = "From: Fraud Notification System <$receiver_email>\r\n";
		$headers .= 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

		$subject = "GetLeads Fraud Notification"; //insert here the subject of the email
    	    
    	// PHP email sender
		mail('youraccount@mail.com', $subject, $body_error, $headers);

		if(DEBUG == true) {
			error_log(date('[Y-m-d H:i e] '). "Fraud Notification: $errmsg ". PHP_EOL, 3, LOG_FILE);
		}
        	
    } 

    else {

    ------------------------------------------------- */

	// assign posted variables to local variables
	$item_name = $_POST['item_name'];
	$item_number = $_POST['item_number'];
	$payment_amount = $_POST['mc_gross'];
	$payment_currency = $_POST['mc_currency'];
	$txn_id = $_POST['txn_id'];
	$payer_firstname = $_POST['first_name'];
	$payer_lastname = $_POST['last_name'];

	// Send email both to Merchant and Buyer
	$sender_name = "Themedept";  //insert here your sender name for the email

	$headers = "From: $sender_name <$receiver_email>\r\n";
	$headers .= 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

	$subject = "GetLeads Paypal Notification"; //insert here the subject of the email

	// Body for Merchant
	$body_merchant = <<<EOD
	<p>Purchase Notification</p>
	<p><strong>Item Name:</strong> $item_name <br>
	<strong>Item Number:</strong> $item_number <br>
	<strong>Payment Status:</strong> $payment_status <br>
	<strong>Payment Amount:</strong> $payment_amount <br>
	<strong>Payment Currency:</strong> $payment_currency <br>
	<strong>Txn Id:</strong> $txn_id <br>
	<strong>Payer First Name:</strong> $payer_firstname <br>
	<strong>Payer Last Name:</strong> $payer_lastname <br>
	<strong>Payer Email:</strong> $payer_email <br></p>
	<p>The order has been successfully processed!!</p>
EOD;
//Must end on first column

	// Body for Buyer
	$body_buyer = <<<EOD
	<p>Thank you. Your order has been successfully processed!!</p>
	<p><strong>Item Name:</strong> $item_name <br>
	<strong>Price:</strong> $payment_amount <span>$payment_currency</span></p>
	<p>Thanks for shopping with us!</p>
EOD;
//Must end on first column
		
	// PHP email sender
	$buyer_mail = mail($payer_email, $subject, $body_buyer, $headers);
	$merchant_mail = mail($receiver_email, $subject, $body_merchant, $headers);

	// PHP email error log
	if(!$buyer_mail) {
		error_log(date('[Y-m-d H:i e] '). "Getleads Paypal Notification to $payer_email failed". PHP_EOL, 3, LOG_FILE);
	} else {
		error_log(date('[Y-m-d H:i e] '). "Getleads Paypal Notification to $payer_email has been successfully sent". PHP_EOL, 3, LOG_FILE);
	}

	if(!$merchant_mail) {
		error_log(date('[Y-m-d H:i e] '). "Getleads Paypal Notification to $receiver_email for $payer_email purchase failed". PHP_EOL, 3, LOG_FILE);
	} else {
		error_log(date('[Y-m-d H:i e] '). "Getleads Paypal Notification to $receiver_email for $payer_email has been successfully sent". PHP_EOL, 3, LOG_FILE);
	}
	
	if(DEBUG == true) {
		error_log(date('[Y-m-d H:i e] '). "Verified IPN: $req ". PHP_EOL, 3, LOG_FILE);
	}
/*   -------------
}
---------------- */
} else if (strcmp ($res, "INVALID") == 0) {
	// log for manual investigation
	// Add business logic here which deals with invalid IPN messages
	if(DEBUG == true) {
		error_log(date('[Y-m-d H:i e] '). "Invalid IPN: $req" . PHP_EOL, 3, LOG_FILE);
	}
}

?>
