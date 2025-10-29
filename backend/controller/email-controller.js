/* eslint-disable no-unused-vars */
import Email from "../model/email.js";
import axios from "axios";  // 👈 For IP reputation check
import { URL } from "url";  // 👈 For proper domain parsing

// ---- Helper Functions ----

// Extract IP from request (either from headers or passed in body)
function extractIP(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.connection?.remoteAddress || req.ip || null;
}

// Check if IP is safe using AbuseIPDB API
async function checkIP(ip) {
    if (!ip) return { score: null, safe: true };

    try {
        const res = await axios.get("https://api.abuseipdb.com/api/v2/check", {
            params: { ipAddress: ip },
            headers: {
                Key: process.env.ABUSEIPDB_API_KEY,
                Accept: "application/json",
            },
        });

        const score = res.data.data.abuseConfidenceScore;
        return { score, safe: score < 30 };
    } catch (err) {
        console.error("IP check failed:", err.message);
        return { score: null, safe: true };
    }
}

// ---- Controllers ----

export const saveSentEmail = async (request, response) => {
    try {
        const { subject, body } = request.body;
        let isSpam = false;
        const spamKeywords = [
            // 🎯 Money / Lottery / Prize scams
            "free money",
            "lottery",
            "jackpot",
            "cash prize",
            "unclaimed prize",
            "you are a winner",
            "congratulations",
            "claim your reward",
            "get rich quick",
            "double your income",
            "work from home",
            "Gift card",
            "Claim gift card",
        
            // 🎯 Phishing & Urgency
            "click here",
            "verify your account",
            "urgent action required",
            "update your password",
            "limited time offer",
            "your account is suspended",
            "login immediately",
            "security alert",
            "unauthorized login attempt",
        
            // 🎯 Financial scams
            "low interest loan",
            "credit card offer",
            "mortgage rate",
            "debt relief",
            "no credit check",
            "instant approval",
            "investment opportunity",
        
            // 🎯 Health & Medicines
            "cheap meds",
            "viagra",
            "cialis",
            "weight loss",
            "miracle cure",
            "anti-aging",
            "herbal pills",
        
            // 🎯 Tech / Crypto scams
            "bitcoin giveaway",
            "crypto investment",
            "elon musk",
            "guaranteed returns",
            "nft drop",
            "metaverse profit",
        
            // 🎯 Generic spammy words
            "risk free",
            "no strings attached",
            "100% free",
            "money back guarantee",
            "winner",
            "exclusive deal",
            "special promotion",
            "unlimited access"
        ];
        

        if (
            spamKeywords.some(
                (keyword) =>
                    subject?.toLowerCase().includes(keyword) ||
                    body?.toLowerCase().includes(keyword)
            )
        ) {
            isSpam = true;
        }

        const ip = extractIP(request);
        const ipCheck = await checkIP(ip);

        const newEmail = new Email({
            ...request.body,
            isSpam,
            ipInfo: {
                address: ip,
                reputationScore: ipCheck.score,
                safe: ipCheck.safe,
            },
        });

        await newEmail.save();
        response.status(200).json("email is saved");
    } catch (error) {
        response.status(500).json(error.message);
    }
};

export const getEmails = async (request, response) => {
    try {
        let emails;

        if (request.params.type === "starred") {
            emails = await Email.find({ starred: true, bin: false });
        } else if (request.params.type === "bin") {
            emails = await Email.find({ bin: true });
        } else if (request.params.type === "allmail") {
            emails = await Email.find({});
        } else if (request.params.type === "inbox") {
            emails = await Email.find({ type: "inbox", bin: false });
        } else if (request.params.type === "spam") {
            emails = await Email.find({ isSpam: true, bin: false });
        } else {
            emails = await Email.find({ type: request.params.type });
        }

        response.status(200).json(emails);
    } catch (error) {
        response.status(500).json(error.message);
    }
};

export const moveToBin = async (request, response) => {
    try {
        await Email.updateMany(
            { _id: { $in: request.body } },
            { $set: { bin: true, starred: false, type: "" } }
        );
        return response.status(200).json("email deleted succesfully");
    } catch (error) {
        console.log(error);
        response.status(500).json(error.message);
    }
};

export const starredEmail = async (request, response) => {
    try {
        await Email.updateOne(
            { _id: request.body.id },
            { $set: { starred: request.body.value } }
        );
        response.status(201).json("Value is updated");
    } catch (error) {
        console.log(error);
        response.status(200).json(error.message);
    }
};

export const deleteEmail = async (request, response) => {
    try {
        await Email.deleteMany({ _id: { $in: request.body } });
        response.status(200).json("emails deleted successfully");
    } catch (error) {
        response.status(500).json(error.message);
    }
};

// ---- URL Spam Detection ----
export const checkURLforSpam = async (request, response) => {
    try {
        const { url } = request.body;

        if (!url || typeof url !== "string") {
            return response
                .status(400)
                .json({ isSpam: false, message: "Invalid or missing URL." });
        }

        const maliciousDomains = [
            // 🎯 Phishing / fake login pages
            "secure-login.com",
            "paypal-verify.net",
            "bankofamerica-security.org",
            "appleid-login.net",
            "microsoft-support.help",

            // 🎯 Lottery / Prize scams
            "free-money-now.com",
            "unclaimed-prize.net",
            "win-lottery.co",
            "claim-your-reward.com",
            "lucky-draw.online",
            "prize-winner-alert.org",

            // 🎯 Tech support scams
            "virus-cleaner-support.net",
            "windows-fix-alert.com",
            "system-update-required.org",

            // 🎯 Investment / Crypto scams
            "get-rich-quick.io",
            "crypto-doubler.net",
            "bitcoin-giveaway.org",
            "elon-musk-investment.com",

            // 🎯 Suspicious shorteners / redirectors
            "bit.ly",
            "tinyurl.com",
            "goo.gl",
            "shady.link",
            "click-here-now.net",

            // 🎯 Generic spammy domains
            "cheap-meds-online.org",
            "viagra-discount.net",
            "loan-approved-fast.com",
            "work-from-home-job.net",
            "casino-bonus-now.org",
        ];

        // ✅ Extract hostname safely
        let hostname;
        try {
            hostname = new URL(url).hostname.toLowerCase();
        } catch {
            return response
                .status(400)
                .json({ isSpam: false, message: "Invalid URL format." });
        }

        const isSpamURL = maliciousDomains.some(
            (domain) =>
                hostname === domain.toLowerCase() ||
                hostname.endsWith(`.${domain.toLowerCase()}`)
        );

        if (isSpamURL) {
            return response.status(200).json({
                isSpam: true,
                message: "⚠️ Warning: This URL is detected as spam.",
            });
        }

        return response
            .status(200)
            .json({ isSpam: false, message: "✅ This URL seems safe." });
    } catch (error) {
        console.error(error);
        return response
            .status(500)
            .json({ isSpam: false, message: "An error occurred." });
    }
};
