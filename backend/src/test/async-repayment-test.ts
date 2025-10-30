/**
 * Test script for async repayment functionality
 * This script demonstrates how to use the new async repayment API
 */

import { io } from 'socket.io-client';

// Socket.IO client for testing
const socket = io('http://localhost:9487', {
  transports: ['websocket', 'polling'],
});

// Test user ID (replace with actual user ID from your system)
const TEST_USER_ID = 'test-user-123';

// Connect to Socket.IO
socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');
  
  // Join user room for receiving updates
  socket.emit('join-user-room', TEST_USER_ID);
  console.log(`✅ Joined user room: user-${TEST_USER_ID}`);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO server');
});

// Listen for repayment progress updates
socket.on('repayment-progress', (data: any) => {
  console.log('📊 Repayment Progress:', {
    jobId: data.jobId,
    tokenId: data.tokenId,
    stage: data.stage,
    progress: `${data.progress}%`,
    message: data.message,
    timestamp: data.timestamp,
  });
});

// Listen for repayment completion
socket.on('repayment-complete', (data: any) => {
  console.log('✅ Repayment Complete:', {
    jobId: data.jobId,
    tokenId: data.tokenId,
    success: data.success,
    data: data.data,
    timestamp: data.timestamp,
  });
});

// Listen for repayment errors
socket.on('repayment-error', (data: any) => {
  console.log('❌ Repayment Error:', {
    error: data.error,
    timestamp: data.timestamp,
  });
});

/**
 * Test function to trigger async repayment
 */
async function testAsyncRepayment() {
  try {
    console.log('🚀 Testing async repayment...');
    
    // Example request payload (replace with actual values)
    const repaymentData = {
      tokenId: '0.0.123456', // Replace with actual token ID
      sagId: 'sag-123',      // Replace with actual SAG ID
    };
    
    // Make API call to trigger async repayment
    const response = await fetch('http://localhost:9487/api/v1/pawnshop/repayment/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual JWT token
      },
      body: JSON.stringify(repaymentData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Async repayment queued successfully:', result.data);
      
      // Monitor job status
      const jobId = result.data.jobId;
      console.log(`📋 Monitoring job ${jobId}...`);
      
      // Check job status every 5 seconds
      const statusInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:9487/api/v1/pawnshop/repayment/status/${jobId}`, {
            headers: {
              'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual JWT token
            },
          });
          
          const statusResult = await statusResponse.json();
          
          if (statusResult.success) {
            console.log('📊 Job Status:', {
              state: statusResult.data.state,
              progress: `${statusResult.data.progress || 0}%`,
              attemptsMade: statusResult.data.attemptsMade,
            });
            
            // Stop monitoring if job is completed or failed
            if (statusResult.data.state === 'completed' || statusResult.data.state === 'failed') {
              clearInterval(statusInterval);
              console.log('🏁 Job monitoring stopped');
            }
          }
        } catch (error) {
          console.error('❌ Error checking job status:', error);
        }
      }, 5000);
      
    } else {
      console.error('❌ Failed to queue async repayment:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing async repayment:', error);
  }
}

/**
 * Test function to check Socket.IO connection
 */
function testSocketConnection() {
  console.log('🔌 Testing Socket.IO connection...');
  
  // Test if we can emit and receive events
  socket.emit('test-event', { message: 'Hello from test client' });
  
  // Listen for test response
  socket.on('test-response', (data: any) => {
    console.log('📡 Received test response:', data);
  });
}

// Export functions for manual testing
export { testAsyncRepayment, testSocketConnection };

// Auto-run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Starting async repayment tests...');
  
  // Wait for socket connection before running tests
  socket.on('connect', () => {
    setTimeout(() => {
      testSocketConnection();
      // Uncomment the line below to test actual repayment (requires valid data)
      // testAsyncRepayment();
    }, 1000);
  });
}

console.log('📝 Test script loaded. Available functions:');
console.log('  - testAsyncRepayment(): Test the async repayment API');
console.log('  - testSocketConnection(): Test Socket.IO connection');
console.log('');
console.log('⚠️  Note: Replace placeholder values with actual data before testing:');
console.log('  - YOUR_JWT_TOKEN_HERE: Actual JWT token');
console.log('  - tokenId: Actual token ID');
console.log('  - sagId: Actual SAG ID');
console.log('  - TEST_USER_ID: Actual user ID');
