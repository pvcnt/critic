import { expect, test } from "vitest";
import {
  encryptSymmetric,
  decryptSymmetric,
  generateKey,
} from "../../app/lib/crypto.server";

test("should encrypt and decrypt", async () => {
  const key = await generateKey();
  const plaintext = "lorem ipsum";
  const { ciphertext, iv } = await encryptSymmetric(plaintext, key);
  const secret = await decryptSymmetric(ciphertext, iv, key);
  expect(secret).toEqual(plaintext);
});
