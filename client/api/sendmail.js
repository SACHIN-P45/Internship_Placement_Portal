import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept'
    );

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { to, subject, htmlContent, creds } = req.body;

        if (!to || !subject || !htmlContent || !creds || !creds.user || !creds.pass) {
            return res.status(400).json({ message: 'Missing required configuration fields' });
        }

        // Verify origin authorization with a shared secret to prevent unwanted email abuse
        if (creds.secret !== 'super-secure-portal-secret-key-123') {
            return res.status(401).json({ message: 'Unauthorized Request: Invalid Secret' });
        }

        // Connect securely to Google's SMTP Server via Vercel proxy
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: creds.user,
                pass: creds.pass,
            },
        });

        const info = await transporter.sendMail({
            from: `"Placement Portal" <${creds.user}>`,
            to,
            subject,
            html: htmlContent,
        });

        return res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Vercel SMTP Error details:', error);
        // Sometimes error.message is undefined in serverless crashes, fallback to stringified error
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Unknown SMTP error occurred',
            raw: String(error)
        });
    }
}
