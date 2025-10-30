import os
import sys
import json
import requests
from typing import Optional, Any
from base64 import b64decode, b64encode
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

# Helper function to print logs to stderr only
def log(msg):
    """Print log messages to stderr to avoid polluting stdout"""
    print(msg, file=sys.stderr, flush=True)


def decrypt_message(encrypted_message: str, encryption_key: str) -> str:
    """
    Decrypt a message encrypted using AES-256-GCM.
    Expects base64-encoded string in format: iv:tag:ciphertext
    
    Args:
        encrypted_message: The encrypted message in format "iv:tag:ciphertext"
        encryption_key: The encryption key used to encrypt the message
        
    Returns:
        The decrypted message as a string
        
    Raises:
        ValueError: If the encrypted message format is invalid
        Exception: If decryption fails (wrong key, tampered data, etc.)
    """
    if not encryption_key:
        return encrypted_message  # Return as-is if no encryption key
    
    try:
        # Parse the encrypted message format: iv:tag:ciphertext
        parts = encrypted_message.split(':')
        if len(parts) != 3:
            raise ValueError(f"Invalid encrypted message format. Expected 3 parts (iv:tag:ciphertext), got {len(parts)}")
        
        # Decode the base64-encoded components
        iv = b64decode(parts[0])
        tag = b64decode(parts[1])
        ciphertext = b64decode(parts[2])
        
        # Derive the same 32-byte key using PBKDF2HMAC (must match encryption parameters)
        salt = b'hedera-topic-salt'  # Must match the salt used in encryption
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA512(),
            length=32,
            salt=salt,
            iterations=100000,  # Must match encryption iterations
            backend=default_backend()
        )
        key = kdf.derive(encryption_key.encode('utf-8'))
        
        # Create cipher with the IV and tag
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv, tag),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        
        # Add the same associated data used during encryption
        decryptor.authenticate_additional_data(b'hedera-topic-message')
        
        # Decrypt the ciphertext
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        
        # Return the decrypted message as a string
        return plaintext.decode('utf-8')
        
    except ValueError as e:
        log(f"Error: Invalid encrypted message format - {e}")
        raise
    except Exception as e:
        log(f"Error: Failed to decrypt message - {e}")
        log("This could be due to:")
        log("  - Wrong encryption key")
        log("  - Tampered or corrupted data")
        log("  - Message was not encrypted with the expected algorithm")
        raise


def is_encrypted_format(content: str) -> bool:
    """
    Check if content matches encrypted format (iv:tag:ciphertext)
    """
    if not isinstance(content, str) or ':' not in content:
        return False
    
    parts = content.split(':')
    if len(parts) != 3:
        return False
    
    # Try to decode base64 parts
    try:
        for part in parts:
            b64decode(part)
        return True
    except Exception:
        return False


def fetch_from_ipfs_gateway(ipfs_hash: str, gateway: str = 'cloudflare-ipfs.com', timeout: int = 10) -> str:
    """
    Fetch content from a specific IPFS gateway.
    
    Args:
        ipfs_hash: The IPFS hash (e.g., "QmXXX" or "bafyXXX")
        gateway: The gateway hostname (default: cloudflare-ipfs.com)
        timeout: Request timeout in seconds
        
    Returns:
        The content as a string
    """
    url = f"https://{gateway}/ipfs/{ipfs_hash}"
    
    try:
        response = requests.get(url, timeout=timeout, headers={
            'Accept': '*/*',
            'User-Agent': 'Pawnshop-NFT-Agent/1.0'
        })
        response.raise_for_status()
        return response.text
    except Exception as e:
        raise Exception(f"Failed to fetch from {gateway}: {str(e)}")


def fetch_from_ipfs_gateways(ipfs_hash: str) -> str:
    """
    Try to fetch content from multiple IPFS gateways.
    
    Args:
        ipfs_hash: The IPFS hash to fetch
        
    Returns:
        The content as a string
        
    Raises:
        Exception: If all gateways fail
    """
    gateways = [
        'cloudflare-ipfs.com',
        'ipfs.io',
        'dweb.link',
        'gateway.pinata.cloud'
    ]
    
    errors = []
    for gateway in gateways:
        try:
            content = fetch_from_ipfs_gateway(ipfs_hash, gateway)
            return content
        except Exception as e:
            error_msg = f"{gateway}: {str(e)}"
            errors.append(error_msg)
            log(f"✗ {error_msg}")
    
    raise Exception(f"All IPFS gateways failed. Errors: {'; '.join(errors)}")


def fetch_json_from_ipfs(ipfs_url: str, encryption_key: Optional[str] = None) -> Any:
    """
    Fetch and optionally decrypt JSON content from IPFS.
    
    Args:
        ipfs_url: IPFS URL (e.g., "ipfs://QmXXX" or just "QmXXX")
        encryption_key: Optional encryption key for decryption
        
    Returns:
        Parsed JSON object
        
    Raises:
        Exception: If fetch fails or JSON parsing fails
    """
    # Extract hash from URL
    ipfs_hash = ipfs_url.replace('ipfs://', '').replace('/metadata.json', '').replace('/metadata', '')
        
    # Fetch content from IPFS gateways
    content = fetch_from_ipfs_gateways(ipfs_hash)
    
    # Check if content is encrypted and decrypt if key provided
    decrypted = content
    if encryption_key and is_encrypted_format(content):
        try:
            log("Encrypted content detected, attempting decryption...")
            decrypted = decrypt_message(content, encryption_key)
            log("✓ Content decrypted successfully")
        except Exception as e:
            log(f"⚠ Decryption failed: {e}")
            log("Attempting to parse as plain content...")
            decrypted = content
    else:
        log("Content is not encrypted or no encryption key provided")
    
    # Try to parse as JSON
    try:
        # First, try to parse as JSON directly
        try:
            return json.loads(decrypted)
        except json.JSONDecodeError:
            # If that fails, check if it's an IPFS hash itself (nested IPFS reference)
            if decrypted.startswith('Qm') or decrypted.startswith('bafy'):
                log(f"Content is a nested IPFS reference: {decrypted}")
                # Recursively fetch the nested content
                return fetch_json_from_ipfs(decrypted, encryption_key)
            else:
                # Return as plain string if not JSON
                return decrypted
    except Exception as e:
        raise Exception(f"Failed to parse JSON from IPFS content: {str(e)}")


def process_topic_message(base64_message: str, encryption_key: Optional[str] = None) -> dict:
    """
    Process a topic message from Hedera, handling decryption and IPFS fetching.
    
    Args:
        base64_message: Base64-encoded message from Hedera topic
        encryption_key: Optional encryption key for decryption
        
    Returns:
        Dictionary with processed message data
    """
    try:
        # Decode base64 from Hedera
        message_content = b64decode(base64_message).decode('utf-8')
        log(f"Decoded message: {message_content[:100]}...")
        
        # Try to parse as JSON first
        try:
            parsed = json.loads(message_content)
            return {
                'type': 'plain_json',
                'content': parsed
            }
        except json.JSONDecodeError:
            pass  # Not JSON, continue processing
        
        # Check if it's encrypted content
        if encryption_key and is_encrypted_format(message_content):
            try:
                log("Encrypted content detected, decrypting...")
                decrypted = decrypt_message(message_content, encryption_key)
                
                # Try to parse decrypted content as JSON
                try:
                    return {
                        'type': 'encrypted_json',
                        'encrypted': True,
                        'content': json.loads(decrypted)
                    }
                except json.JSONDecodeError:
                    return {
                        'type': 'encrypted_text',
                        'encrypted': True,
                        'content': decrypted
                    }
            except Exception as e:
                log(f"Decryption failed: {e}")
                return {
                    'type': 'error',
                    'error': f"Decryption failed: {str(e)}",
                    'raw_content': message_content
                }
        
        # Check if it's an IPFS hash
        if message_content.startswith('Qm') or message_content.startswith('bafy'):
            try:
                log(f"IPFS hash detected: {message_content}")
                ipfs_data = fetch_json_from_ipfs(message_content, encryption_key)
                return {
                    'type': 'ipfs',
                    'ipfs_hash': message_content,
                    'content': ipfs_data
                }
            except Exception as e:
                return {
                    'type': 'ipfs_error',
                    'ipfs_hash': message_content,
                    'error': str(e)
                }
        
        # Plain text message
        return {
            'type': 'plain_text',
            'content': message_content
        }
        
    except Exception as e:
        return {
            'type': 'error',
            'error': str(e),
            'base64': base64_message
        }


# Example usage and test function
def test_encryption_decryption():
    """
    Test function to verify encryption and decryption work correctly.
    This requires the encrypt_message function from gold_evaluator.py
    """
    from gold_evaluator import encrypt_message
    
    # Test data
    original_message = "Hello, this is a secret message!"
    encryption_key = "my-secret-key-12345"
    
    print("=" * 60)
    print("Test 1: Basic Encryption/Decryption")
    print("=" * 60)
    print("Original message:", original_message)
    
    # Encrypt
    encrypted = encrypt_message(original_message, encryption_key)
    print("Encrypted:", encrypted)
    
    # Decrypt
    decrypted = decrypt_message(encrypted, encryption_key)
    print("Decrypted:", decrypted)
    
    # Verify
    assert original_message == decrypted, "Decryption failed: messages don't match!"
    print("✓ Encryption/Decryption test passed!")
    
    # Test with wrong key
    print("\n" + "=" * 60)
    print("Test 2: Wrong Key Detection")
    print("=" * 60)
    try:
        wrong_decrypted = decrypt_message(encrypted, "wrong-key")
        print("✗ Should have failed with wrong key!")
    except Exception:
        print("✓ Correctly rejected wrong encryption key")
    
    # Test encrypted format detection
    print("\n" + "=" * 60)
    print("Test 3: Encrypted Format Detection")
    print("=" * 60)
    print(f"Is encrypted format (encrypted): {is_encrypted_format(encrypted)}")
    print(f"Is encrypted format (plain text): {is_encrypted_format('plain text')}")
    print(f"Is encrypted format (JSON): {is_encrypted_format('{\"key\": \"value\"}')}")
    print("✓ Format detection test passed!")


def test_ipfs_fetch():
    """
    Test fetching from IPFS (requires a valid IPFS hash)
    """
    print("\n" + "=" * 60)
    print("Test 4: IPFS Fetch")
    print("=" * 60)
    
    # Example IPFS hash - replace with a valid one for testing
    test_hash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"  # "Hello, World!" example
    
    try:
        content = fetch_json_from_ipfs(test_hash)
        print(f"✓ Successfully fetched from IPFS: {content}")
    except Exception as e:
        print(f"⚠ IPFS fetch test skipped or failed: {e}")


if __name__ == "__main__":
    # Run tests if executed directly
    test_encryption_decryption()
    # Uncomment to test IPFS fetching
    # test_ipfs_fetch()

