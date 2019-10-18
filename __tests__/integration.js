/**
 * These tests currently only work if you have a local MongoDB database
 */
const app = require('../app/app');
const request = require('supertest');
const mongoose = require('mongoose');
const { RegtestUtils } = require('regtest-client');
const { MyWallet } = require('../app/models');
const { LocalProvider } = require('../app/providers');
const { WalletService } = require('../app/services');

const APIPASS = process.env.APIPASS || 'satoshi';
const APIURL = process.env.APIURL || 'https://regtest.bitbank.cc/1';
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });


beforeEach(async () => {
});

afterEach(async () => {
});


afterAll(async () => {
  // CLEAN UP
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('POST /wallets', () => {
  let wallet1, wallet2;
  test('Create wallets', async () => {
    const alias1 = 'wallet1';
    const { body: { name1 } } = await request(app).post('/api/wallets').send({alias1});
    expect(name1).toEqual(alias1);
    
    const alias2 = 'wallet2';
    const { body: { name2 } } = await request(app).post('/api/wallets').send({alias2});
    expect(name2).toEqual(alias2);

  });

  test('GET wallet', async () => {
    const alias = 'wallet1';
    const { body: { address } } = await request(app).get(`/api/wallets/${alias}`);
    expect(address).not.toBe(undefined);
    expect(address).not.toBe(null);
    expect(address.length).not.toBe(0);
  });

  test('Transactions', async () => {
      const service = new WalletService();
      const wallet1 = await service.getWallet('wallet1');
      const wallet2 = await service.getWallet('wallet2');
  })
});
