// SimpleStripeForm.js
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';

const SimpleStripeForm = ({ locale  , updatePay}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { messages } = useIntl()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // In a real app, you'd confirm the payment here with a clientSecret
    // But this is a mock just for UI purposes
    setTimeout(() => {
      setProcessing(false);
      toast.success(messages.dialogs.paymentSuccessful);
      updatePay(false)
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
      <CardElement className="mb-4 p-2 border rounded" />
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default SimpleStripeForm;
