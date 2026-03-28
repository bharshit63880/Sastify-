import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../../cart/CartSlice';
import { SHIPPING, TAXES } from '../../../constants';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripeCheckoutForm = ({ amount, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch('/api/payment/create-stripe-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const { clientSecret, error: backendError } = await res.json();
            if (backendError || !clientSecret) {
                setError(backendError || 'Payment initialization failed.');
                setLoading(false);
                return;
            }
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });
            if (result.error) {
                setError(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    setSuccess(true);
                    onPaymentSuccess && onPaymentSuccess('ONLINE');
                } else {
                    setError('Payment not successful.');
                }
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe || loading || success} style={{marginTop: 16, width: '100%', padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4}}>
                {loading ? 'Processing...' : success ? 'Payment Successful!' : `Pay ₹${amount}`}
            </button>
            {error && <Typography color="error" mt={1}>{error}</Typography>}
            {success && <Typography color="success.main" mt={1}>Payment Successful!</Typography>}
        </form>
    );
};

export const PaymentForm = ({ onPaymentSuccess }) => {
    const cartItems = useSelector(selectCartItems);
    const orderTotal = cartItems.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0) + SHIPPING + TAXES;

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Online Payment</Typography>
            <Typography variant="body2" color="text.secondary">
                Pay securely using Stripe (Test Mode)
            </Typography>
            <Elements stripe={stripePromise}>
                <StripeCheckoutForm amount={orderTotal} onPaymentSuccess={onPaymentSuccess} />
            </Elements>
        </Stack>
    );
};