"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Use regular connection for seeding
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create demo users
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            fullName: 'Demo User',
            role: 'USER'
        }
    });
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'ADMIN'
        }
    });
    console.log('✅ Created users:', { demoUser: demoUser.email, adminUser: adminUser.email });
    // Create sample buyers
    const sampleBuyers = [
        {
            fullName: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '9876543210',
            city: 'CHANDIGARH',
            propertyType: 'APARTMENT',
            bhk: 'TWO',
            purpose: 'BUY',
            budgetMin: 5000000,
            budgetMax: 7000000,
            timeline: 'ZERO_TO_THREE_MONTHS',
            source: 'WEBSITE',
            status: 'NEW',
            notes: 'Looking for a 2BHK apartment in Sector 22',
            tags: ['premium', 'urgent'],
            ownerId: demoUser.id
        },
        {
            fullName: 'Priya Sharma',
            email: 'priya.sharma@email.com',
            phone: '9876543211',
            city: 'MOHALI',
            propertyType: 'VILLA',
            bhk: 'THREE',
            purpose: 'BUY',
            budgetMin: 10000000,
            budgetMax: 15000000,
            timeline: 'THREE_TO_SIX_MONTHS',
            source: 'REFERRAL',
            status: 'QUALIFIED',
            notes: 'Interested in villas with garden space',
            tags: ['luxury', 'garden'],
            ownerId: demoUser.id
        },
        {
            fullName: 'Amit Singh',
            phone: '9876543212',
            city: 'ZIRAKPUR',
            propertyType: 'PLOT',
            purpose: 'BUY',
            budgetMin: 2000000,
            budgetMax: 3000000,
            timeline: 'MORE_THAN_SIX_MONTHS',
            source: 'WALK_IN',
            status: 'CONTACTED',
            notes: 'Looking for residential plot for construction',
            tags: ['construction', 'residential'],
            ownerId: adminUser.id
        },
        {
            fullName: 'Neha Gupta',
            email: 'neha.gupta@email.com',
            phone: '9876543213',
            city: 'PANCHKULA',
            propertyType: 'APARTMENT',
            bhk: 'ONE',
            purpose: 'RENT',
            budgetMin: 15000,
            budgetMax: 25000,
            timeline: 'ZERO_TO_THREE_MONTHS',
            source: 'CALL',
            status: 'VISITED',
            notes: 'Young professional looking for 1BHK for rent',
            tags: ['professional', 'furnished'],
            ownerId: demoUser.id
        },
        {
            fullName: 'Vikram Enterprises',
            email: 'vikram@enterprises.com',
            phone: '9876543214',
            city: 'CHANDIGARH',
            propertyType: 'OFFICE',
            purpose: 'RENT',
            budgetMin: 50000,
            budgetMax: 100000,
            timeline: 'THREE_TO_SIX_MONTHS',
            source: 'WEBSITE',
            status: 'NEGOTIATION',
            notes: 'Looking for office space for IT company',
            tags: ['commercial', 'IT', 'parking'],
            ownerId: adminUser.id
        }
    ];
    for (const buyerData of sampleBuyers) {
        const buyer = await prisma.buyer.create({
            data: buyerData
        });
        // Create initial history entry
        await prisma.buyerHistory.create({
            data: {
                buyerId: buyer.id,
                changedBy: buyerData.ownerId,
                diff: {
                    action: 'created',
                    changes: buyerData
                }
            }
        });
        console.log('✅ Created buyer:', buyer.fullName);
    }
    console.log('🎉 Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map