# -*- coding: utf-8 -*
import os
import shutil

from tempfile import mkdtemp

from twisted.trial import unittest

from globaleaks.utils.securetempfile import SecureTemporaryFile

TEST_DATA = b"Hello, world! This is a test data for writing, seeking and reading operations."

class TestSecureTemporaryFiles(unittest.TestCase):
    def setUp(self):
        self.storage_dir = mkdtemp()
        self.ephemeral_file = SecureTemporaryFile(self.storage_dir)

    def tearDown(self):
        shutil.rmtree(self.storage_dir)

    def test_create_and_write_file(self):
        with self.ephemeral_file.open('w') as file:
            for x in range(10):
                self.assertEqual(self.ephemeral_file.size, x * len(TEST_DATA))
                file.write(TEST_DATA)

        self.assertTrue(os.path.exists(self.ephemeral_file.filepath))
        self.assertEqual(self.ephemeral_file.size, len(TEST_DATA) * 10)

        with self.ephemeral_file.open('r') as file:
            for _ in range(10):
                self.assertEqual(file.read(len(TEST_DATA)), TEST_DATA)

    def test_file_cleanup(self):
        path_copy = self.ephemeral_file.filepath
        del self.ephemeral_file
        self.assertFalse(os.path.exists(path_copy))
