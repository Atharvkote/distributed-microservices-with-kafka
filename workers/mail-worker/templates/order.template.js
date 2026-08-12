export const getOrderPlacedTemplate = (orderId, total) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 40px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #111; margin: 0; }
    .content { padding: 30px 20px; line-height: 1.6; }
    .details { background-color: #f8f9fa; border: 1px solid #eaeaea; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Placed Successfully!</h1>
    </div>
    <div class="content">
      <p>Thank you for shopping with VenDeX. Your order has been received and is currently pending payment confirmation.</p>
      <div class="details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${(total / 100).toFixed(2)}</p>
      </div>
      <p>Please complete your payment to confirm this order.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VenDeX E-Commerce. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getPaymentSuccessTemplate = (orderId, total, transactionId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 40px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #10b981; margin: 0; }
    .content { padding: 30px 20px; line-height: 1.6; }
    .details { background-color: #f8f9fa; border: 1px solid #eaeaea; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed!</h1>
    </div>
    <div class="content">
      <p>Great news! We have received your payment. Your order is now confirmed and is being processed for shipping.</p>
      <div class="details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Transaction ID:</strong> ${transactionId || "N/A"}</p>
        <p><strong>Total Amount:</strong> $${(total / 100).toFixed(2)}</p>
        <p><strong>Payment Status:</strong> PAID</p>
      </div>
      <p>You can track the progress of your shipment directly from your dashboard.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VenDeX E-Commerce. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getPaymentFailedTemplate = (orderId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 40px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #ef4444; margin: 0; }
    .content { padding: 30px 20px; line-height: 1.6; }
    .details { background-color: #f8f9fa; border: 1px solid #eaeaea; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Failed</h1>
    </div>
    <div class="content">
      <p>We're sorry, but the payment attempt for your order has failed. Consequently, this order has been cancelled.</p>
      <div class="details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Status:</strong> CANCELLED</p>
      </div>
      <p>Please try checking out again or using a different payment method.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} VenDeX E-Commerce. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
