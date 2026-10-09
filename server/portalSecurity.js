// Server-side cryptographic route tokens & access keys
const ORGANIZER_PORTAL_KEY = "org-e9b27a41d6";
const ADMIN_PORTAL_KEY = "adm-3c81f092a7";

function verifyOrganizerPortalKey(req, res, next) {
    const key = req.headers['x-portal-key'] || req.query.key || req.body.portal_key;
    if (key !== ORGANIZER_PORTAL_KEY && key !== ADMIN_PORTAL_KEY) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    next();
}

function verifyAdminPortalKey(req, res, next) {
    const key = req.headers['x-portal-key'] || req.query.key || req.body.portal_key;
    if (key !== ADMIN_PORTAL_KEY) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    next();
}

module.exports = {
    ORGANIZER_PORTAL_KEY,
    ADMIN_PORTAL_KEY,
    verifyOrganizerPortalKey,
    verifyAdminPortalKey
};
