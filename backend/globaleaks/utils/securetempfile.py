# -*- coding: utf-8
import os
import uuid
from cryptography.hazmat.primitives.ciphers import Cipher
from cryptography.hazmat.primitives.ciphers.algorithms import ChaCha20

CHUNK_SIZE = 4096

class SecureTemporaryFile:
    fd = enc = dec = None

    def __init__(self, filesdir):
        """
        Initializes an ephemeral file with ChaCha20 encryption.
        Creates a new random file path and generates a unique encryption key and nonce.

        :param filesdir: The directory where the ephemeral file will be stored.
        :param filenames: Optional filename. If not provided, a UUID4 is used.
        """
        filename = str(uuid.uuid4())
        self.filepath = os.path.join(filesdir, filename)
        self.cipher = Cipher(ChaCha20(os.urandom(32), os.urandom(16)), mode=None)

    @property
    def size(self):
        """
        Returns the size of the encrypted file that is the same of the plaintext file
        """
        try:
            return os.stat(self.filepath).st_size
        except:
            return 0

    def open(self, flags, mode=0o660):
        """
        Opens the ephemeral file for reading or writing.

        :param mode: 'w' for writing, 'r' for reading.
        :return: The file object.
        """
        if self.fd:
            self.close()

        self.fd = os.open(self.filepath, os.O_RDWR | os.O_CREAT | os.O_APPEND, mode)
        os.chmod(self.filepath, mode)

        self.enc = self.cipher.encryptor()
        self.dec = self.cipher.decryptor()

        return self

    def write(self, data):
        """
        Writes encrypted data to the file.

        :param data: Data to write to the file, can be a string or bytes.
        """
        os.write(self.fd, self.enc.update(data))

    def read(self, size=None):
        """
        Reads data from the current position in the file.

        :param size: The number of bytes to read. If None, reads until the end of the file.
        :return: The decrypted data read from the file.
        """
        data = b""
        bytes_read = 0

        while True:
            # Determine how much to read in this chunk
            chunk_size = min(CHUNK_SIZE, size - bytes_read) if size is not None else CHUNK_SIZE

            chunk = os.read(self.fd, chunk_size)
            if not chunk:  # End of file
                break

            data += self.dec.update(chunk)
            bytes_read += len(chunk)

            if size is not None and bytes_read >= size:
                break

        return data

    def close(self):
        """
        Closes the file descriptor.
        """
        if self.fd:
            os.close(self.fd)
            del self.enc
            del self.dec
            self.fd = self.enc = self.dec = None

    def __enter__(self):
        """
        Allows the use of the file in a 'with' statement.
        """
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Ensures the file is closed when exiting a 'with' statement.
        """
        self.close()

    def __del__(self):
        """
        Ensures the file is cleaned up by closing it and removing the file.
        """
        self.close()
        try:
            os.unlink(self.filepath)
        except FileNotFoundError:
            pass
