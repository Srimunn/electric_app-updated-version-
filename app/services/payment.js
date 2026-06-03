import { Alert, NativeModules } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import API_CLIENT from './api';

// Check if the Razorpay native module is available
const isNativeRazorpayAvailable = !!NativeModules.RNRazorpayCheckout;

/**
 * Create a new Razorpay order on the backend
 * @param {string} stationId - ID of the charging station
 * @param {number} estimatedEnergyKwh - Estimated energy requested by user
 * @returns {Promise<Object>} The order details including orderId and keyId
 */
export const createOrder = async (stationId, estimatedEnergyKwh) => {
  try {
    const response = await API_CLIENT.post('/payments/create-order', {
      stationId,
      estimatedEnergyKwh,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    throw error;
  }
};

/**
 * Verify the Razorpay payment on the backend
 * @param {Object} paymentData - The response from RazorpayCheckout containing signature, order_id, payment_id
 * @returns {Promise<Object>} Verification status and updated payment record
 */
export const verifyPayment = async (paymentData) => {
  try {
    const response = await API_CLIENT.post('/payments/verify', {
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to verify Razorpay payment:', error);
    throw error;
  }
};

/**
 * Open Razorpay Checkout modal
 * @param {Object} options - Checkout options (key, amount, name, prefill, etc.)
 * @returns {Promise<Object>} Resolves with payment data on success
 */
export const openCheckout = (options) => {
  return new Promise((resolve, reject) => {
    if (!isNativeRazorpayAvailable) {
      console.warn('RazorpayCheckout native module is not available (common in Expo Go). Falling back to mock checkout.');
      
      Alert.alert(
        'Razorpay Mock Checkout (Expo Go)',
        `This app is running in Expo Go which does not support native Razorpay libraries.\n\nWould you like to simulate a successful payment of ₹${(options.amount / 100).toFixed(2)}?`,
        [
          {
            text: 'Cancel Payment',
            onPress: () => reject(new Error('Payment cancelled by user')),
            style: 'cancel',
          },
          {
            text: 'Simulate Success',
            onPress: () => {
              resolve({
                razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
                razorpay_order_id: options.order_id,
                razorpay_signature: 'mock_signature',
              });
            },
          },
        ],
        { cancelable: false }
      );
      return;
    }

    RazorpayCheckout.open(options)
      .then((data) => {
        // handle success
        // data contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
        resolve(data);
      })
      .catch((error) => {
        // handle failure
        console.error('Razorpay Checkout Error:', error);
        reject(error);
      });
  });
};

// Dummy default export to satisfy Expo Router which expects a component in the `app` directory
export default function DummyPaymentRoute() { 
  return null; 
}
