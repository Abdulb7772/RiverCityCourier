const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');
const { createOrder, updateOrderStatus, formatOrder } = require('../models/orderModel');
const { insertNotification } = require('../models/notificationModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  try {
    const {
      customer, customerEmail, pickup, destination, contact,
      packageType, pickupName, pickupContact, pickupItems, pickupQuantity,
      pickupVehicleType, deliveryName, deliveryContact, deliveryItems,
      deliveryQuantity, deliveryDate, deliveryTime, pickupDate, pickupTime,
      total,
    } = req.body || {};

    if (!customer || !pickup || !destination || !total) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }

    const orderData = {
      customer,
      customerEmail: customerEmail || '',
      pickup,
      destination,
      contact: contact || '',
      packageType: pickupItems || '',
      pickupName: pickupName || customer,
      pickupContact: pickupContact || contact || '',
      pickupItems: pickupItems || '',
      pickupQuantity: pickupQuantity || '',
      pickupVehicleType: pickupVehicleType || 'Bike',
      deliveryName: deliveryName || '',
      deliveryContact: deliveryContact || '',
      deliveryItems: deliveryItems || '',
      deliveryQuantity: deliveryQuantity || '',
      deliveryVehicleType: pickupVehicleType || 'Bike',
      pickupDate: pickupDate || '',
      pickupTime: pickupTime || '',
      deliveryDate: deliveryDate || '',
      deliveryTime: deliveryTime || '',
      note: `Pickup items: ${pickupItems || ''}, Delivery items: ${deliveryItems || ''}`,
      status: 'pending_payment',
      paymentMethod: 'stripe',
    };

    const order = await createOrder(orderData);
    const orderId = order._id.toString();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      payment_method_options: {
        card: {},
      },
      mode: 'payment',
      customer_email: customerEmail || undefined,
      metadata: { orderId },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `RiverCity Courier Delivery`,
              description: `${pickup} → ${destination} — ${pickupItems || 'Package'} via ${pickupVehicleType || 'Bike'}`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/customer/orders/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/customer/create-delivery`,
    });

    return res.json({ url: session.url, sessionId: session.id, orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session.';
    return res.status(500).json({ error: message });
  }
}

async function confirmPayment(req, res) {
  try {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Session ID is required.' });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed.' });
    }

    const orderId = session.metadata.orderId;
    if (!orderId || !ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order reference.' });
    }

    const updatedOrder = await updateOrderStatus(orderId, 'new');

    await insertNotification({
      recipientRole: 'customer',
      recipientEmail: session.customer_email || updatedOrder.customerEmail,
      title: 'Payment Successful',
      message: `Your payment of $${(session.amount_total / 100).toFixed(2)} for order #${orderId.slice(-6)} has been confirmed. Your order is now being processed.`,
      type: 'payment',
      referenceId: orderId,
    });

    await insertNotification({
      recipientRole: 'admin',
      recipientEmail: '',
      title: 'New Order — Paid Online',
      message: `Order #${orderId.slice(-6)} has been placed and paid online. ${updatedOrder.pickup} → ${updatedOrder.destination}`,
      type: 'new_order',
      referenceId: orderId,
    });

    return res.json(formatOrder(updatedOrder));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm payment.';
    return res.status(500).json({ error: message });
  }
}

async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch {
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId && ObjectId.isValid(orderId)) {
      const db = await getDatabase();
      const orders = db.collection('orders');
      const order = await orders.findOne({ _id: new ObjectId(orderId) });

      if (order && order.status === 'pending_payment') {
        await updateOrderStatus(orderId, 'new');
      }
    }
  }

  return res.json({ received: true });
}

module.exports = { createCheckoutSession, confirmPayment, handleWebhook };
