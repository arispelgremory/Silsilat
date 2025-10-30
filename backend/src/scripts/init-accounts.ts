import { getUserByEmail, createUser, updateUser, getUserRole } from '@/features/auth/auth.repository';
import { hashPassword } from '@/util/password-checker';
import { UserType } from '@/features/auth/auth.model';
import { db } from '@/db';
import { HederaAccountRepository } from '@/features/hedera/account/account.repository';
import { hederaTokenRepository } from '@/features/hedera/token/token.repository';
import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import { decryptPrivateKey, encryptPrivateKey } from '@/util/encryption';

type UserData = Omit<UserType, 'userId' | 'createdAt' | 'updatedAt'>;

/**
 * Create a user account with Hedera account
 */
async function createUserWithHederaAccount(userData: UserData): Promise<void> {
  await db.transaction(async (tx) => {
    const createdUser = await createUser(userData, tx);
    const createdHederaAccount = await new HederaAccountRepository().createAccount({ 
      accountName: `${userData.userFirstName} ${userData.userLastName}`, 
      accountType: 'USER', 
      network: 'testnet', 
      isOperator: false 
    }, tx);
    
    userData.accountId = createdHederaAccount.accountId;
    await updateUser(createdUser[0].userId, userData, tx);
  });
}

/**
 * Create platform account if it doesn't exist
 */
async function initPlatformAccount(): Promise<void> {
  console.log('🔍 Checking for user...');
  
  const email = 'platform@silsilat.finance';
  const password = 'platform123';
  const existingPlatformUser = await getUserByEmail(email);
  
  if (!existingPlatformUser) {
    console.log('📝 Creating platform user account...');
    
    const hashedPassword = await hashPassword(password);

    const userData = {
      userEmail: 'platform@silsilat.finance',
      balance: 0,
      userContactNo: '+60123567890',
      userPassword: hashedPassword,
      icNo: '000000000002',
      icFrontPicture: 'default_front.jpg',
      icBackPicture: 'default_back.jpg',
      userFirstName: 'Silsilat',
      userLastName: 'Platform',
      gender: 'M',
      accountId: '',
      addressId: 'DEFAULT_ADDRESS',
      companyId: 'DEFAULT_COMPANY',
      vehicleId: null,
      walletId: 'DEFAULT_WALLET',
      userSkillId: null,
      jobReviewId: null,
      roleId: 'platform',
      sessionId: null,
      status: 'ACTIVE',
      createdBy: 'system',
      updatedBy: 'system'
    }; 

    const newPrivateKey = PrivateKey.generateECDSA();
    const newPublicKey = newPrivateKey.publicKey;

    await db.transaction(async (tx) => {
      const createdUser = await createUser(userData, tx);
      const createdHederaAccount = await new HederaAccountRepository().createHederaAccount({
        hederaAccountId: process.env.ADMIN_HEDERA_ACCOUNT_ID || '',
        accountName: `${userData.userFirstName} ${userData.userLastName}`, 
        publicKey: newPublicKey.toString(),
        privateKey: encryptPrivateKey(newPrivateKey.toString()),
        accountType: 'USER', 
        balance: '0',
        status: 'ACTIVE',
        isOperator: true,
        network: 'testnet',
        createdBy: 'system',
        updatedBy: 'system'
      }, tx);

      userData.accountId = createdHederaAccount.accountId!;
      await updateUser(createdUser[0].userId, userData, tx);
    });
    
    console.log('✅ Platform user account created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log('✓ Platform user account already exists');
  }
}

/**
 * Create admin user (pawnshop) account if it doesn't exist
 */
async function initAdminUser(): Promise<void> {
  console.log('🔍 Checking for admin user...');
  
  const email = 'admin@silsilat.finance';
  const password = 'admin123';
  const existingAdminUser = await getUserByEmail(email);
  
  if (!existingAdminUser) {
    console.log('📝 Creating admin user account...');

    const hashedPassword = await hashPassword(password);

    await createUserWithHederaAccount({
      userEmail: email,
      balance: 0,
      userContactNo: '+60123567891',
      userPassword: hashedPassword,
      icNo: '000000000000',
      icFrontPicture: 'default_front.jpg',
      icBackPicture: 'default_back.jpg',
      userFirstName: 'Silsilat',
      userLastName: 'Admin',
      gender: 'M',
      accountId: '',
      addressId: 'DEFAULT_ADDRESS',
      companyId: 'DEFAULT_COMPANY',
      vehicleId: null,
      walletId: 'DEFAULT_WALLET',
      userSkillId: null,
      jobReviewId: null,
      roleId: 'admin',
      sessionId: null,
      status: 'ACTIVE',
      createdBy: 'system',
      updatedBy: 'system'
    });
    
    console.log('✅ Admin user account created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log('✓ Admin user account already exists');
  }
}

/**
 * Create investor user account if it doesn't exist
 */
async function initInvestorUser(): Promise<void> {
  console.log('🔍 Checking for investor user...');
  
  const email = 'investor@silsilat.finance';
  const password = 'investor123';
  const existingInvestorUser = await getUserByEmail(email);
  
  if (!existingInvestorUser) {
    console.log('📝 Creating investor user account...');

    const hashedPassword = await hashPassword(password);

    await createUserWithHederaAccount({
      userEmail: email,
      balance: 0,
      userContactNo: '+60123567892',
      userPassword: hashedPassword,
      icNo: '000000000001',
      icFrontPicture: 'default_front.jpg',
      icBackPicture: 'default_back.jpg',
      userFirstName: 'Silsilat',
      userLastName: 'Investor',
      gender: 'M',
      accountId: '',
      addressId: 'DEFAULT_ADDRESS',
      companyId: 'DEFAULT_COMPANY',
      vehicleId: null,
      walletId: 'DEFAULT_WALLET',
      userSkillId: null,
      jobReviewId: null,
      roleId: 'investor',
      sessionId: null,
      status: 'ACTIVE',
      createdBy: 'system',
      updatedBy: 'system' 
    });
    
    console.log('✅ Investor user account created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } else {  
    console.log('✓ Investor user account already exists');
  }
}

/**
 * Get decrypted keys for admin account
 */
async function getAdminAccountKeys() {
  const adminAccount = await new HederaAccountRepository().getAccountByHederaId(
    process.env.ADMIN_HEDERA_ACCOUNT_ID || ''
  );
  
  if (!adminAccount) {
    throw new Error('Admin account not found. Cannot create LQT token.');
  }
  
  const hashedPrivateKey = decryptPrivateKey(
    adminAccount.privateKey || '', 
    process.env.ENCRYPTION_MASTER_KEY || ''
  );
  const hashedPublicKey = PublicKey.fromString(adminAccount.publicKey || '');
  
  return {
    adminAccount,
    privateKey: PrivateKey.fromStringECDSA(hashedPrivateKey),
    publicKey: hashedPublicKey
  };
}

/**
 * Create LQT (Liquidity Token) if it doesn't exist
 */
async function initLQTToken(): Promise<void> {
  console.log('🔍 Checking for LQT (Liquidity Token)...');
  
  try {
    const existingLQTToken = await hederaTokenRepository.findFungibleTokenBySymbol('LQT');
    
    if (!existingLQTToken) {
      console.log('📝 Creating LQT (Liquidity Token)...');
      
      const { adminAccount, privateKey, publicKey } = await getAdminAccountKeys();
      
      const lqtParams = {
        name: 'Liquidity Token',
        symbol: 'LQT',
        treasuryAccountId: adminAccount.hederaAccountId,
        treasuryPrivateKey: privateKey,
        supplyKey: publicKey,
        adminKey: publicKey,
        freezeKey: publicKey,
        wipeKey: publicKey,
        initialSupply: 1000000, // Initial supply of 1,000,000 LQT
        price: 1,
        expiredAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      };
      
      const result = await hederaTokenRepository.createFungibleToken(lqtParams);
      
      console.log('✅ LQT token created successfully!');
      console.log(`   Token ID: ${result.tokenId}`);
      console.log(`   Transaction ID: ${result.transactionId}`);
      console.log(`   Add this to your .env file: FUNGIBLE_TOKEN_ID=${result.tokenId}`);
    } else {
      console.log('✓ LQT token already exists');
      console.log(`   Token ID: ${existingLQTToken.tokenId}`);
      console.log(`   Symbol: ${existingLQTToken.symbol}`);
      console.log(`   Total Supply: ${existingLQTToken.totalSupply}`);
    }
  } catch (error) {
    console.error('⚠️  Failed to initialize LQT token:', error);
    throw error; // Re-throw so initAccounts() knows it failed
  }
}

/**
 * Main initialization function
 */
export async function initAccounts() {
  console.log('🔍 Starting accounts initialization...\n');
  
  try {
    await initPlatformAccount();
    await initAdminUser();
    await initInvestorUser();
    await initLQTToken();
    
    console.log('✅ Accounts initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing accounts:', error);
    throw error;
  }
}

