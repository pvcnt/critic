export async function encryptSymmetric(plaintext: string, key: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedPlaintext = new TextEncoder().encode(plaintext);
  const secretKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(key, "base64"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    secretKey,
    encodedPlaintext,
  );
  return {
    ciphertext: Buffer.from(ciphertext).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
}

export async function decryptSymmetric(
  ciphertext: string,
  iv: string,
  key: string,
) {
  // prepare the secret key
  const secretKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(key, "base64"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  // decrypt the encrypted text "ciphertext" with the secret key and IV
  const cleartext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(iv, "base64"),
    },
    secretKey,
    Buffer.from(ciphertext, "base64"),
  );

  // decode the text and return it
  return new TextDecoder().decode(cleartext);
}

export async function generateKey() {
  const privateKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  return Buffer.from(await crypto.subtle.exportKey("raw", privateKey)).toString(
    "base64",
  );
}
