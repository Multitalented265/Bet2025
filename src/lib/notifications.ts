import { prisma } from './db';
import { getAdminSettings } from './data';

interface NotificationData {
  subject: string;
  message: string;
  type: 'newUser' | 'newUserLogin' | 'largeBet' | 'largeDeposit' | 'loginAttempt' | 'systemAlert';
  metadata?: Record<string, any>;
}

export async function sendAdminNotification(notificationData: NotificationData) {
  try {
    const adminSettings = await getAdminSettings();
    
    // Check if notifications are enabled for this type
    let shouldSend = false;
    
    switch (notificationData.type) {
      case 'newUser':
        shouldSend = adminSettings.notifyOnNewUser;
        break;
      case 'newUserLogin':
        shouldSend = adminSettings.notifyOnNewUserLogin;
        break;
      case 'largeBet':
        shouldSend = adminSettings.notifyOnLargeBet;
        break;
      case 'largeDeposit':
        shouldSend = adminSettings.notifyOnLargeDeposit;
        break;
      case 'loginAttempt':
      case 'systemAlert':
        shouldSend = true; // Always send security and system alerts
        break;
    }
    
    if (!shouldSend) {
      console.log(`Notification skipped for type: ${notificationData.type}`);
      return;
    }
    
    // Get all active admin users
    const admins = await prisma.admin.findMany({
      where: { isActive: true }
    });
    
    if (admins.length === 0) {
      console.log('No active admin users found for notifications');
      return;
    }
    
    // In a real application, you would send emails here
    // For now, we'll log the notifications and store them in the database
    console.log('=== ADMIN NOTIFICATION ===');
    console.log(`Subject: ${notificationData.subject}`);
    console.log(`Message: ${notificationData.message}`);
    console.log(`Type: ${notificationData.type}`);
    console.log(`Metadata:`, notificationData.metadata);
    console.log(`Recipients: ${admins.map(a => a.email).join(', ')}`);
    console.log('========================');
    
    // Store notification in database for admin dashboard
    await prisma.adminNotification.create({
      data: {
        subject: notificationData.subject,
        message: notificationData.message,
        type: notificationData.type,
        metadata: notificationData.metadata || {},
        isRead: false
      }
    });
    
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

export async function notifyNewUser(userData: { name: string; email: string }) {
  await sendAdminNotification({
    subject: 'New User Registration',
    message: `A new user has registered on the platform.\n\nName: ${userData.name}\nEmail: ${userData.email}\nTime: ${new Date().toLocaleString()}`,
    type: 'newUser',
    metadata: {
      userName: userData.name,
      userEmail: userData.email,
      registrationTime: new Date().toISOString()
    }
  });
}

export async function notifyNewUserLogin(userData: { name: string; email: string; loginTime: Date }) {
  await sendAdminNotification({
    subject: 'New User First Login',
    message: `A new user has logged in for the first time.\n\nName: ${userData.name}\nEmail: ${userData.email}\nLogin Time: ${userData.loginTime.toLocaleString()}`,
    type: 'newUserLogin',
    metadata: {
      userName: userData.name,
      userEmail: userData.email,
      loginTime: userData.loginTime.toISOString()
    }
  });
}

export async function notifyLargeBet(betData: { 
  userId: string; 
  userName: string; 
  amount: number; 
  candidateName: string 
}) {
  await sendAdminNotification({
    subject: 'Large Bet Alert',
    message: `A large bet has been placed on the platform.\n\nUser: ${betData.userName}\nAmount: ${betData.amount.toLocaleString()} MWK\nCandidate: ${betData.candidateName}\nTime: ${new Date().toLocaleString()}`,
    type: 'largeBet',
    metadata: {
      userId: betData.userId,
      userName: betData.userName,
      amount: betData.amount,
      candidateName: betData.candidateName,
      betTime: new Date().toISOString()
    }
  });
}

export async function notifyLargeDeposit(transactionData: { 
  userId: string; 
  userName: string; 
  amount: number; 
  type: string 
}) {
  await sendAdminNotification({
    subject: 'Large Deposit Alert',
    message: `A large ${transactionData.type.toLowerCase()} has been made.\n\nUser: ${transactionData.userName}\nAmount: ${transactionData.amount.toLocaleString()} MWK\nType: ${transactionData.type}\nTime: ${new Date().toLocaleString()}`,
    type: 'largeDeposit',
    metadata: {
      userId: transactionData.userId,
      userName: transactionData.userName,
      amount: transactionData.amount,
      type: transactionData.type,
      transactionTime: new Date().toISOString()
    }
  });
}

export async function notifyLoginAttempt(loginData: { 
  adminEmail: string; 
  ipAddress: string; 
  isSuccessful: boolean; 
  failureReason?: string 
}) {
  const status = loginData.isSuccessful ? 'Successful' : 'Failed';
  const reason = loginData.failureReason ? `\nReason: ${loginData.failureReason}` : '';
  
  await sendAdminNotification({
    subject: `Admin Login ${status}`,
    message: `Admin login attempt:\n\nEmail: ${loginData.adminEmail}\nIP Address: ${loginData.ipAddress}\nStatus: ${status}${reason}\nTime: ${new Date().toLocaleString()}`,
    type: 'loginAttempt',
    metadata: {
      adminEmail: loginData.adminEmail,
      ipAddress: loginData.ipAddress,
      isSuccessful: loginData.isSuccessful,
      failureReason: loginData.failureReason,
      loginTime: new Date().toISOString()
    }
  });
}

export async function notifySystemAlert(alertData: { 
  subject: string; 
  message: string; 
  severity: 'low' | 'medium' | 'high' 
}) {
  await sendAdminNotification({
    subject: `System Alert: ${alertData.subject}`,
    message: `${alertData.message}\n\nSeverity: ${alertData.severity.toUpperCase()}\nTime: ${new Date().toLocaleString()}`,
    type: 'systemAlert',
    metadata: {
      severity: alertData.severity,
      alertTime: new Date().toISOString()
    }
  });
} 

export async function sendUserNotification(userId: string, notificationData: {
  subject: string;
  message: string;
  type: 'betWon' | 'betLost' | 'betSettled';
  metadata?: Record<string, any>;
}) {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log(`User ${userId} not found for notification`);
      return;
    }

    // Check if user has notifications enabled for bet status updates
    if (!user.notifyOnBetStatusUpdates) {
      console.log(`Notifications disabled for user ${userId}`);
      return;
    }

    // In a real application, you would send emails here
    // For now, we'll log the notifications
    console.log('=== USER NOTIFICATION ===');
    console.log(`Subject: ${notificationData.subject}`);
    console.log(`Message: ${notificationData.message}`);
    console.log(`Type: ${notificationData.type}`);
    console.log(`Recipient: ${user.email}`);
    console.log(`User: ${user.name}`);
    console.log(`Metadata:`, notificationData.metadata);
    console.log('========================');

    // In a real app, you would send an email here
    // Example email sending logic:
    // await sendEmail({
    //   to: user.email,
    //   subject: notificationData.subject,
    //   message: notificationData.message
    // });

  } catch (error) {
    console.error('Error sending user notification:', error);
  }
} 