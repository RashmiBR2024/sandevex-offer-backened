import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        NODE_ENV: process.env.NODE_ENV || "missing",
        MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
        MONGODB_URI_PREVIEW: process.env.MONGODB_URI
            ? process.env.MONGODB_URI.substring(0, 25) + "..."
            : "missing"
    });
}
