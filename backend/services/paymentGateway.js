const crypto = require("crypto");

const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase();
const MOCK_PAYMENT_SECRET = process.env.MOCK_PAYMENT_SECRET || "local_mock_payment_secret";

const isPlaceholder = (value = "") => !value || /^your_/i.test(value);

const getGatewayConfig = () => {
    const provider = PAYMENT_PROVIDER;
    const publicKey = process.env.RAZORPAY_KEY_ID || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "";

    if (provider === "mock") {
        return {
            provider,
            publicKey: "mock_public_key",
            secret: MOCK_PAYMENT_SECRET,
            enabled: true,
            testMode: true,
            label: "Local test payment",
        };
    }

    const hasValidRazorpayKeys = !isPlaceholder(publicKey) && !isPlaceholder(secret);

    return {
        provider,
        publicKey,
        secret,
        enabled: provider === "razorpay" && hasValidRazorpayKeys,
        testMode: false,
        label: provider === "razorpay" ? "Razorpay" : provider,
    };
};

const createRazorpayOrder = async ({ amount, receipt, notes }) => {
    const { publicKey, secret, enabled } = getGatewayConfig();

    if (!enabled) {
        const error = new Error("Online payments are not configured on the server");
        error.status = 501;
        throw error;
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${publicKey}:${secret}`).toString("base64")}`,
        },
        body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt,
            notes,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.description || "Unable to create payment order");
        error.status = response.status;
        throw error;
    }

    return data;
};

const createMockOrder = async ({ amount, receipt, notes }) => {
    const gatewayOrderId = `mock_order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const paymentId = `mock_pay_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const verificationToken = crypto.randomBytes(16).toString("hex");
    const signature = crypto
        .createHmac("sha256", MOCK_PAYMENT_SECRET)
        .update(`${gatewayOrderId}|${paymentId}|${verificationToken}`)
        .digest("hex");

    return {
        id: gatewayOrderId,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        notes,
        testMode: true,
        testPaymentId: paymentId,
        testVerificationToken: verificationToken,
        testSignature: signature,
    };
};

const createGatewayOrder = async ({ amount, receipt, notes }) => {
    const { provider } = getGatewayConfig();

    if (provider === "razorpay") {
        return createRazorpayOrder({ amount, receipt, notes });
    }

    if (provider === "mock") {
        return createMockOrder({ amount, receipt, notes });
    }

    const error = new Error(`Unsupported payment provider: ${provider}`);
    error.status = 400;
    throw error;
};

const verifyGatewaySignature = ({ orderId, paymentId, signature, verificationToken }) => {
    const { provider, secret } = getGatewayConfig();

    if (provider === "mock" && secret && verificationToken) {
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${orderId}|${paymentId}|${verificationToken}`)
            .digest("hex");

        return generatedSignature === signature;
    }

    if (provider === "razorpay" && secret) {
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        return generatedSignature === signature;
    }

    return false;
};

module.exports = {
    createGatewayOrder,
    getGatewayConfig,
    verifyGatewaySignature,
};
