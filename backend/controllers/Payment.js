const Payment = require("../models/Payment");
const {
    calculateCheckout,
    createOrderFromCheckout,
} = require("../services/checkout");
const {
    createGatewayOrder,
    getGatewayConfig,
    verifyPayUResponse,
    verifyGatewaySignature,
} = require("../services/paymentGateway");

const getBackendBaseUrl = (req) => {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol || "https";
    return `${protocol}://${req.get("host")}`;
};

const getFrontendBaseUrl = () =>
    (process.env.ORIGIN || "http://localhost:3000")
        .split(",")[0]
        .trim()
        .replace(/\/+$/, "");

const redirectToFrontend = (res, path) => res.redirect(302, `${getFrontendBaseUrl()}${path}`);

exports.getConfig = async (req, res) => {
    const config = getGatewayConfig();
    res.status(200).json({
        provider: config.provider,
        enabled: config.enabled,
        publicKey: config.publicKey,
        testMode: Boolean(config.testMode),
        label: config.label,
    });
};

exports.createPaymentOrder = async (req, res) => {
    try {
        const summary = await calculateCheckout({
            userId: req.user._id,
            addressId: req.body.addressId,
            couponCode: req.body.couponCode,
        });

        const providerConfig = getGatewayConfig();
        const receipt = `receipt_${Date.now()}`;
        const callbackUrl = `${getBackendBaseUrl(req)}/payments/payu/callback`;
        const gatewayOrder = await createGatewayOrder({
            amount: summary.pricing.total,
            receipt,
            notes: {
                userId: req.user._id.toString(),
                productinfo: `Sastify Order (${summary.items.length} items)`,
                successUrl: callbackUrl,
                failureUrl: callbackUrl,
                customer: {
                    firstname: req.user.name || "Sastify User",
                    email: req.user.email || "support@sastify.com",
                    phone: req.user.phone || "",
                    udf1: req.user._id.toString(),
                    udf2: req.body.addressId?.toString() || "",
                    udf3: req.body.couponCode || "",
                },
            },
        });

        await Payment.create({
            user: req.user._id,
            paymentMethod: "online",
            paymentGateway: providerConfig.provider,
            gatewayOrderId: gatewayOrder.id,
            addressId: req.body.addressId,
            couponCode: req.body.couponCode || "",
            amount: summary.pricing.total,
            status: providerConfig.provider === "payu" ? "pending" : "created",
            meta: {
                pricing: summary.pricing,
                items: summary.items,
                testMode: Boolean(gatewayOrder.testMode),
                testVerificationToken: gatewayOrder.testVerificationToken || "",
                redirect: gatewayOrder.action
                    ? {
                        action: gatewayOrder.action,
                        method: gatewayOrder.method || "POST",
                        fields: gatewayOrder.fields || {},
                    }
                    : null,
            },
        });

        res.status(201).json({
            gatewayOrderId: gatewayOrder.id,
            amount: summary.pricing.total,
            currency: gatewayOrder.currency || "INR",
            key: providerConfig.publicKey,
            provider: providerConfig.provider,
            testMode: Boolean(gatewayOrder.testMode),
            testMeta: gatewayOrder.testMode
                ? {
                    paymentId: gatewayOrder.testPaymentId,
                    signature: gatewayOrder.testSignature,
                    verificationToken: gatewayOrder.testVerificationToken,
                }
                : null,
            redirect: gatewayOrder.action
                ? {
                    action: gatewayOrder.action,
                    method: gatewayOrder.method || "POST",
                    fields: gatewayOrder.fields || {},
                }
                : null,
            pricing: summary.pricing,
            items: summary.items,
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message || "Unable to create payment order" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            gatewayOrderId: providedGatewayOrderId,
            gatewayPaymentId: providedGatewayPaymentId,
            gatewaySignature: providedGatewaySignature,
            verificationToken,
            addressId,
            couponCode,
        } = req.body;

        const gatewayOrderId = providedGatewayOrderId || razorpay_order_id;
        const gatewayPaymentId = providedGatewayPaymentId || razorpay_payment_id;
        const gatewaySignature = providedGatewaySignature || razorpay_signature;

        const payment = await Payment.findOne({
            user: req.user._id,
            gatewayOrderId,
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment order not found" });
        }

        const verified = verifyGatewaySignature({
            orderId: gatewayOrderId,
            paymentId: gatewayPaymentId,
            signature: gatewaySignature,
            verificationToken: verificationToken || payment.meta?.testVerificationToken,
        });

        if (!verified) {
            payment.status = "failed";
            payment.gatewayPaymentId = gatewayPaymentId || "";
            payment.gatewaySignature = gatewaySignature || "";
            await payment.save();

            return res.status(400).json({ message: "Payment verification failed" });
        }

        const order = await createOrderFromCheckout({
            userId: req.user._id,
            addressId: addressId || payment.addressId,
            couponCode: couponCode || payment.couponCode,
            paymentMethod: "online",
            paymentGateway: getGatewayConfig().provider,
            paymentGatewayOrderId: gatewayOrderId,
            paymentGatewayPaymentId: gatewayPaymentId,
            paymentStatus: "paid",
            paymentVerified: true,
            transactionMeta: {
                gatewaySignature,
                provider: getGatewayConfig().provider,
                testMode: Boolean(payment.meta?.testMode),
            },
        });

        payment.status = "paid";
        payment.verified = true;
        payment.order = order._id;
        payment.gatewayPaymentId = gatewayPaymentId;
        payment.gatewaySignature = gatewaySignature;
        await payment.save();

        res.status(200).json({
            verified: true,
            order,
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message || "Payment verification failed" });
    }
};

exports.handlePayUCallback = async (req, res) => {
    try {
        const payload = req.body || {};
        const payment = await Payment.findOne({ gatewayOrderId: payload.txnid });

        if (!payment) {
            return redirectToFrontend(res, "/checkout?payment=failed&message=Payment%20order%20not%20found");
        }

        const isVerified = verifyPayUResponse(payload);
        const isSuccess = String(payload.status || "").toLowerCase() === "success";

        payment.gatewayPaymentId = payload.mihpayid || "";
        payment.gatewaySignature = payload.hash || "";
        payment.meta = {
            ...(payment.meta || {}),
            payuResponse: payload,
        };

        if (!isVerified || !isSuccess) {
            payment.status = "failed";
            await payment.save();
            const failureMessage = encodeURIComponent(payload.error_Message || payload.field9 || "Payment failed");
            return redirectToFrontend(res, `/checkout?payment=failed&message=${failureMessage}`);
        }

        if (payment.order) {
            payment.status = "paid";
            payment.verified = true;
            await payment.save();
            return redirectToFrontend(res, `/order-success/${payment.order}`);
        }

        const order = await createOrderFromCheckout({
            userId: payment.user,
            addressId: payment.addressId,
            couponCode: payment.couponCode,
            paymentMethod: "online",
            paymentGateway: getGatewayConfig().provider,
            paymentGatewayOrderId: payment.gatewayOrderId,
            paymentGatewayPaymentId: payload.mihpayid,
            paymentStatus: "paid",
            paymentVerified: true,
            transactionMeta: {
                provider: "payu",
                status: payload.status,
                mode: payload.mode,
                bankcode: payload.bankcode,
                testMode: Boolean(getGatewayConfig().testMode),
            },
        });

        payment.status = "paid";
        payment.verified = true;
        payment.order = order._id;
        await payment.save();

        return redirectToFrontend(res, `/order-success/${order._id}`);
    } catch (error) {
        console.log(error);
        return redirectToFrontend(res, "/checkout?payment=failed&message=Payment%20verification%20failed");
    }
};
