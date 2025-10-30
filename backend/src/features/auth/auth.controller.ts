// Model
import { CompanyAdminType, SuperAdminType, UserLogin, UserType, UserRoleType, RolePermission, RolePermissionType } from '@/features/auth/auth.model.js';
// Repository
import { getUserByEmail, getUserByContactNo, getSuperAdminByContactNo, getCompanyAdminByContactNo, getSuperAdminByEmail, getCompanyAdminByEmail, createUser, createCompanyAdmin, getUserDataByToken, getCompanyAdminDataByToken, getSuperAdminDataByToken, createUserRole, getUserRole, updateUserRole, getRolePermissionByRoleId, createRolePermission, updateRolePermission, getRolePermision, updateUser } from '@/features/auth/auth.repository.js';
import { HederaAccountRepository } from '@/features/hedera/account/account.repository.js';
// Types
import { Request, Response, NextFunction } from 'express';
// JWT
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/features/jwt/index.js';
import { UserTokenInfo } from '@/features/jwt/jwt.model.js';
// Error Types
import { Error } from '@/error/index.js';
// Util
import { isEmail } from '@/util/email-checker.js';
import { isContactNo } from '@/util/contact-number-checker.js';
import { hashPassword, comparePassword } from '@/util/password-checker.js';
import { db } from '@/db';

// User Login
export const userLogin = async (req: Request, res: Response) => {
  try {
    const userInfo: UserLogin = req.body;
    // Validate input
    if (!userInfo.username || !userInfo.password) {
      return res.status(400).json({
        success: false,
        message: 'Username and Password are required',
        data: null,
      });
    }

    const username = userInfo.username;

    let user: UserType | null = null;
    let loginType = '';

    // Fetch user based on username type
    if (isEmail(username)) {
      user = await getUserByEmail(username);
      loginType = 'EMAIL';  
    } else if (isContactNo(username)) {
      user = await getUserByContactNo(username);
      loginType = 'CONTACT_NO';
    } 

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: Error.INVALID_CREDENTIALS,
        data: null,
      });
    }

    const userTokenInfo: UserTokenInfo = {
      username: userInfo.username,
      loginType: loginType as 'EMAIL' | 'CONTACT_NO', 
      roleName: user.roleId ? user.roleId : ''
    };

    const hashedPassword = user.userPassword; 

    verifyPassword(userTokenInfo, userInfo.password, hashedPassword, res);

  } catch (error) {
    console.error('User Login error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null,
    });
  }
};

// Admin Login (Company Admin and Super Admin)
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const userInfo: UserLogin = req.body;

    if (!userInfo.username) {
      return res.status(400).json({
        status: false,
        message: 'Username and Password are required',
        data: null,
      });
    }
    
    const username = userInfo.username;
    
    let user: SuperAdminType | CompanyAdminType | null = null;
    let loginType = '';
    let userType = '';
    
    const fetchSuperAdmin  = async () => {
      if (isEmail(username)) {
        loginType = 'EMAIL';
        return await getSuperAdminByEmail(username);
      } else if (isContactNo(username)) {
        loginType = 'CONTACT_NO';
        return await getSuperAdminByContactNo(username);
      }
      return null;
    };
    
    const fetchCompanyAdmin = async () => {
      if (isEmail(username)) {
        loginType = 'EMAIL';
        return await getCompanyAdminByEmail(username);
      } else if (isContactNo(username)) {
        loginType = 'CONTACT_NO';
        return await getCompanyAdminByContactNo(username);
      }
      return null;
    };
    
    // Try to get Super Admin
    user = await fetchSuperAdmin();
    userType = user ? 'SUPER_ADMIN' : '';
    
    // If no Super Admin found, try Company Admin
    if (!user) {
      user = await fetchCompanyAdmin();
      userType = user ? 'COMPANY_ADMIN' : '';
    }
    
    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: Error.INVALID_CREDENTIALS,
        data: null,
      });
    }
    
    const userTokenInfo: UserTokenInfo = {
      username: userInfo.username,
      loginType: loginType as 'EMAIL' | 'CONTACT_NO',
      roleName: user.roleId ? user.roleId : ''
    };
    
    const getHashedPassword = (user: any, userType: string): string => {
      if (userType === 'SUPER_ADMIN') {
        return Array.isArray(user) ? user[0].superAdminPassword : user.superAdminPassword;
      } else if (userType === 'COMPANY_ADMIN') {
        return Array.isArray(user) ? user[0].companyAdminPassword : user.companyAdminPassword;
      }
      return '';
    };
    
    const hashedPassword = getHashedPassword(user, userType);
    
    verifyPassword(userTokenInfo, userInfo.password, hashedPassword, res);
     
  } catch (error) {
    console.error('Admin Login error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// User Registration
export const registerUser = async (req: Request, res: Response) => {
  const userInfo = req.body;
  try {
    // Check if a user with the same email or contact already exists
    const existingUser = await getUserByEmail(userInfo.userEmail) 
      || await getUserByContactNo(userInfo.userContactNo);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: Error.USER_ALREADY_EXISTS,
        data: null
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(userInfo.userPassword);
    
    const userData: UserType = {
      userEmail: userInfo.userEmail,
      balance: 0,
      userContactNo: userInfo.userContactNo,
      userPassword: hashedPassword,
      icNo: userInfo.icNo,
      icFrontPicture: 'front_picture', // TODO: Add default image 
      icBackPicture: 'back_picture', // TODO: Add default image
      userFirstName: userInfo.userFirstName,
      userLastName: userInfo.userLastName,
      gender: userInfo.gender,
      accountId: '',
      addressId: userInfo.addressId,
      companyId: userInfo.companyId,
      vehicleId: userInfo.vehicleId,
      walletId: userInfo.walletId,
      userSkillId: userInfo.userSkillId,
      jobReviewId: userInfo.jobReviewId,
      roleId: userInfo.roleId,
      sessionId: null,
      status: 'ACTIVE',
      createdBy: 'system',
      updatedBy: 'system'
    };
    try {
      await db.transaction(async (tx) => {
        const createdUser = await createUser(userData, tx);
        const createdHederaAccount = await new HederaAccountRepository().createAccount({ 
          accountName: userData.userFirstName + ' ' + userData.userLastName, 
          accountType: 'USER', 
            network: 'testnet', 
            isOperator: false 
          }, tx);
        userData.accountId = createdHederaAccount.accountId;
        await updateUser(createdUser[0].userId, userData, tx);
      });
    } catch (error) {
      console.error('User Registration error:', error);
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registration successful',
      data: null
    });

  } catch (error) {
    console.error('User Registration error:', error);
    return res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// Role Create
export const roleCreate = async (req: Request, res: Response) => {
  const roleInfo = req.body;
  console.log(roleInfo)
  try {
    // Check if a user role with the same role name already exists
    const existingUserRole = await getUserRole(roleInfo.roleName);

    if (existingUserRole) {
      return res.status(409).json({
        success: false,
        message: Error.USER_ROLE_ALREADY_EXISTS,
        data: null
      });
    }

    const currentDateTime = new Date();
    const userRole: UserRoleType = {
      roleName:      roleInfo.roleName,
      permissionId:  roleInfo.permissionId,
      status:        roleInfo.status,
      createdAt:    currentDateTime, // Timestamp type
      updatedAt:    currentDateTime, // Timestamp type
      createdBy: 'system',
      updatedBy: 'system'
    };

    await createUserRole(userRole);

    res.status(201).json({
      success: true,
      message: 'User role registration successful',
      data: userRole
    });

  } catch (error) {
    console.error('User Role Registration error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: Error.UNAUTHORIZED,
      data: null
    });
  }

  const user = await getUserDataByToken(token);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: Error.USER_NOT_FOUND,
      data: null
    });
  }

  return user;
};

// Role Update
export const roleUpdate = async (req: Request, res: Response) => {
  const roleInfo = req.body;
  console.log(roleInfo)

  try {
    // Check if a user role with the same role name already exists
    const existingUserRole = await getUserRole(roleInfo.roleName);

    if (existingUserRole) {
      return res.status(409).json({
        success: false,
        message: Error.USER_ROLE_ALREADY_EXISTS,
        data: null
      });
    }

    const currentDateTime = new Date();

    // Ensure roleId is a string without curly braces
    const userRole: UserRoleType = {
      roleId:         roleInfo.roleId,
      roleName:       roleInfo.roleName,
      permissionId:   roleInfo.permissionId,
      status:         roleInfo.status,
      createdAt:      roleInfo.createdAt, // Timestamp type
      updatedAt:      currentDateTime, // Timestamp type
      createdBy:      roleInfo.createdBy,
      updatedBy:      roleInfo.updatedBy
    };

    await updateUserRole(userRole);

    res.status(201).json({
      success: true,
      message: 'User role update successful',
      data: userRole
    });

  } catch (error) {
    console.error('User Role update error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// Permission Create
export const permissionCreate = async (req: Request, res: Response) => {
  const permissionInfo = req.body;
  console.log(permissionInfo)
  try {
    // Check if a user role with the same role name already exists
    const existingRolePermission = await getRolePermision(permissionInfo.permissionName);

    if (existingRolePermission) {
      return res.status(409).json({
        success: false,
        message: Error.ROLE_PERMISSION_ALREADY_EXISTS,
        data: null
      });
    }

    const currentDateTime = new Date();
    const rolePermission: RolePermissionType = {
      permissionId:  permissionInfo.permissionId,
      permissionName:      permissionInfo.permissionName,
      policy:        permissionInfo.policy,
      status:        permissionInfo.status,
      createdAt:    currentDateTime, // Timestamp type
      updatedAt:    currentDateTime, // Timestamp type
      createdBy: 'system',
      updatedBy: 'system'
    };

    await createRolePermission(rolePermission);

    res.status(201).json({
      success: true,
      message: 'Role Permission created successful',
      data: rolePermission
    });

  } catch (error) {
    console.error('Role Permission Registration error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// Permission Update
export const permissionUpdate = async (req: Request, res: Response) => {
  const permissionInfo = req.body;
  console.log(permissionInfo)

  try {
    // Check if a role permission with the same permission name already exists
    const existingRolePermission = await getRolePermision(permissionInfo.permissionName);

    if (existingRolePermission) {
      return res.status(409).json({
        success: false,
        message: Error.ROLE_PERMISSION_ALREADY_EXISTS,
        data: null
      });
    }

    const currentDateTime = new Date();

    // Ensure roleId is a string without curly braces
    const rolePermission: RolePermissionType = {
      permissionId:  permissionInfo.permissionId,
      permissionName:      permissionInfo.permissionName,
      policy:        permissionInfo.policy,
      status:        permissionInfo.status,
      createdAt:    permissionInfo.createdAt, // Timestamp type
      updatedAt:    currentDateTime, // Timestamp type
      createdBy:      permissionInfo.createdBy,
      updatedBy:      permissionInfo.updatedBy
    };

    await updateRolePermission(rolePermission);

    res.status(201).json({
      success: true,
      message: 'Role Permission update successful',
      data: rolePermission
    });

  } catch (error) {
    console.error('Role Permission update error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// Company Admin Registration
export const registerCompanyAdmin = async (req: Request, res: Response) => {
  const adminInfo = req.body;

  try {
    // Check if a company admin with the same email or contact already exists
    const existingAdmin = await getCompanyAdminByEmail(adminInfo.companyAdminEmail) 
      || await getCompanyAdminByContactNo(adminInfo.companyAdminContactNo);

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: Error.USER_ALREADY_EXISTS,
        data: null
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(adminInfo.companyAdminPassword);
    
    const adminData: CompanyAdminType = {
      companyAdminFirstName: adminInfo.companyAdminFirstName,
      companyAdminLastName: adminInfo.companyAdminLastName,
      companyAdminContactNo: adminInfo.companyAdminContactNo,
      companyAdminPassword: hashedPassword,
      companyAdminEmail: adminInfo.companyAdminEmail,
      companyId: adminInfo.companyId,
      boolModule: adminInfo.boolModule,
      moduleAccessId: adminInfo.moduleAccessId,
      boolPermission: adminInfo.boolPermission,
      roleId: adminInfo.roleId,
      sessionId: null,
      status: 'ACTIVE',
      createdBy: 'system',
      updatedBy: 'system'
    };

    await createCompanyAdmin(adminData);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: null
    });

  } catch (error) {
    console.error('Company Admin Registration error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

export const getUserByToken = async (req: Request, res: Response) => {
  // get Bearer token from header
  const token = req.headers.authorization?.startsWith('Bearer ') 
    ? req.headers.authorization.split(' ')[1] 
    : null; // Check for Bearer prefix

  if (!token) {
    return res.status(401).json({
      success: false,
      message: Error.TOKEN_IS_REQUIRED,
      data: null
    });
  }

  try {
    const user = await getUserDataByToken(token);
    

    if (!user) {
      return res.status(404).json({
        success: false,
        message: Error.USER_NOT_FOUND,
        data: null
      });
    }

    const hederaAccount = await new HederaAccountRepository().getAccountInfo(user?.accountId);
    // const permissionId = await getRolePermissionByRoleId(user.roleId ? user.roleId : '');

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        userInfo: user,
        hederaAccount: hederaAccount
      }
    });
  } catch (error) {
    console.error('Error in getUserByToken:', error);
    return res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
}

export const getCompanyAdminByToken = async (req: Request, res: Response) => {
  // get Bearer token from header
  const token = req.headers.authorization?.startsWith('Bearer ') 
    ? req.headers.authorization.split(' ')[1] 
    : null; // Check for Bearer prefix

  if (!token) {
    return res.status(401).json({
      success: false,
      message: Error.UNAUTHORIZED,
      data: null
    });
  }

  const user = await getCompanyAdminDataByToken(token);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: Error.USER_NOT_FOUND,
      data: null
    });
  } 
}

export const getSuperAdminByToken = async (req: Request, res: Response) => {
  // get Bearer token from header
  const token = req.headers.authorization?.startsWith('Bearer ') 
    ? req.headers.authorization.split(' ')[1] 
    : null; // Check for Bearer prefix

  if (!token) {
    return res.status(401).json({
      success: false,
      message: Error.UNAUTHORIZED,
      data: null
    });
  }

  const user = await getSuperAdminDataByToken(token);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: Error.USER_NOT_FOUND,
      data: null
    });
  } 
}
// Refresh Token - Need to be updated


// Verify Password
const verifyPassword = async (userTokenInfo: UserTokenInfo, password: string, hashedPassword: string, res: Response) => {
  try {
    const isPasswordCorrect = await comparePassword(password, hashedPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Username or Password Incorrect',
        data: null
      });
    }

    const accessToken = generateAccessToken(userTokenInfo);
    const refreshToken = generateRefreshToken(userTokenInfo);
    const accessTokenExpiration = verifyToken(accessToken).exp;

    if (accessTokenExpiration === undefined) {
      console.error('Verify Password Error: Token expiration is undefined');
      return res.status(500).json({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: '',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiredAt: accessTokenExpiration * 1000,
        roleName: userTokenInfo.roleName
      }
    });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// Get Account Balance
export const getAccountBalance = async (req: Request, res: Response) => {
  const accountId = req.body.accountId;
  const balance = await new HederaAccountRepository().getAccountBalance(accountId);
  return res.status(200).json({
    success: true,
    message: 'Account balance fetched successfully',
    data: balance
  });
}

export const refreshToken = async (req: Request, res: Response) => {
  // const cookies = req.headers.cookie;
  // const refreshToken = cookies?.split('=')[1];
  
  const body = req.body;
  console.log(body);
  const refreshToken = body.refreshToken;
  // console.log(refreshToken);

  // const refreshToken = '';

  if (!refreshToken) {
    return res.status(401).json({ message: Error.UNAUTHORIZED });
  }

  try {
    // Verify the refresh token
    const verifiedToken = verifyToken(refreshToken);

    if ('statusCode' in verifiedToken) {
      return res.status(401).json({ message: Error.UNAUTHORIZED });
    }

    let user: UserType | null = null;
    let loginType = '';

    // Generate a new access token using the information from the refresh token
    const newAccessToken = generateAccessToken({
      username: verifiedToken.username,
      loginType: "EMAIL",
      roleName: verifiedToken.roleName
    });

    // Return the new access token
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: Error.INTERNAL_SERVER_ERROR });
  }
}

