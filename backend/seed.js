import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Email from './model/email.js';

dotenv.config();

const DB_URI = process.env.MONGO_URI;

const seedDB = async () => {
    try {
        if (!DB_URI) {
            throw new Error('MONGO_URI not found in environment variables. Please check your .env file.');
        }

        await mongoose.connect(DB_URI);
        console.log('Database connected successfully.');

        // Clear existing data
        await Email.deleteMany({});
        console.log('Existing emails cleared.');

        // Read emails.json dynamically
        const dataPath = path.resolve('./data/emails.json');
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Enhance data with ipInfo + vpnInfo
        const enhancedData = data.map((email, index) => {
            let testIP;
            let safeStatus;
            let vpnInfo;

            if (index % 3 === 0) {
                testIP = "8.8.8.8";        // Google DNS (Safe)
                safeStatus = true;
                vpnInfo = { isVPN: false };
            } else if (index % 3 === 1) {
                testIP = "123.45.67.89";   // Mock risky IP
                safeStatus = false;
                vpnInfo = { isVPN: true, org: "NordVPN", country: "Netherlands" };
            } else {
                testIP = "192.168.0.10";   // Private IP (Safe)
                safeStatus = true;
                vpnInfo = { isVPN: false };
            }

            return {
                ...email,
                ipInfo: {
                    address: testIP,
                    reputationScore: safeStatus ? 0 : 95,
                    safe: safeStatus
                },
                vpnInfo
            };
        });

        await Email.insertMany(enhancedData);
        console.log('Database seeded with emails including IP + VPN info.');

    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

seedDB();
