import https from 'https';
import http from 'http';

export async function uploadJsonToIpfs(jsonData: any): Promise<string> {
  // Convert JSON object to a string
  const jsonString = JSON.stringify(jsonData);

  // Try Pinata first if API key is available
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  let pinataError: any = null;

  if (pinataApiKey && pinataSecretApiKey) {
    try {
      console.log('Using Pinata IPFS...');
      return await uploadToPinata(jsonString, pinataApiKey, pinataSecretApiKey);
    } catch (error) {
      pinataError = error;
      console.warn('Pinata IPFS failed:', pinataError instanceof Error ? pinataError.message : pinataError);
      // Continue to try local IPFS as fallback
    }
  } else {
    console.warn('Pinata credentials not found. Please add PINATA_API_KEY and PINATA_SECRET_API_KEY to your .env file');
  }

  // Fallback: try local IPFS node
  console.log('Trying local IPFS node...');
  try {
    return await uploadToLocalIpfs(jsonString);
  } catch (localError) {
    console.error('Local IPFS also failed:', localError instanceof Error ? localError.message : localError);
    
    // Provide helpful error message
    throw new Error(`IPFS upload failed. Please either:
1. Set up Pinata credentials in your .env file:
   PINATA_API_KEY=your_api_key
   PINATA_SECRET_API_KEY=your_secret_key
   Get free API keys at: https://app.pinata.cloud
   
2. Or install and run a local IPFS node:
   - Install IPFS: https://ipfs.io/docs/install/
   - Run: ipfs daemon
   
Original errors:
- Pinata: ${pinataApiKey ? (pinataError instanceof Error ? pinataError.message : 'Unknown error') : 'No credentials provided'}
- Local IPFS: ${localError instanceof Error ? localError.message : 'Unknown error'}`);
  }
}

function uploadToPinata(jsonString: string, apiKey: string, secretApiKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create form data for file upload
    const boundary = '----formdata-' + Math.random().toString(36);
    const formData = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="metadata.json"\r\nContent-Type: application/json\r\n\r\n${jsonString}\r\n--${boundary}--\r\n`;

    const options = {
      hostname: 'api.pinata.cloud',
      port: 443,
      path: '/pinning/pinFileToIPFS',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData),
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretApiKey
      }
    };

    console.log('Attempting Pinata IPFS upload...');

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('Pinata response status:', res.statusCode);
        console.log('Pinata response body:', body);
        
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(body);
            const ipfsUrl = `${result.IpfsHash}`;
            resolve(ipfsUrl);
          } else if (res.statusCode === 401) {
            reject(new Error(`Pinata IPFS authentication failed. Please check:
1. Your API key and secret are correct
2. Your Pinata account is active
3. Visit https://app.pinata.cloud to verify your API keys

Response: ${body}`));
          } else {
            reject(new Error(`Pinata IPFS upload failed with status ${res.statusCode}: ${body}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Pinata response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Pinata IPFS request failed: ${error.message}`));
    });

    req.write(formData);
    req.end();
  });
}

function uploadToLocalIpfs(jsonString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create form data for file upload
    const boundary = '----formdata-' + Math.random().toString(36);
    const formData = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="metadata.json"\r\nContent-Type: application/json\r\n\r\n${jsonString}\r\n--${boundary}--\r\n`;

    const options = {
      host: 'localhost',
      port: 5001,
      path: '/api/v0/add',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(body);
            const ipfsUrl = `ipfs://${result.Hash}/metadata.json`;
            console.log('CID of uploaded JSON (local):', result.Hash);
            console.log('IPFS URL:', ipfsUrl);
            resolve(ipfsUrl);
          } else {
            reject(new Error(`Local IPFS upload failed with status ${res.statusCode}: ${body}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse local IPFS response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Local IPFS request failed: ${error.message}`));
    });

    req.write(formData);
    req.end();
  });
}
export async function fetchJsonFromIpfs(ipfsUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 5001,
      path: `/api/v0/cat?arg=${ipfsUrl.split('//')[1].split('/')[0]}`,
      method: 'GET',
    };
    console.log('Fetching JSON from IPFS:', options);
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body);
      });

    });
  });
}

