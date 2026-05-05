import base64
import os

import pytest

from sniping import crypto


def test_round_trip():
    plaintext = b"\x00\x01" + os.urandom(64) + b"\xff"
    blob = crypto.encrypt(plaintext)
    assert crypto.decrypt(blob) == plaintext


def test_each_encryption_uses_fresh_nonce():
    msg = b"same message twice"
    a = crypto.encrypt(msg)
    b = crypto.encrypt(msg)
    assert a != b, "ciphertexts must differ even with identical plaintext"
    assert crypto.decrypt(a) == msg
    assert crypto.decrypt(b) == msg


def test_tampered_ciphertext_fails(monkeypatch):
    plaintext = b"sensitive secret key data"
    blob = crypto.encrypt(plaintext)
    raw = bytearray(base64.b64decode(blob))
    # Flip a byte inside the AEAD body.
    raw[-1] ^= 0x01
    tampered = base64.b64encode(bytes(raw)).decode()
    with pytest.raises(crypto.DecryptError):
        crypto.decrypt(tampered)


def test_decrypt_rejects_garbage():
    with pytest.raises(crypto.DecryptError):
        crypto.decrypt("not-base64!!!")
    with pytest.raises(crypto.DecryptError):
        crypto.decrypt(base64.b64encode(b"too short").decode())


def test_missing_master_key_raises(monkeypatch):
    monkeypatch.delenv("SHADE_MASTER_KEY", raising=False)
    with pytest.raises(crypto.MissingMasterKey):
        crypto.encrypt(b"x")
    with pytest.raises(crypto.MissingMasterKey):
        crypto.decrypt(crypto.generate_master_key_b64())  # any base64 will do


def test_invalid_master_key_size(monkeypatch):
    monkeypatch.setenv("SHADE_MASTER_KEY", base64.b64encode(b"short").decode())
    with pytest.raises(crypto.MissingMasterKey):
        crypto.encrypt(b"x")


def test_wrong_master_key_cannot_decrypt(monkeypatch):
    blob = crypto.encrypt(b"top secret")
    other_key = base64.b64encode(b"\x02" * 32).decode()
    monkeypatch.setenv("SHADE_MASTER_KEY", other_key)
    with pytest.raises(crypto.DecryptError):
        crypto.decrypt(blob)


def test_generate_master_key_b64_is_32_bytes():
    key = crypto.generate_master_key_b64()
    assert len(base64.b64decode(key)) == 32
