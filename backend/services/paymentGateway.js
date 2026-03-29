const crypto = require("crypto");

const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase();
const MOCK_PAYMENT_SECRET = process.env.MOCK_PAYMENT_SECRET || "local_mock_payment_secret";
const PAYU_ENV = (process.env.PAYU_ENV || "test").toLowerCase();

const isPlaceholder = (value = "") => !value || /^your_/i.test(value);
const sha512 = (value) => crypto.createHash("sha512").update(String(value)).digest("hex");

const getGatewayConfig = () => {
    const provider = PAYMENT_PROVIDER;
    const publicKey = process.env.RAZORPAY_KEY_ID || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "";
    const payuKey = process.env.PAYU_KEY || "";
    const payuSalt = process.env.PAYU_SALT || "";

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

    if (provider === "payu") {
        const hasValidPayUKeys = !isPlaceholder(payuKey) && !isPlaceholder(payuSalt);

        return {
            provider,
            publicKey: payuKey,
            secret: payuSalt,
            enabled: hasValidPayUKeys,
            testMode: PAYU_ENV !== "prod" && PAYU_ENV !== "production",
            label: "PayU",
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

const buildPayUHash = (params, salt) => {
    const hashString = [
        params.key,
        params.txnid,
        params.amount,
        params.productinfo,
        params.firstname,
        params.email,
        params.udf1 || "",
        params.udf2 || "",
        params.udf3 || "",
        params.udf4 || "",
        params.udf5 || "",
        "",
        "",
        "",
        "",
        "",
        salt,
    ].join("|");

    return sha512(hashString);
};

const buildPayUReverseHash = (payload, salt) => {
    const hashString = [
        salt,
        payload.status || "",
        "",
        "",
        "",
        "",
        "",
        payload.udf5 || "",
        payload.udf4 || "",
        payload.udf3 || "",
        payload.udf2 || "",
        payload.udf1 || "",
        payload.email || "",
        payload.firstname || "",
        payload.productinfo || "",
        payload.amount || "",
        payload.txnid || "",
        payload.key || "",
    ].join("|");

    return sha512(hashString);
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

const createPayUOrder = async ({
    amount,
    receipt,
    notes,
    customer,
    successUrl,
    failureUrl,
}) => {
    const { publicKey, secret, enabled, testMode } = getGatewayConfig();

    if (!enabled) {
        const error = new Error("PayU is not configured on the server");
        error.status = 501;
        throw error;
    }

    const txnid = receipt || `payu_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const fields = {
        key: publicKey,
        txnid,
        amount: Number(amount || 0).toFixed(2),
        firstname: customer?.firstname || "Sastify User",
        email: customer?.email || "support@sastify.com",
        phone: customer?.phone || "",
        productinfo: notes?.productinfo || "Sastify Order",
        surl: successUrl,
        furl: failureUrl,
        udf1: customer?.udf1 || "",
        udf2: customer?.udf2 || "",
        udf3: customer?.udf3 || "",
        udf4: customer?.udf4 || "",
        udf5: customer?.udf5 || "",
    };

    fields.hash = buildPayUHash(fields, secret);

    return {
        id: txnid,
        amount: Number(fields.amount),
        currency: "INR",
        receipt: txnid,
        notes,
        testMode,
        action: testMode ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment",
        method: "POST",
        fields,
    };
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

    if (provider === "payu") {
        return createPayUOrder({ amount, receipt, notes, customer: notes?.customer, successUrl: notes?.successUrl, failureUrl: notes?.failureUrl });
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

const verifyPayUResponse = (payload = {}) => {
    const { provider, secret } = getGatewayConfig();

    if (provider !== "payu" || !secret || !payload.hash) {
        return false;
    }

    const generatedHash = buildPayUReverseHash(payload, secret);
    return generatedHash === payload.hash;
};

module.exports = {
    createGatewayOrder,
    getGatewayConfig,
    verifyPayUResponse,
    verifyGatewaySignature,
};
