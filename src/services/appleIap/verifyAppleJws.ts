import { X509Certificate } from 'crypto';
import { decodeProtectedHeader, importX509, jwtVerify } from 'jose';

const APPLE_ROOT_CA_G3_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgwMDAwWhcNMzkwNDMwMTgwMDAwWjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLzAzLAq+KFc8b7MhBt3v3/YOJi3Mw4rI4+CmHp/7IDGo
1ymso8TUIsMzZ5jQ6t1d/maB+yka6MEF6a0YM4P9Bp4t7XSHIN7W8Si0A3mHAWj
YMH9V6X5f/i4sPvB/3/mvE+1S8=
-----END CERTIFICATE-----`;

export interface AppleTransactionPayload {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  bundleId?: string;
  expiresDate?: number;
  revocationDate?: number;
  environment?: string;
  purchaseDate?: number;
}

const toPem = (derBase64: string): string =>
  `-----BEGIN CERTIFICATE-----\n${derBase64.match(/.{1,64}/g)?.join('\n') ?? derBase64}\n-----END CERTIFICATE-----`;

const verifyCertificateChain = (x5c: string[]): void => {
  if (!x5c.length) {
    throw new Error('Certificado Apple inválido');
  }
  const root = new X509Certificate(APPLE_ROOT_CA_G3_PEM);
  let issuer = root;
  for (let i = x5c.length - 1; i >= 0; i -= 1) {
    const cert = new X509Certificate(toPem(x5c[i]));
    if (!cert.checkIssued(issuer)) {
      throw new Error('Cadena de certificados Apple inválida');
    }
    issuer = cert;
  }
};

export const verifyAppleSignedTransaction = async (
  signedTransactionInfo: string,
): Promise<AppleTransactionPayload> => {
  const trimmed = signedTransactionInfo?.trim();
  if (!trimmed) {
    throw new Error('Transacción Apple inválida');
  }

  const header = decodeProtectedHeader(trimmed);
  const x5c = header.x5c;
  if (!Array.isArray(x5c) || x5c.length === 0) {
    throw new Error('Transacción Apple sin certificado');
  }

  verifyCertificateChain(x5c);

  const leafPem = toPem(x5c[0]);
  const publicKey = await importX509(leafPem, 'ES256');
  const { payload } = await jwtVerify(trimmed, publicKey, {
    algorithms: ['ES256'],
  });

  return payload as AppleTransactionPayload;
};

export const getExpectedAppleBundleId = (): string =>
  process.env.APPLE_BUNDLE_ID?.trim() || 'com.underc0de.org';

export const getExpectedAppleProductId = (): string =>
  process.env.APPLE_PRO_PRODUCT_ID?.trim() || 'com.underc0d3e.pro.monthly';
