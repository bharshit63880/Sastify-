const Payment = require("../models/Payment");
const {
    calculateCheckout,
    createOrderFromCheckout,
} = require("../services/checkout");
const {
    createGatewayOrder,
    getGatewayConfig,
    verifyGatewaySignature,
} = require("../services/paymentGateway");

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
        const gatewayOrder = await createGatewayOrder({
            amount: summary.pricing.total,
            receipt,
            notes: {
                userId: req.user._id.toString(),
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
            status: "created",
            meta: {
                pricing: summary.pricing,
                items: summary.items,
                testMode: Boolean(gatewayOrder.testMode),
                testVerificationToken: gatewayOrder.testVerificationToken || "",
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
