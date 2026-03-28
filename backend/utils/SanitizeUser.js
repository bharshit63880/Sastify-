exports.sanitizeUser = (user) => {
    if (!user) {
        return null;
    }

    const role = user.role || (user.isAdmin ? "admin" : "user");

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role,
        isVerified: user.isVerified,
        isAdmin: role === "admin",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        isBlocked: Boolean(user.isBlocked),
    };
};
