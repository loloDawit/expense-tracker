/* eslint-disable @typescript-eslint/no-require-imports */
import { faker } from '@faker-js/faker';
import admin from 'firebase-admin';
import path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const uid = 'Wuj9kuZ9lBfauohLd0auZGA2dWC3';
const PLACEHOLDER_IMAGE =
  'https://res.cloudinary.com/demo/image/upload/v1719437133/sample-wallet.jpg'; // replace with your actual wallet image if needed

const seedWalletAndTransactions = async () => {
  const walletRef = db.collection('wallets').doc();

  const walletData = {
    uid,
    name: 'Main Wallet',
    image: PLACEHOLDER_IMAGE,
    amount: 0,
    totalIncome: 0,
    totalExpenses: 0,
    created: admin.firestore.Timestamp.now(),
  };

  await walletRef.set(walletData);
  const walletId = walletRef.id;

  console.log(`✅ Wallet created: ${walletId}`);

  const now = new Date();
  let runningBalance = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  const batch = db.batch();

  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset);

    const isHolidaySeason = [11, 0].includes(month.getMonth()); // Dec, Jan
    const numIncome = faker.number.int({ min: 2, max: 4 });
    const numExpenses = faker.number.int({
      min: 10,
      max: isHolidaySeason ? 25 : 15,
    });

    // Seed incomes first
    for (let i = 0; i < numIncome; i++) {
      const amount = faker.number.int({ min: 1000, max: 5000 });
      const date = faker.date.between({
        from: new Date(month.getFullYear(), month.getMonth(), 1),
        to: new Date(month.getFullYear(), month.getMonth() + 1, 0),
      });

      const income = {
        uid,
        walletId,
        amount,
        type: 'income',
        category: faker.helpers.arrayElement([
          'salary',
          'freelance',
          'bonus',
          'investment',
        ]),
        date: admin.firestore.Timestamp.fromDate(date),
        description: faker.company.catchPhrase(),
        image: null,
      };

      const ref = db.collection('transactions').doc();
      batch.set(ref, income);

      runningBalance += amount;
      totalIncome += amount;
    }

    // Seed expenses only if they can be covered by balance
    for (let i = 0; i < numExpenses; i++) {
      const amount = faker.number.int({ min: 5, max: 600 });
      if (runningBalance < amount) continue; // skip if not enough balance

      const date = faker.date.between({
        from: new Date(month.getFullYear(), month.getMonth(), 1),
        to: new Date(month.getFullYear(), month.getMonth() + 1, 0),
      });

      const expense = {
        uid,
        walletId,
        amount,
        type: 'expense',
        category: faker.helpers.arrayElement([
          'groceries',
          'rent',
          'utilities',
          'insurance',
          'transportation',
          'entertainment',
          'subscriptions',
          'healthcare',
          'restaurants',
          'shopping',
          'travel',
        ]),
        date: admin.firestore.Timestamp.fromDate(date),
        description: faker.commerce.productName(),
        image: null,
      };

      const ref = db.collection('transactions').doc();
      batch.set(ref, expense);

      runningBalance -= amount;
      totalExpenses += amount;
    }
  }

  // Update wallet totals
  batch.update(walletRef, {
    amount: runningBalance,
    totalIncome,
    totalExpenses,
  });

  await batch.commit();
  console.log(
    '✅ Seeded 12 months of realistic transactions and updated wallet balance.',
  );
};

seedWalletAndTransactions().catch((err) => {
  console.error('❌ Failed to seed data:', err);
});
