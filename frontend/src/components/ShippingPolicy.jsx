import React from 'react';
import './ShippingPolicy.css';


const ShippingPolicy = () => {
  return (
    <>
      <div className="policy-container">
        <h1>Shipping Policy</h1>

        <p className="effective-date">effective date: 15th January 2025</p>

        <p>Thank you for choosing Joy Juncture. This shipping policy outlines our shipping and delivery practices to ensure you have a seamless shopping experience with us. Please read this policy carefully before making a purchase.</p>

        <p><strong>Shipping Destinations:</strong> We currently ship our products to addresses within India only</p>

        <p><strong>Processing Time:</strong> Order processing typically takes 3-5 business days. Please note that processing times may be longer during peak seasons or promotional events</p>

        <h2>Delivery Timeline</h2>
        <p>Once shipped, your order should reach you within:</p>
        <ul>
          <li>4–8 business days for major metro cities</li>
          <li>7–12 business days for non-metro or remote locations</li>
        </ul>
        <p>Please note: these are estimated timelines and may vary due to carrier delays or external factors</p>

        <p><strong>Shipping methods:</strong> We partner with reputable shipping carriers to ensure the safe and timely delivery of your orders. Available shipping methods will be displayed during the checkout process.</p>

        <p><strong>Shipping fees:</strong> Shipping fees is included in the price of the product.</p>

        <p><strong>Estimated delivery time:</strong> The estimated delivery time depends on your shipping address and the selected shipping method. Please refer to the estimated delivery time provided during the checkout process</p>

        <p>Please note that delivery times are approximate and may be affected by factors beyond our control, such as customs processing and unforeseen shipping delays.</p>

        <p><strong>Tracking information:</strong> Once your order is shipped, we will provide you with a tracking number to monitor the delivery status of your package.</p>

        <p><strong>Delayed or lost shipments:</strong> While we make every effort to ensure timely delivery, we are not responsible for delayed or lost shipments caused by the shipping carrier or any unforeseen circumstances.</p>

        <p>If your package is significantly delayed or appears to be lost, please contact our customer support team, and we will assist you in resolving the issue.</p>

        <p><strong>Customs and import duties:</strong> Any customs duties, taxes, or import fees imposed by the destination country are the responsibility of the customer. Please check with your local customs office for information on potential fees before placing an order.</p>

        <p><strong>Delivery address:</strong> Please ensure that your shipping address is accurate and complete. We are not responsible for orders delivered to incorrect or undeliverable addresses.</p>

        <p><strong>Order status and support:</strong> For information about your order status or any shipping-related inquiries, please contact our customer support team at <span className="email-orange">carejuncture@gmail.com</span></p>

        <p>By making a purchase on our website, you acknowledge and agree to the terms of this shipping policy.</p>

        <p>If you have any questions or need further assistance, please do not hesitate to contact us at <span className="email-orange">carejuncture@gmail.com</span>. We are here to help!</p>

        <p style={{ marginTop: '30px' }}><strong>Thank You for choosing Joy Juncture!</strong></p>
      </div>


    </>
  );
};

export default ShippingPolicy;
